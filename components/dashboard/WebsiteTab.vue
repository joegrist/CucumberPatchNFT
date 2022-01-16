<template>
	<b-tab v-if="site" title="Website">
		<b-card-title class="text-center">
			<h5 class="m-0">{{ site.name | startCase }}</h5>
		</b-card-title>
		<b-card-text class="px-1">
			<ul>
				<li>Netlify Site ID: {{ site.netlifySiteId }}</li>
				<li v-show="site.status === WEBSITE_STATUS.Ready">
					URL:
					<b-link :href="site.url" target="_blank"
						>{{ site.url }} <b-icon icon="box-arrow-up-right"
					/></b-link>
				</li>
				<li>Custom Domain: {{ site.customDomain }}</li>
				<li class="text-info">
					Status: {{ WEBSITE_STATUS[site.status] }}
					<b-button
						v-if="
							site.status === site.netlifyDeployId && WEBSITE_STATUS.Deployed
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
		<b-modal
			id="siteModal"
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
						id="customDomain"
						name="customDomain"
						v-model="newWebsite.customDomain"
						type="text"
						placeholder="bayc"
						required></b-form-input>
				</b-form-group>
			</b-form>
		</b-modal>
	</b-tab>
	<b-tab v-else title="Website">
		<div class="d-flex flex-column text-center">
			<h5>You don't have a website... yet.</h5>
			<b-button
				v-if="$props.sc.isDeployed"
				class="bg-gradient-primary border-0"
				size="lg"
				v-b-modal.siteModal
				>Create</b-button
			>
			<div v-else>
				<h5>To create one first</h5>
				<b-button variant="primary" size="sm" @click="onDeploy"
					>Deploy Smart Contract</b-button
				>
			</div>
		</div>
	</b-tab>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { WEBSITE_STATUS } from '@/constants'

export default {
	data: () => ({
		WEBSITE_STATUS,
		isBusy: false,
		newWebsite: {},
	}),
	props: {
		sc: Object,
	},
	computed: {
		...mapGetters(['userId']),
		site() {
			return this.$props.sc.website
		},
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder']),
		onDeploy() {
			this.updateSmartContractBuilder({ ...this.$props.sc })
			this.$router.push('/wizard')
		},
		async refreshStatus(website) {

			const { data } = await this.$netlify.get(
				`/deploys/${website.netlifyDeployId}`
			)

			console.log('status', data)

			if (data.state === 'ready') {
				website.status = WEBSITE_STATUS.Ready
			}
		},
		async onCreateSite(e) {

			e.preventDefault()
			this.isBusy = true

			try {
				const { data: createdSite} = await this.$axios.post('websites', this.newWebsite)
				// const { data: websites } = await this.$axios.get(
				// 	`/users/${this.userId}/websites`
				// )

                //TODO: navigate to the created site /websites/{createdSite.id}

				this.$bvModal.hide('siteModal')
				this.$bvToast.toast('Website deployed successfully', {
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
