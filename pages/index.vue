<template>
	<div class="p-3">
		<div class="d-flex justify-content-between">
			<b-input-group class="mb-3">
				<b-input-group-prepend>
					<b-input-group-text>
						<b-icon icon="search" />
					</b-input-group-text>
				</b-input-group-prepend>
				<b-form-input
					@input="(val) => (searchTerm = val)"
					debounce="500"
					placeholder="Start typing project name.." />
				<b-input-group-append>
					<b-button variant="primary" class="border-0" to="/wizard"
						>Add New</b-button
					>
				</b-input-group-append>
			</b-input-group>
		</div>
		<b-card-group v-if="dashboardItems.length > 0" columns>
			<DashboardCard
				v-for="sc in filteredItems"
				:key="sc.id"
				:sc="sc"
			/>
		</b-card-group>
		<div v-else class="text-center pt-2">
			<h1>You Don't Have Any Projects Yet</h1>
			<b-button
				variant="primary"
				@click="$router.push('/wizard')"
				>Start One</b-button
			>
		</div>
	</div>
</template>

<script>
import { mapMutations, mapActions, mapGetters, mapState } from 'vuex'
import { MARKETPLACE } from '@/constants'

export default {
	middleware: 'authenticated',
	data() {
		return {
			MARKETPLACE,
			searchTerm: '',
		}
	},
	fetchOnServer: false,
	fetchKey: 'dashboard',
	async fetch() {
		await this.loadDashboardCards()
	},
	created(){
		const refCode = this.$route.query['ref']
		if(refCode) {
			sessionStorage.setItem('ref', refCode)
		}
	},
	computed: {
		...mapState(['dashboardItems', 'isBusy']),
		...mapGetters(['userId']),
		filteredItems() {
			const term = this.searchTerm.toLowerCase()
			return this.dashboardItems.filter(
				(x) =>
					x.name.toLowerCase().includes(term) ||
					x.symbol.toLowerCase().includes(term)
			)
		},
	},
	methods: {
		...mapMutations(['setDashboardItems', 'setBusy']),
		...mapActions(['loadDashboardCards'])
	},
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss"></style>
