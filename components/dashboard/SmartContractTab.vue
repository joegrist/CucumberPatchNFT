<template>
    <b-tab title="Contract" active no-body>
		<b-card-title class="text-center pt-2">
			<h5 class="m-0">{{ sc.name | startCase }} {{ isTestnet(sc.chainId) ? '(Testnet)' : '(Mainnet)'}}</h5>
		</b-card-title>
		<b-card-text class="px-1">
			<ul>
				<li>Symbol: {{ sc.symbol }}</li>
				<li>Price: {{ sc.mintPrice }} {{ getCurrency(sc.chainId) }}</li>
				<li>Blockchain: {{ sc.blockchain | blockchainName }}</li>
				<li>Network: {{ getNetwork(sc.chainId) }}</li>
				<li>Whitelist: {{ sc.hasWhitelist | yesNo }}</li>
				<li>Delayed Reveal: {{ sc.hasDelayedReveal | yesNo }}</li>
				<li class="text-info">Status: {{sc.isDeployed ? 'Live': 'Draft'}}</li>
				<li>Created: {{ sc.createdOn | toDate }}</li>
			</ul>
		</b-card-text>
		<b-card-footer>
			<b-button
				v-if="sc.isDeployed"
				class="bg-gradient-primary border-0"
				size="sm"
				:to="`/smart-contracts/${sc.id}`"
				>Manage</b-button
			>
			<b-button
				v-if="sc.isDeployed"
				variant="info border-0"
				size="sm"
				target="_blank"
				:href="`${getExplorerUrl(sc.chainId)}/address/${sc.address}`"
				>View <b-icon icon="box-arrow-up-right"/></b-button
			>
			<b-button v-else variant="primary" size="sm" @click="onEdit(sc)"
				>Edit/Deploy</b-button
			>
		</b-card-footer>
    </b-tab>
</template>

<script>

import { mapMutations, mapGetters } from 'vuex'
import { getExplorerUrl, getCurrency, getNetwork, isTestnet } from '@/constants/metamask'

export default {
	props:{
		sc: Object,
	},
	computed: {
        ...mapGetters(['userId']),
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder']),
		getExplorerUrl,
		getCurrency,
		getNetwork,
		isTestnet,
		onEdit(sc) {
			this.updateSmartContractBuilder({...sc})
			this.$router.push('/wizard')
		}
	},
}
</script>