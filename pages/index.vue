<template>
	<div class="p-3">
		<div class="d-flex justify-content-between">
			<b-input-group class="mb-3">
				<b-input-group-prepend>
					<b-input-group-text>
						<b-icon icon="search" />
					</b-input-group-text>
				</b-input-group-prepend>
				<b-form-input @input="(val) => (searchTerm = val)" debounce="500" placeholder="Start typing project name.." />
				<b-input-group-append>
					<b-button variant="primary" class="border-0" to="/wizard">Add New</b-button>
				</b-input-group-append>
			</b-input-group>
		</div>
		<b-row v-if="dashboardItems.length > 0" >
			<b-col md="6" lg="4" xl="3" v-for="(sc,idx) in filteredItems" :key="sc.id">
				<DashboardCard :sc="sc" class="mb-3"  :isTourCard="idx === 0" />
			</b-col>
		</b-row>
		<div v-else class="text-center pt-2">
			<h1>You Don't Have Any Projects Yet</h1>
			<b-button variant="primary" @click="$router.push('/wizard')">Start One</b-button>
		</div>
	</div>
</template>

<script>
import { mapActions, mapState,mapGetters } from 'vuex'

export default {
	middleware: 'authenticated',
	data() {
		return {
			searchTerm: '',
		}
	},
	fetchOnServer: false,
	fetchKey: 'dashboard',
	async fetch() {
		await this.loadDashboardCards()
		if (this.startProductTour && !this.dashboardItems.length) {
				this.$bvToast.toast('Create some projects to begin the tour.', {
					title: 'Product Tour',
					variant: 'success',
				})
		}
	},
	created() {
		const refCode = this.$route.query['ref']
		if (refCode) {
			sessionStorage.setItem('ref', refCode)
		}
	},
	computed: {
		...mapState(['dashboardItems',]),
		...mapGetters(['startProductTour']),
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
		...mapActions(['loadDashboardCards']),
	},
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss" />
