<template>
	<b-container class="mt-3">
		<b-row>
			<b-col>
				<b-tabs v-if="rawContract" content-class="mt-3">
					<b-tab title="Smart Contract" active>
						<SmartContract :smartContract="rawContract" :deploy="shouldDeploy" />
					</b-tab>
					<b-tab v-if="rawContract.hasWhitelist" title="Whitelist" lazy>
						<Whitelist :smartContract="rawContract" />
					</b-tab>
					<b-tab title="Mint Page" lazy>
						<MintPage :smartContractId="rawContract.id" />
					</b-tab>
					<b-tab title="Snapshot" lazy>
						<Snapshot :smartContract="rawContract" />
					</b-tab>
					<b-tab title="Gated Access" :disabled="true">
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
import Snapshot from '@/components/smart-contract-dashboard/Snapshot'


export default {
	middleware: 'authenticated',
	components: {
		SmartContract,
		Whitelist,
		MintPage,
		Snapshot
	},
	data: () => ({
		rawContract: null,
		shouldDeploy: false
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-id',
	async fetch() {
		try {
			const { data } = await this.$axios.get(
				`/users/${this.userId}/smartcontracts/${this.$route.query['id']}`
			)
			this.shouldDeploy = this.$route.query['deploy'] === 'true'
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
