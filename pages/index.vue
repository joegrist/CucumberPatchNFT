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
					placeholder="Start typing the smart contract name.." />
				<b-input-group-append>
					<b-button variant="primary" class="border-0" to="/wizard"
						>Add New</b-button
					>
				</b-input-group-append>
			</b-input-group>
		</div>
		<b-overlay :show="isBusy" opacity="1">
			<b-card-group v-if="dashboardItems.length > 0" columns>
				<DashboardCard
					v-for="sc in filteredItems"
					:key="sc.id"
					:sc="sc"
					@create-site="showWebsiteModal" />
			</b-card-group>
			<div v-else class="text-center pt-2">
				<h1>You Don't Have Any Contracts Yet</h1>
				<b-button
					variant="primary"
					@click="$router.push('/wizard')"
					>Create One</b-button
				>
			</div>
		</b-overlay>
		<b-modal
			id="siteModal"
			title="Add Minting Page"
			size="lg"
			centered
			@hidden="newWebsite = {}"
			@ok="onDeploySite"
			ok-title="Create"
			ok-variant="primary"
			no-close-on-backdrop
			:busy="isBusy">
			<b-form>
				<b-form-group
					label="Title"
					label-class="required"
				>
					<b-form-input
						id="title"
						name="title"
						v-model="newWebsite.title"
						type="text"
						placeholder="Bored Apes Yacht Club"
						required></b-form-input>
				</b-form-group>
				<div class="d-flex">
					<b-form-group
						label="Drop Date"
						description="Sets the countdown timer. Can be updated later"
						class="pr-1 w-50">
						<b-form-input
							id="dropDateInput"
							name="dropDateInput"
							v-model="newWebsite.dropDateInput"
							type="date"
							:min="new Date().toISOString().split('T')[0]"></b-form-input>
					</b-form-group>
					<b-form-group
						label="Drop Time"
						description="Sets the countdown timer. Can be updated later"
						class="pl-1 w-50">
						<b-form-input
							id="dropTimeInput"
							name="dropTimeInput"
							v-model="newWebsite.dropTimeInput"
							type="time"></b-form-input>
					</b-form-group>
				</div>
			</b-form>
		</b-modal>
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
			newWebsite: {},
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
			const filtered = this.dashboardItems.filter(
				(x) =>
					x.name.toLowerCase().includes(term) ||
					x.symbol.toLowerCase().includes(term)
			)
			// console.log(this.dashboardItems, term, filtered)
			return filtered
		},
	},
	methods: {
		...mapMutations(['setDashboardItems', 'setBusy']),
		...mapActions(['loadDashboardCards']),
		showWebsiteModal(smartContractId) {
			const smartContract = this.dashboardItems.find(
				(x) => x.id === smartContractId
			)
			if(!smartContract) return
			if (smartContract.marketplace === MARKETPLACE.OpenSea) {
				this.newWebsite.marketplaceURL = smartContract.marketplaceCollection.url
			}

			this.newWebsite.smartContractId = smartContractId
			this.$bvModal.show('siteModal')
		},

		async onDeploySite(e) {
			e.preventDefault()

			if(this.newWebsite.backgroundImage?.size / (1024*1024) > 1){
				alert("Background image is too big. Max supported size is 1 mb.")
				return
			}

			if(this.newWebsite.icon?.size / (1024*1024) > 1){
				alert("Icon is too big. Max supported size is 1 mb.")
				return
			}

			this.setBusy(true)

			try {
				const { dropDateInput, dropTimeInput } = this.newWebsite
				this.newWebsite.dropDate = dropDateInput
				if (dropDateInput && dropTimeInput) {
					this.newWebsite.dropDate += `T${dropTimeInput}:00`
				}

				const payload = Object.keys(this.newWebsite).reduce((formData, key) => {
					if (this.newWebsite[key]) formData.append(key, this.newWebsite[key])
					return formData
				}, new FormData())

				const { data: createdSite } = await this.$axios.post(
					'/websites/widget',
					payload
				)

				this.$bvToast.toast(
					'Website submission successful! Please allow ~10 minutes for the website to get deployed.',
					{
						title: 'Website',
						variant: 'success',
					}
				)
				
				this.$bvModal.hide('siteModal')
				this.$router.push(`/websites/${createdSite.id}`)
			} catch (err) {
				console.error({ err })
				this.$bvToast.toast(err.message || 'Failed to deploy the website', {
					title: 'Website',
					variant: 'danger',
				})
			} finally {
				this.setBusy(false)
			}
		},
	},
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss"></style>
