<template>
	<b-overlay :show="isBusy" opacity="1">
		<div class="p-3">
			<b-input-group class="mb-3">
				<b-input-group-prepend>
					<b-input-group-text>
						<b-icon icon="search" />
					</b-input-group-text>
				</b-input-group-prepend>
				<b-form-input @input="val => searchTerm = val" debounce="500" placeholder="Start typing the smart contract name.." />
			</b-input-group>
			<b-card-group v-if="dashboardItems.length > 0" columns>
				<DashboardCard v-for="sc in filteredItems" :key="sc.id" :sc="sc" @create-site="showWebsiteModal" />
			</b-card-group>
			<div v-else class="text-center pt-2">
				<h1>You Don't Have Any Contracts Yet</h1>
				<b-button class="bg-gradient-primary border-0 w-50" @click="$router.push('/wizard')">Create One</b-button>
			</div>
			<b-modal
				id="siteModal"
				title="Deploy Minting Website"
				size="lg"
				centered
				@hidden="newWebsite = {}"
				@ok="onCreateSite"
				ok-title="Deploy"
				ok-variant="success"
				no-close-on-backdrop
				:busy="isBusy">
				<!-- <p>Smart Contract: {{ $props.sc.name }}</p> -->
				<b-form>
					<b-form-group
						label="Website Name"
						label-class="required"
						description="Dispalyed on Google and as a browser tab title. Ours, for example, is Zero Code NFT Wizard">
						<b-form-input
							id="title"
							name="title"
							v-model="newWebsite.title"
							type="text"
							placeholder="Bored Apes Yacht Club"
							required></b-form-input>
					</b-form-group>
					<b-form-group label="Description" label-class="required">
						<b-form-input
							id="description"
							name="description"
							v-model="newWebsite.description"
							type="text"
							placeholder="10k unique NFTs"
							required></b-form-input>
					</b-form-group>
					<b-form-group
						label="Desired website domain (URL)"
						label-class="required">
						<b-form-input
							id="desiredDomain"
							name="desiredDomain"
							v-model="newWebsite.desiredDomain"
							type="url"
							placeholder="zerocodenft.com"
							required></b-form-input>
					</b-form-group>
					<div class="d-flex">
						<b-form-group label="Drop Date" description="Sets the countdown timer. Can be updated later." class="pr-1 w-50">
							<b-form-input
								id="dropDateInput"
								name="dropDateInput"
								v-model="newWebsite.dropDateInput"
								type="date"
								:min="new Date().toISOString().split('T')[0]"
								required></b-form-input>
						</b-form-group>
						<b-form-group label="Drop Time" description="Sets the countdown timer. Can be updated later." class="pl-1 w-50">
							<b-form-input
								id="dropTimeInput"
								name="dropTimeInput"
								v-model="newWebsite.dropTimeInput"
								type="time"
								required></b-form-input>
						</b-form-group>
					</div>
					<div class="d-flex">
						<b-form-group label="Twitter URL" class="pr-1 w-50">
							<b-form-input
								id="twitterUrl"
								name="twitterUrl"
								v-model="newWebsite.twitterUrl"
								type="url"
								required></b-form-input>
						</b-form-group>
						<b-form-group label="Discord URL" class="pl-1 w-50">
							<b-form-input
								id="discordURL"
								name="discordURL"
								v-model="newWebsite.discordURL"
								type="url"
								required></b-form-input>
						</b-form-group>
					</div>
					<div class="d-flex">
						<b-form-group label="Instagram URL" class="pr-1 w-50">
							<b-form-input
								id="instagramURL"
								name="instagramURL"
								v-model="newWebsite.instagramURL"
								type="url"
								required></b-form-input>
						</b-form-group>
						<b-form-group label="Marketplace URL" class="pl-1 w-50">
							<b-form-input
								id="marketplaceURL"
								name="marketplaceURL"
								v-model="newWebsite.marketplaceURL"
								type="url"
								required></b-form-input>
						</b-form-group>
					</div>
				</b-form>
			</b-modal>
		</div>
	</b-overlay>
</template>

<script>
import { mapMutations, mapGetters, mapState } from 'vuex'
import { MARKETPLACE } from '@/constants'

export default {
  middleware: 'authenticated',
  data() {
      return {
		  MARKETPLACE,
          searchTerm: '',
          isBusy: false,
          newWebsite: {},
      }
  },
  fetchOnServer: false,
	fetchKey: 'dashboard',
	async fetch() {
		this.isBusy = true

		const { data: contracts } = await this.$axios.get(`/users/${this.userId}/smartcontracts`)
        const { data: websites } = await this.$axios.get(`/users/${this.userId}/websites`)

        contracts.forEach(sc => {
            sc.website = websites.find(x =>sc.id === x.smartContractId)
        })

		this.setDashboardItems(contracts)

		this.isBusy = false

		// console.log('dashboard', this.dashboardItems)
	},
    computed: {
        ...mapState(['dashboardItems']),
        ...mapGetters(['userId']),
        filteredItems() {
            const term = this.searchTerm.toLowerCase()
            return this.dashboardItems.filter(x => x.name.toLowerCase().includes(term) || x.symbol.toLowerCase().includes(term))
        }
    },
    methods: {
		...mapMutations(['setDashboardItems']),

        showWebsiteModal(smartContractId) {
			const smartContract = this.dashboardItems.find(x => x.id === smartContractId)
			if(smartContract.marketplaceCollection?.marketpalce === MARKETPLACE.OpenSea) {
				this.newWebsite.marketplace = MARKETPLACE.OpenSea
				this.newWebsite.marketplaceURL = smartContract.marketplaceCollection.url
			}
            this.newWebsite.smartContractId = smartContractId
            this.$bvModal.show("siteModal")
        },

        async onCreateSite(e) {
			e.preventDefault()
			this.isBusy = true

			try {
				const { dropDateInput, dropTimeInput } = this.newWebsite
				this.newWebsite.dropDate = dropDateInput
				if(dropTimeInput) {
					this.newWebsite.dropDate += `T${dropTimeInput}:00`
				}

				const { data: createdSite} = await this.$axios.post('websites', this.newWebsite)

				this.$bvModal.hide('siteModal')
				this.$bvToast.toast('Website submission successful! Please allow ~10 minutes for the website to get deployed.', {
					title: 'Website',
					variant: 'success',
				})
                
				this.$router.push(`/websites/${createdSite.id}`)

			} catch (err) {
				console.error({ err })
				this.$bvToast.toast(err.message || 'Failed to deploy the website', {
                    title: 'Website',
					variant: 'danger',
				})
			} finally {
                this.isBusy = false
            }
		},
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss"></style>
