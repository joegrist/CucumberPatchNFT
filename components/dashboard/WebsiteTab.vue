<template>
	<b-tab title="Website" no-body>
		<template v-if="site.id">
			<b-card-title class="text-center pt-2">
			<h5 class="m-0">{{ site.name | startCase }}</h5>
		</b-card-title>
		<b-card-text class="px-1">
			<ul>
				<li v-if="site.status === WEBSITE_STATUS.Ready">
					Current URL:
					<b-link :href="site.url" target="_blank"
						>{{ site.url }} <b-icon icon="box-arrow-up-right"
					/></b-link>
				</li>
				<li v-else class="text-warning">
					Current URL: building <b-spinner small></b-spinner>
				</li>
				<li>Desired Domain: {{ site.desiredDomain }}</li>
				<li class="text-info">
					Status: {{ WEBSITE_STATUS[site.status] }}
					<b-button
						v-if="
							site.status !== WEBSITE_STATUS.Ready
						"
						variant="success"
						size="sm"
						:disabled="isBusy"
						@click="refreshStatus(site)"
						>Refresh
					</b-button>
				</li>
				<li>Created: {{ site.createdOn | toDate }}</li>
			</ul>
		</b-card-text>
		<b-card-footer>
			<b-button
				v-if="site"
				class="bg-gradient-primary border-0"
				size="sm"
				:disabled="true"
				:to="`/websites/${site.id}`"
				>Manage</b-button
			>
			<b-button
				v-if="site"
				variant="info border-0"
				size="sm"
				target="_blank"
				:href="site.url"
				>View <b-icon icon="box-arrow-up-right"
			/></b-button>
		</b-card-footer>
		</template>

		<template v-else>
			<div class="d-flex flex-column text-center pt-2">
			<h5>You don't have a website... yet.</h5>
			<b-button
				v-if="$props.sc.isDeployed"
				class="bg-gradient-primary border-0"
				size="lg"
				@click="() => $bvModal.show(site.nanoId)"
				>Create</b-button
			>
			<div v-else>
				<h5>To create one first</h5>
				<b-button variant="primary" size="sm" @click="deploySmartContract"
					>Deploy Smart Contract</b-button
				>
			</div>
		</div>
		<b-modal
			:id="site.nanoId"
			title="Create Website"
			size="lg"
			centered
			@ok="onCreateSite"
			:busy="isBusy">
			<p>Smart Contract: {{ $props.sc.name }}</p>
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
		</template>
	</b-tab>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { WEBSITE_STATUS } from '@/constants'
import { nanoid } from 'nanoid'

export default {
	data: () => ({
		WEBSITE_STATUS,
		isBusy: false,
		newWebsite: {},
		site: {}
	}),
	props: {
		sc: Object,
	},
	beforeMount() {
		this.site = { ...this.$props.sc.website || {}, nanoId: nanoid() }
	},
	computed: {
		...mapGetters(['userId']),
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder']),
		deploySmartContract() {
			this.updateSmartContractBuilder({ ...this.$props.sc })
			this.$router.push('/wizard')
		},
		async refreshStatus(website) {
			try { 
				this.isBusy = true

				const { data } = await this.$axios.get(`/users/${this.userId}/websites/${website.id}/status`)

				this.site.status = data

			} catch (err) {
				console.error(err)
				this.isBusy = false
			}
		},
		async onCreateSite(e) {

			e.preventDefault()
			this.isBusy = true

			try {
				const smartContractId = this.$props.sc.id
				const { data: createdSite} = await this.$axios.post('websites', {
					...this.newWebsite,
					smartContractId
				})

				this.site = createdSite

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
	},
}
</script>
