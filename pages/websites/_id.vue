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
			<li>
				<span class="text-success">Status: {{ WEBSITE_STATUS[site.status] }}</span>
				<b-button
					v-if="site.status !== WEBSITE_STATUS.Ready"
					variant="success"
					size="sm"
					:disabled="isBusy"
					@click="refreshStatus"
					>{{ isBusy ? 'Refreshing...' : 'Refresh' }}
				</b-button>
			</li>
			<li>Created: {{ site.createdOn | toDate }}</li>
		</ul>
		<b-form @submit.prevent="onUpdate" class="mb-3" >
			<b-form-group
				label="Website Name"
				label-class="required"
				description="Dispalyed on Google and as a browser tab title. Ours, for example, is Zero Code NFT Wizard">
				<b-form-input
					id="title"
					name="title"
					v-model="site.title"
					type="text"
					placeholder="Bored Apes Yacht Club"
					required></b-form-input>
			</b-form-group>
			<b-form-group label="Description" label-class="required">
				<b-form-input
					id="description"
					name="description"
					v-model="site.description"
					type="text"
					placeholder="10k unique NFTs"
					></b-form-input>
			</b-form-group>
			<b-form-group label="Desired website domain (URL)" label-class="required">
				<b-form-input
					id="desiredDomain"
					name="desiredDomain"
					v-model="site.desiredDomain"
					placeholder="zerocodenft.com"
					></b-form-input>
			</b-form-group>
			<div class="d-flex">
				<b-form-group
					label="Drop Date"
					description="Sets the countdown timer"
					class="w-50">
					<b-form-input
						id="dropDateInput"
						name="dropDateInput"
						v-model="site.dropDate"
						type="date"
						:min="new Date().toISOString().split('T')[0]"
						></b-form-input>
				</b-form-group>
				<b-form-group
					label="Drop Time"
					description="Sets the countdown timer"
					class="w-50">
					<b-form-input
						id="dropTimeInput"
						name="dropTimeInput"
						v-model="site.dropTime"
						type="time"
						></b-form-input>
				</b-form-group>
			</div>
			<b-form-group>
				<template #label>
					Twitter URL
					<b-link
						v-if="site.twitterURL"
						:href="transformUrl(site.twitterURL)"
						target="_blank"
						><b-icon icon="box-arrow-up-right"
					/></b-link>
				</template>
				<b-form-input
					id="twitterURL"
					name="twitterURL"
					v-model="site.twitterURL"
					></b-form-input>
			</b-form-group>
			<b-form-group>
				<template #label>
					Discord URL
					<b-link
						v-if="site.discordURL"
						:href="transformUrl(site.discordURL)"
						target="_blank"
						><b-icon icon="box-arrow-up-right"
					/></b-link>
				</template>
				<b-form-input
					id="discordURL"
					name="discordURL"
					v-model="site.discordURL"
					></b-form-input>
			</b-form-group>
			<b-form-group>
				<template #label>
					Instagram URL
					<b-link
						v-if="site.instagramURL"
						:href="transformUrl(site.instagramURL)"
						target="_blank"
						><b-icon icon="box-arrow-up-right"
					/></b-link>
				</template>
				<b-form-input
					id="instagramURL"
					name="instagramURL"
					v-model="site.instagramURL"
					></b-form-input>
			</b-form-group>
			<b-form-group label="TikTok URL">
				<template #label>
					TikTok URL
					<b-link
						v-if="site.tikTokURL"
						:href="transformUrl(site.tikTokURL)"
						target="_blank"
						><b-icon icon="box-arrow-up-right"
					/></b-link>
				</template>
				<b-form-input
					id="tikTokURL"
					name="tikTokURL"
					v-model="site.tikTokURL"
					></b-form-input>
			</b-form-group>
			<b-form-group label="Marketplace URL">
				<template #label>
					Marketplace URL
					<b-link
						v-if="site.marketplaceURL"
						:href="transformUrl(site.marketplaceURL)"
						target="_blank"
						><b-icon icon="box-arrow-up-right"
					/></b-link>
				</template>
				<b-form-input
					id="marketplaceURL"
					name="marketplaceURL"
					v-model="site.marketplaceURL"
					></b-form-input>
			</b-form-group>
			<div class="d-flex justify-content-end">
				<b-button type="submit" variant="success">Update</b-button>
			</div>
		</b-form>
	</b-container>
</template>

<script>
import { WEBSITE_STATUS } from '@/constants'
import { mapGetters, mapMutations } from 'vuex'

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
		if(this.site.dropDate) {
			const [date, time] = this.site.dropDate.split('T')
			this.site.dropDate = date
			this.site.dropTime = time || '00:00'
		}

		console.log('loaded website', this.site)
	},
	computed: {
		...mapGetters(['userId']),
	},
	methods: {
		...mapMutations(['setBusy']),

		transformUrl(url) {
			return url?.startsWith('http') ? url : `https://${url}`
		},
		async refreshStatus() {
			try {
				this.isBusy = true

				const { data } = await this.$axios.get(
					`/users/${this.userId}/websites/${this.site.id}/status`
				)

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
		async onUpdate() {
			this.setBusy(true)

			try {
				const { dropDate, dropTime, id } = this.site

				const update = { ...this.site }
				update.dropDate = dropDate
				if (dropDate && dropTime) {
					update.dropDate += `T${dropTime}:00`
				}

				await this.$axios.put(
					`websites/${id}`,
					update
				)

				this.$bvToast.toast(
					'Website updated. Please give it 5-10 mins for the changes to take effect',
					{
						title: 'Website',
						variant: 'success',
					}
				)
			} catch (err) {
				console.error({ err })
				this.$bvToast.toast(err.message || 'Failed to update the website', {
					title: 'Website',
					variant: 'danger',
				})
			} finally {
				this.setBusy(false)
			}
		}
	},
}
</script>
