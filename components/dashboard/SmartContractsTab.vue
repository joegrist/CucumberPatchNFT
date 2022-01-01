<template>
	<b-card-group v-if="items.length > 0" class="p-4" deck>
		<b-card v-for="sc in items" :key="sc.id">
			<template #header>
				<h6 class="mb-0">{{ sc.name | startCase }}</h6>
			</template>
			<b-card-text>
				<ul class="px-3">
					<li>Symbol: {{ sc.symbol }}</li>
					<li>Price: {{ sc.mintPrice }} {{ getCurrency(sc.chainId) }}</li>
					<li>Whitelist: {{ sc.hasWhitelist | yesNo }}</li>
					<li>Delayed Reveal: {{ sc.hasDelayedReveal | yesNo }}</li>
					<li>Blockchain: {{ sc.blockchain | blockchainName }}</li>
					<li class="text-info">Network: {{ getNetwork(sc.chainId) }}</li>
                    <li class="text-info">Status: {{sc.isDeployed ? 'Live': 'Draft'}}</li>
					<li>Created On {{ sc.createdOn }} </li>
				</ul>
			</b-card-text>
			<template #footer>
				<b-button
					v-if="sc.isDeployed"
					variant="primary"
					size="sm"
					target="_blank"
					:href="`${getExplorerUrl(sc.chainId)}/address/${sc.address}`"
					>View <b-icon icon="box-arrow-up-right"/></b-button
				>
				<b-button
					v-if="sc.isDeployed"
					variant="info"
					size="sm"
					:to="`/smart-contracts/${sc.id}`"
					>Interact</b-button
				>
				<b-button v-else variant="primary" size="sm" @click="onEdit(sc)"
					>Edit/Deploy</b-button
				>
			</template>
		</b-card>
	</b-card-group>
	<div v-else class="d-flex justify-content-center align-items-center h-100">
		<div class="d-flex flex-column">
			<h3>You don't have any smart contracts yet</h3>
			<b-button variant="primary" size="lg" to="/"
				>Create</b-button
			>
		</div>
	</div>
</template>

<script>
import { mapMutations } from 'vuex'
import { CHAINID_CONFIG_MAP, getExplorerUrl, getCurrency, getNetwork, isTestnet } from '@/constants/metamask'

export default {
	data: () => ({
		items: [],
		deployedAddress: null,
		isBusy: false
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-tab',
	async fetch() {
		if (!this.$wallet.account) return
		const { data } = await this.$axios.get('/smartcontracts', {
			params: { ownerAddress: this.$wallet.account },
		})
		this.items = data
		console.log('smart-contracts-tab', this.items)
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder']),
		getExplorerUrl,
		getCurrency,
		getNetwork,
		isTestnet,
		onEdit(sc) {
			this.updateSmartContractBuilder({ ...sc })
			this.$router.push('/')
		}
	},
}
</script>
