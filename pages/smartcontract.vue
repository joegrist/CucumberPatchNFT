<template>
	<b-container class="mt-3">
		<b-row>
			<b-col>
				<b-tabs v-if="rawContract" content-class="mt-3">
					<b-tab title="Smart Contract" active>
						<SmartContract :smartContract="rawContract" />
					</b-tab>
					<b-tab v-if="rawContract.hasWhitelist" title="Whitelist" lazy>
						<Whitelist :smartContractId="rawContract.id" />
					</b-tab>
					<b-tab v-if="rawContract.hasDelayedReveal" title="Delayed Reveal" lazy>
						<DelayedReveal :smartContract="rawContract" />
					</b-tab>
					<b-tab v-if="!isImported" title="Mint Page" lazy>
						<MintPage :smartContractId="rawContract.id" />
					</b-tab>
					<b-tab title="Snapshot" lazy>
						<Snapshot :smartContract="rawContract" />
					</b-tab>
					<b-tab v-if="!isImported" title="Other" lazy>
						<Config :smartContractId="rawContract.id" />
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
import DelayedReveal from '@/components/smart-contract-dashboard/DelayedReveal'
import MintPage from '@/components/smart-contract-dashboard/MintPage'
import Snapshot from '@/components/smart-contract-dashboard/Snapshot'
import Config from '@/components/smart-contract-dashboard/Config'

export default {
	middleware: 'authenticated',
	components: {
		SmartContract,
		Whitelist,
		DelayedReveal,
		MintPage,
		Snapshot,
		Config
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
		isImported() {
			return this.rawContract?.isImported
		}
	},
}
</script>
