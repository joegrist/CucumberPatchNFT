<template>
	<div v-if="items.length > 0" class="m-3">
		<b-input-group size="lg" prepend="Seach:" class="mb-3">
			<b-form-input @input="val => searchTerm = val" debounce="500"/>
		</b-input-group>
		<b-card-group deck>
			<b-card v-for="sc in filteredItems" :key="sc.id">
				<template #header>
					<h6 class="mb-0">{{ sc.name | startCase }}</h6>
				</template>
				<b-card-text>
					<ul class="px-3">
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
	</div>
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
import { getExplorerUrl, getCurrency, getNetwork, isTestnet } from '@/constants/metamask'

export default {
	data: () => ({
		searchTerm: '',
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
	computed: {
		filteredItems() {
			return this.items.filter(x => x.name.includes(this.searchTerm) || x.symbol.includes(this.searchTerm))
		}
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
