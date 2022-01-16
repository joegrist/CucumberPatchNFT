<template>
    <!-- <b-tabs content-class="mt-3" justified active-nav-item-class="font-weight-bold text-uppercase">
        <b-tab title="Smart Contracts (beta)" active>
            <SmartContractsTab />
        </b-tab>
        <b-tab title="Websites (beta)" lazy>
            <WebsitesTab />
        </b-tab>
    </b-tabs> -->
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
            <b-card v-for="item in filteredItems" :key="item.id" no-body>
                <b-tabs justified card>
                    <SmartContractTab :sc="item" />
                    <WebsiteTab :sc="item" />
                </b-tabs>
            </b-card>
        </b-card-group>
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
    }
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss"></style>
