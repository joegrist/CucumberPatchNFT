<template>
    <div class="p-3">
        <b-input-group class="mb-3">
			<b-input-group-prepend>
				<b-input-group-text>
        			<b-icon icon="search" />
      			</b-input-group-text>
			</b-input-group-prepend>
			<b-form-input @input="val => searchTerm = val" debounce="500"/>
		</b-input-group>
        <b-card-group columns>
            <DashboardCard v-for="sc in filteredItems" :key="sc.id" :sc="sc" @create-site="showWebsiteModal" />
        </b-card-group>
        <b-modal
			id="siteModal"
			title="Create Website"
			size="lg"
			centered
			@ok="onCreateSite"
			:busy="isBusy">
			<!-- <p>Smart Contract: {{ $props.sc.name }}</p> -->
			<b-form>
				<b-form-group
					label="Website Name"
					label-class="required"
					description="Dispalyed on Google and as a browser tab title. Ours, for example, is Zero Code NFT Wizard">
					<b-form-input
						id="name"
						name="name"
						v-model="newWebsite.name"
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
						type="text"
						placeholder="bayc"
						required></b-form-input>
				</b-form-group>
			</b-form>
		</b-modal>
    </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

export default {
  middleware: 'authenticated',
  data() {
      return {
          items:[],
          searchTerm: '',
          isBusy: false,
          newWebsite: {}
      }
  },
  fetchOnServer: false,
	fetchKey: 'dashboard',
	async fetch() {
		const { data: contracts } = await this.$axios.get(`/users/${this.userId}/smartcontracts`)
        const { data: websites } = await this.$axios.get(`/users/${this.userId}/websites`)

        contracts.forEach(sc => {
            sc.website = websites.find(x =>sc.id === x.smartContractId)
        })

        this.items = contracts

		this.setSmartContractList(contracts)

		console.log('dashboard', this.items)

	},
    computed: {
        ...mapGetters(['userId']),
        filteredItems() {
            const term = this.searchTerm.toLowerCase()
            return this.items.filter(x => x.name.toLowerCase().includes(term) || x.symbol.toLowerCase().includes(term))
        }   
    },
    methods: {
		...mapMutations(['setSmartContractList']),

        showWebsiteModal(smartContractId) {
            this.newWebsite.smartContractId = smartContractId
            this.$bvModal.show("siteModal")
        },

        async onCreateSite(e) {
			e.preventDefault()
			this.isBusy = true

			try {
				const { data: createdSite} = await this.$axios.post('websites', this.newWebsite)

				this.site = createdSite

				// const { data: websites } = await this.$axios.get(
				// 	`/users/${this.userId}/websites`
				// )

                // const sc = this.items.find(x => x.id === createdSite.smartContractId)
                // sc.website = createdSite

                //TODO: navigate to the created site /websites/{createdSite.id}

				this.$bvModal.hide('siteModal')
				this.$bvToast.toast('Website submission successful! Please allow ~10 minutes for the website do get deployed.', {
					title: 'Website',
					variant: 'success',
				})
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
