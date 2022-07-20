<template>
	<b-container class="mt-3">
		<b-row>
			<b-col>
				<b-tabs v-if="rawContract" content-class="mt-3">
					<b-tab title="Smart Contract" active>
						<SmartContract :smartContract="rawContract" />
					</b-tab>
					<b-tab title="Assets">
						<Assets :smartContract="rawContract" />
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
					<b-tab v-if="!isImported" title="Source Code" lazy>
						<SourceCode :smartContract="rawContract" />
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

import SmartContract from '@/components/project-dashboard/SmartContract'
import Assets from '@/components/project-dashboard/Assets'
import Whitelist from '@/components/project-dashboard/Whitelist'
import DelayedReveal from '@/components/project-dashboard/DelayedReveal'
import MintPage from '@/components/project-dashboard/MintPage'
import Snapshot from '@/components/project-dashboard/Snapshot'
import Config from '@/components/project-dashboard/Config'
import SourceCode from '@/components/project-dashboard/SourceCode'

export default {
	middleware: 'authenticated',
	components: {
		SmartContract,
		Assets,
		Whitelist,
		DelayedReveal,
		MintPage,
		Snapshot,
		Config,
		SourceCode
	},
	data: () => ({
		rawContract: null,
	}),
	fetchOnServer: false,
	fetchKey: 'project-id',
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
