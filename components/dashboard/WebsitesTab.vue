<template>
<div>
    <div v-if="items.length > 0" class="m-3">
        <div class="text-center">
            <b-input-group class="mb-3">
                <b-input-group-prepend>
                    <b-input-group-text>
                        <b-icon icon="search" />
                    </b-input-group-text>
                </b-input-group-prepend>
                <b-form-input @input="val => searchTerm = val" debounce="500"/>
            </b-input-group>
            <b-button class="bg-gradient-primary border-0 align-self-center" size="lg" v-b-modal.siteModal>Create</b-button>
        </div>
        <b-card-group columns>
            <b-card v-for="site in filteredItems" :key="site.id">
                <template #header>
                    <h6 class="mb-0">{{ site.name | startCase }}</h6>
                </template>
                <b-card-text>
                    <ul class="px-3">
                        <li>Netlify Site ID: {{ site.netlifySiteId }}</li>
                        <li>Url: <b-link :href="site.url" target="_blank">{{ site.url }} <b-icon icon="box-arrow-up-right"/></b-link></li>
                        <li>Custom Domain: {{ site.customDomain }}</li>
                        <li>Is Ready? {{ isReady | yesNo }} </li>
                        <li>Created: {{ site.createdOn | toDate }}</li>
                    </ul>
                </b-card-text>
                <template #footer>
                    <!-- <b-button
                        class="bg-gradient-primary border-0"
                        size="sm"
                        :to="`/websites/${site.id}`"
                        >Manage</b-button
                    > -->
                </template>
            </b-card>
        </b-card-group>
    </div>
    <div v-else class="d-flex justify-content-center align-items-center h-100">
        <div class="d-flex flex-column">
            <h3>You don't have any websites yet</h3>
            <b-button class="bg-gradient-primary border-0" size="lg" v-b-modal.siteModal
                >Create</b-button
            >
        </div>
    </div>
    <b-modal id="siteModal" title="Create Website" size="md" centered @ok="onCreateSite">
        <b-form>
            <b-form-group
                label='Website Name'
                label-class='required'
            >
            <b-form-input
              id='name'
              name='name'
              v-model='newWebsite.name'
              type='text'
              placeholder='Bored Apes Yacht Club'
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
                label='Description'
                label-class='required'
            >
            <b-form-input
              id='description'
              name='description'
              v-model='newWebsite.description'
              type='text'
              placeholder='10k unique NFTs'
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
                label='Desired domain'
                label-class='required'
            >
            <b-form-input
              id='customDomain'
              name='customDomain'
              v-model='newWebsite.customDomain'
              type='text'
              placeholder='bayc'
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label-class="required"
            label="Smart Contract"
            label-for="smartContractId"
            description="Smart contract that will be tied to this website">
            <b-form-select
                id="smartContractId"
                name="smartContractId"
                text-field="name"
                value-field="id"
                v-model="newWebsite.smartContractId"
                :options="smartContracts"
                required></b-form-select>
            </b-form-group>
        </b-form>
    </b-modal>
</div>

</template>

<script>
import { mapGetters } from 'vuex'

export default {
    data: () => ({
		searchTerm: '',
		items: [],
		isBusy: false,
        isReady: true,
        newWebsite: {}
	}),
	fetchOnServer: false,
	fetchKey: 'websites-tab',
	async fetch() {
        if(!this.isLoggedIn) return

		const { data: websites } = await this.$axios.get(`/users/${this.userId}/websites`)
		this.items = websites

		console.log('websites-tab', this.items, this.smartContracts)
	},
    computed: {
        ...mapGetters(['isLoggedIn','userId']),
        smartContracts() {
            return this.$store.state.smartContractList.filter(sc => sc.isDeployed)
        },
		filteredItems() {
			return this.items.filter(x => x.name.includes(this.searchTerm))
		}
	},
    methods: {
        async onCreateSite(e) {
            e.preventDefault()
            try {
                await this.$axios.post('websites', this.newWebsite)
                const { data: websites } = await this.$axios.get(`/users/${this.userId}/websites`)
                this.items = websites
                // this.$bvModal.hide("siteModal")
            } catch (err) {
                console.error({err})
                this.$bvToast.toast(err.message || 'Failed to create website', {
                    title: 'Website',
                    variant: 'danger',
                    autoHideDelay: 4000,
                })
            }
        }
    }
}
</script>