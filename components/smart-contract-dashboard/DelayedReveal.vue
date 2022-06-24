<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4>Delayed Reveal</h4>
			</b-col>
			<b-col sm="12" md="3">
				<b-overlay :show="isBusy">
					<b-button variant="primary" block @click="save">Save</b-button>
				</b-overlay>
			</b-col>
		</b-row>
		<p v-show="url">Current Metadata URL: <b>{{ url }}</b></p>
		<!-- <b-row>
			<b-col>
				<b-form-group label="Existing metadata URL">
					<b-input v-model="url" />
				</b-form-group>
			</b-col>
		</b-row>
		<b-row>
			<b-col class="text-center">
				<h3>No Metadata? Create New!</h3>
			</b-col>
		</b-row> -->
		<b-row>
			<b-col>
				<b-form novalidate>
					<b-form-group label="Name">
						<b-input v-model="metadata.name" placeholder="e.g. Hidden Monkey"/>
					</b-form-group>
					<b-form-group label="Description">
						<b-form-textarea v-model="metadata.description" />
					</b-form-group>
					<b-form-group label="Image">
						<b-form-file v-model="metadata.image" accept="image/*"/>
					</b-form-group>
					<b-form-group>
						<template #label>
							<div class="d-flex">
								<ExternalLink text="nft.storage API key" href="https://nft.storage/docs/#get-an-api-token"></ExternalLink>
								<!-- <b-form-checkbox switch>Remember</b-form-checkbox> -->
							</div>
						</template>
						<b-form-input v-model="apiKey" />
					</b-form-group>
				</b-form>
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
			apiKey: null,
			metadata: {}
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
		async save() {
			// TODO: perform basic validation, upload image, then generate and upload json. get resulting hash, assign to this.url and commit()
			//..............
			//................
			// const metadataHash = 'bag3aar53fd'
			// this.url = `ipfs://${metadataHash}`
			// await this.commit()
		},
		async commit() {
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

				await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
					delayedRevealURL: this.url,
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
