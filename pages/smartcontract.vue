<template>
	<b-container class="mt-3">
		<b-row>
			<b-col>
				<b-tabs v-if="rawContract" content-class="mt-3">
					<b-tab title="Smart Contract" active>
						<SmartContract :smartContract="rawContract" />
					</b-tab>
					<b-tab v-if="rawContract.hasWhitelist" title="Whitelist" lazy>
						<Whitelist :smartContract="rawContract" />
					</b-tab>
					<b-tab title="Mint Page" lazy>
						<MintPage :smartContractId="rawContract.id" />
					</b-tab>
				</b-tabs>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

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
		rawContract: null,
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		try {
			const { data } = await this.$axios.get(
				`/users/${this.userId}/smartcontracts/${this.$route.query['id']}`
			)
			this.rawContract = data
		} catch (err) {
			console.error(err)
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
	},
}
</script>
