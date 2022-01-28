<template>
	<b-container class="pt-3">
		<h1 class="text-center">{{ site.title }} dApp</h1>
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
					v-if="site.status !== WEBSITE_STATUS.Ready"
					variant="success"
					size="sm"
					:disabled="isBusy"
					@click="refreshStatus"
					>{{ isBusy ? 'Refreshing...' : 'Refresh' }}
				</b-button>
			</li>
			<li v-if="site.description">Description: {{ site.description }}</li>
			<li v-if="site.dropDate">
				Drop Date: {{ new Date(site.dropDate).toLocaleString() }}
			</li>
			<li v-if="site.discordURL">
				Discord:
				<b-link :href="site.discordURL" target="_blank"
					>{{ site.discordURL }} <b-icon icon="box-arrow-up-right"
				/></b-link>
			</li>
			<li v-if="site.twitterURL">
				Twitter:
				<b-link :href="site.twitterURL" target="_blank"
					>{{ site.twitterURL }} <b-icon icon="box-arrow-up-right"
				/></b-link>
			</li>
			<li v-if="site.instagramURL">
				Instagram:
				<b-link :href="site.instagramURL" target="_blank"
					>{{ site.instagramURL }} <b-icon icon="box-arrow-up-right"
				/></b-link>
			</li>
			<li v-if="site.marketplaceURL">
				Marketplace URL:
				<b-link :href="site.marketplaceURL" target="_blank"
					>{{ site.marketplaceURL }} <b-icon icon="box-arrow-up-right"
				/></b-link>
			</li>
			<li>Created: {{ site.createdOn | toDate }}</li>
		</ul>
	</b-container>
</template>

<script>
import { WEBSITE_STATUS } from '@/constants'
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'

export default {
	data() {
		return {
			WEBSITE_STATUS,
			isBusy: false,
			site: {},
		}
	},
	fetchOnServer: false,
	fetchKey: 'website-id',
	async fetch() {
		const { data } = await this.$axios.get(`/websites/${this.$route.params.id}`)
		this.site = data

		console.log('loaded website', this.site)
	},
	computed: {
		...mapGetters(['userId']),
		dropDateTime() {
			dayjs(this.site.dropDate).format('dddd MMM')
		},
	},
	methods: {
		async refreshStatus() {
			try {
				this.isBusy = true

				const { data } = await this.$axios.get(
					`/users/${this.userId}/websites/${this.site.id}/status`
				)
				console.log(data)

				this.site.status = data

				setTimeout(() => {
					this.$bvToast.toast('Status refreshed!', {
						title: 'Website',
						variant: 'success',
					})
					this.isBusy = false
				}, 3000)
			} catch (err) {
				this.isBusy = false
				console.error(err)
			}
		},
	},
}
</script>
