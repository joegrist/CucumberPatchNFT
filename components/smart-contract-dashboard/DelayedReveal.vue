<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4>{{ smartContract.name }} Delayed Reveal</h4>
			</b-col>
			<b-col sm="12" md="3">
				<b-overlay :show="isBusy">
					<b-button variant="success" block @click="update">Update</b-button>
				</b-overlay>
			</b-col>
		</b-row>
		<b-row>
			<b-col sm="12" md="6">
				<b-form-group label="URL">
					<b-input v-model="url" />
				</b-form-group>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { ethers } from 'ethers'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'

export default {
	props: {
		smartContract: Object,
	},
	data() {
		return {
			isBusy: false,
			contract: null,
			url: null,
		}
	},
	async created() {
		const { abi, address, chainId } = this.smartContract
		const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
		const jsonRpcProvider = new ethers.providers.StaticJsonRpcProvider(
			providerUrl
		)
		this.contract = new ethers.Contract(address, abi, jsonRpcProvider)
		this.url = await this.contract.preRevealURL()
	},
	methods: {
		async update() {
			try {
				if (this.$wallet.isConnected) {
					await this.$wallet.connect()
				}

				if (this.$wallet.chainId !== +this.smartContract.chainId) {
					await this.$wallet.switchNetwork(this.rawContract.chainId)
				}

				this.isBusy = true

				const signedContract = this.contract.connect(
					this.$wallet.provider.getSigner()
				)
				const gasPrice = await this.$wallet.provider.getGasPrice()
				console.info(
					`GAS PRICE: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`
				)

				const tx = await signedContract.setPreRevealUrl(this.url, {
					gasPrice,
				})

				this.$bvToast.toast('Update transaction accepted', {
					title: 'Delayed Reveal URL',
					variant: 'success',
				})

				tx.wait().then((_) => {
					this.$bvToast.toast('Update transaction complete', {
						title: 'Delayed Reveal URL',
						variant: 'success',
					})
				})
			} catch (err) {
				this.$bvToast.toast(err.message || 'Failed to update', {
					title: 'Delayed Reveal URL',
					variant: 'danger',
				})
			} finally {
				this.isBusy = false
			}
		},
	},
}
</script>
