<template>
	<b-container class="mt-5">
		<b-alert :show="isOwnerMismatch" variant="warning">
			Connected wallet address {{ $wallet.accountCompact }} is not the smart contract owner. Please switch to {{ compactOwnerAddress }} to perform updates.
		</b-alert>
		<b-tabs content-class="mt-3">
			<b-tab title="Smart Contract" active>
				<SmartContract :smartContract="rawContract" />
			</b-tab>
			<b-tab v-if="rawContract.hasWhitelist" :disabled="!rawContract" title="Whitelist" lazy>
				<Whitelist :smartContract="rawContract" />
			</b-tab>
			<b-tab title="Mint Page" :disabled="!rawContract" lazy>
				<MintPage :smartContractId="rawContract.id" />
			</b-tab>
		</b-tabs>
	</b-container>
</template>

<script>
import { mapGetters, mapState , mapMutations} from 'vuex'
import { SALE_STATUS } from '@/constants'
import { ethers } from 'ethers'

import SmartContract from '@/components/smart-contract-dashboard/SmartContract'
import Whitelist from '@/components/smart-contract-dashboard/Whitelist'
import MintPage from '@/components/smart-contract-dashboard/MintPage'

export default {
	middleware: 'authenticated',
	components: {
		SmartContract,
		Whitelist,
		MintPage
	},
	data: () => ({
		rawContract: {},
		contract: {},
		isReady: false,
		currentOwner: null
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		try {
			this.setBusy({isBusy: true})

			const { data } = await this.$axios.get(
				`/users/${this.userId}/smartcontracts/${this.$route.params.id}`
			)
			this.rawContract = data

			const { address, abi } = this.rawContract

			if (this.isOnWrongNetwork) {
				await this.$wallet.switchNetwork(this.rawContract.chainId)
			}

			this.contract = new ethers.Contract(
				address,
				abi,
				this.$wallet.provider.getSigner()
			)
			this.isReady = !!(await this.contract.deployed())

			if (this.isReady) {
				await this.onRefreshBalance()
				const saleStatus = await this.contract.saleStatus()
				this.saleStatus = SALE_STATUS[saleStatus]
				this.currentOwner = await this.contract.owner()
			}
			else {
				this.currentOwner = this.rawContract.owner
			}
		} catch (err) {
			console.error(err)
		} finally {
			this.setBusy({isBusy: false})
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
		isOwnerMismatch() {
			if(!this.currentOwner || !this.$wallet.account) return false
			return ethers.utils.getAddress(this.$wallet.account) !== ethers.utils.getAddress(this.currentOwner)
		},
		compactOwnerAddress() {
			if(!this.rawContract?.ownerAddress) return ''
			
			const addr = this.rawContract.ownerAddress
			return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`
		},
		isOnWrongNetwork() {
			return this.$wallet.chainId !== +this.rawContract.chainId
		},
	},
	methods: {
		...mapMutations(['setBusy'])
	}
}
</script>
