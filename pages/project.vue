<template>
	<b-container class="mt-3">
		<b-row>
			<b-col>
				<b-tabs v-if="project" content-class="mt-3">
					<b-tab title="Smart Contract" active>
						<SmartContract :smartContract="project" @ready="onReady" />
					</b-tab>
					<b-tab title="Assets" lazy>
						<Assets :smartContract="project" />
					</b-tab>
					<b-tab
						v-if="project.hasWhitelist"
						title="Whitelist"
						lazy
						:disabled="!isDeployed">
						<Whitelist :smartContractId="project.id" />
					</b-tab>
					<b-tab
						v-if="project.hasDelayedReveal"
						title="Delayed Reveal"
						lazy
						:disabled="!isDeployed">
						<DelayedReveal :smartContract="project" />
					</b-tab>
					<b-tab v-if="!isImported" title="Mint Page" lazy>
						<MintPage :smartContractId="project.id" />
					</b-tab>
					<b-tab title="Snapshot" lazy :disabled="!isDeployed">
						<Snapshot :smartContract="project" />
					</b-tab>
					<b-tab v-if="!isImported" title="Source Code" lazy>
						<SourceCode :smartContract="project" />
					</b-tab>
					<b-tab v-if="!isImported" title="Other" lazy>
						<Config :smartContractId="project.id" />
					</b-tab>
				</b-tabs>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { mapMutations } from 'vuex'
import { ethers } from 'ethers'
import useSmartContract from '@/hooks/useSmartContract'
import SmartContract from '@/components/project-dashboard/SmartContract'
import Assets from '@/components/project-dashboard/Assets'
import Whitelist from '@/components/project-dashboard/Whitelist'
import DelayedReveal from '@/components/project-dashboard/DelayedReveal'
import MintPage from '@/components/project-dashboard/MintPage'
import Snapshot from '@/components/project-dashboard/Snapshot'
import SourceCode from '@/components/project-dashboard/SourceCode'
import Config from '@/components/project-dashboard/Config'

export default {
	middleware: 'authenticated',
	components: {
		SmartContract,
		Assets,
		Whitelist,
		DelayedReveal,
		MintPage,
		Snapshot,
		SourceCode,
		Config,
	},
	data: () => ({
		isDeployed: false,
	}),
	async asyncData({ $axios, route, store }) {
		const { data: project } = await $axios.get(
			`/users/${store.getters.userId}/smartcontracts/${route.query.id}`
		)
		return { project, contract: useSmartContract(project) }
	},
	computed: {
		isImported() {
			return this.project?.isImported
		},
	},
	watch: {
		'$wallet.account': {
			handler: 'checkOwner',
			immediate: true
		},
	},
	methods: {
		...mapMutations(['addAlert', 'removeAlert']),
		async onReady() {
			this.isDeployed = true
			this.project.ownerAddress = await this.contract.owner()
		},
		checkOwner(newVal, oldVal) {
			if (!this.project.ownerAddress) return

			const hasError = !newVal || (
				ethers.utils.getAddress(newVal) !==
				ethers.utils.getAddress(this.project.ownerAddress)
			)

			if (hasError) {
				const addr = this.project.ownerAddress
				const addrTo = `${addr.substring(0, 4)}...${addr.substring(
					addr.length - 4
				)}`
				this.addAlert({
					id: 'smartContractOwnerMismatch',
					show: true,
					text: `Connected wallet "${this.$wallet.accountCompact}" is not the smart contract owner. Please connect wallet "${addrTo}" to perform updates.`,
				})
			} else {
				this.removeAlert('smartContractOwnerMismatch')
			}
		},
	},
}
</script>

<style lang="scss">
.nav-tabs .nav-link.disabled {
	pointer-events: all;
	cursor: not-allowed;
}
</style>
