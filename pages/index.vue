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
					id="search-bar"
					@input="(val) => (searchTerm = val)"
					debounce="500"
					placeholder="Start typing project name.."
				/>
				<b-input-group-append>
					<b-button
						id="add-new-btn"
						variant="primary"
						class="border-0"
						to="/wizard"
						>Add New</b-button
					>
				</b-input-group-append>
			</b-input-group>
		</div>
		<b-row v-if="dashboardItems.length > 0">
			<b-col md="6" lg="4" xl="3" v-for="sc in filteredItems" :key="sc.id">
				<DashboardCard :sc="sc" class="mb-3" />
			</b-col>
		</b-row>
		<div v-else class="text-center pt-2">
			<h1>You Don't Have Any Projects Yet</h1>
			<b-button variant="primary" size="lg" @click="$router.push('/wizard')"
				>Start One</b-button
			>
		</div>
		<b-modal
			id="tourModal"
			title="Would you like a tour?"
			centered
			hide-footer
			body-class="text-center p-3"
		>
			<div class="text-center mb-3">
				<b-button variant="primary" @click="onAcceptTour"
					>Yes, please!</b-button
				>
				<b-button @click="onDeclineTour">Maybe Later</b-button>
			</div>
			<span>💡 Can be started anytime from the Help navbar menu</span>
		</b-modal>
	</div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import ProductTour from '@/mixins/productTour'

export default {
	middleware: 'authenticated',
	mixins: [ProductTour],
	data() {
		return {
			searchTerm: '',
		}
	},
	async asyncData({ store }) {
		await store.dispatch('loadDashboardCards')
	},
	watch: {
		dashboardItems: {
			handler: function (newVal) {
				if (newVal.length > 0 && this.tourPrompts.dashboard) {
					this.$nextTick(() => {
						this.$bvModal.show('tourModal')
					})
				}
			},
			immediate: true,
		},
	},
	computed: {
		...mapState(['dashboardItems']),
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
		onAcceptTour() {
			this.$bvModal.hide('tourModal')
			this.initTour('dashboard')
			this.updateTourPrompts({
				dashboard: false,
			})
		},
		onDeclineTour() {
			this.$bvModal.hide('tourModal')
			this.updateTourPrompts({
				dashboard: false,
			})
		},
	},
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss" />
