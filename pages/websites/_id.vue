<template>
	<b-container class="pt-3">
		<h1 class="text-center">{{ site.title }} </h1>
		<iframe v-if="showPreview" width="100%" height="800px" :title="site.name" :src="`${$config.MINT_SITE_URL}?siteId=${site.id}`"></iframe>
		<h5 class="text-center text-muted mb-3">Mint Page Preview</h5>
		<div>
			<ul>
				<template v-if="site.type === WEBSITE_TYPE.Full">
					<li>
						<span class="text-success"
							>Status: {{ WEBSITE_STATUS[site.status] }}</span
						>
					</li>
					<li>
						Site URL:
						<ExternalLink :href="site.url" :text="site.url" />
					</li>
				</template>
				<li>To embed on your site paste the following code into an HTML embed element
						<br/>
						<code>
							{{ iframeCode }}
						</code>
						<Copy :value="iframeCode" />
						<br/>
						<ExternalLink href="https://www.youtube.com/watch?v=uo7mtt510hg&t=7s" text="See video" icon="youtube" />
				</li>
			</ul>
		</div>
		<b-form @submit.prevent="onUpdate" class="mb-3">
			<b-form-group
				label="Title"
				label-class="required"
				>
				<b-form-input
					id="title"
					name="title"
					v-model="site.title"
					type="text"
					placeholder="Bored Apes Yacht Club"
					required></b-form-input>
			</b-form-group>
			<b-form-group label="Description">
				<b-form-textarea
					id="description"
					name="description"
					v-model="site.description"></b-form-textarea>
			</b-form-group>
			<div class="d-flex flex-row mb-1">
				<b-form-checkbox
					id="isCounterHidden"
					name="isCounterHidden"
					switch
					size="lg"
					:checked="!site.isCounterHidden"
					@input="val => site.isCounterHidden = !val"
				></b-form-checkbox>
				<div class="mt-1">
					<label class="mb-0">Minted/Collection Size counter</label>
				</div>
			</div>
			<div class="d-flex">
				<b-form-group
					label="Icon"
					description="Your site's icon. Max 1 MB in size"
					class="pr-1 w-50">
					<b-form-file
						v-model="site.icon"
						name="icon"
						accept="image/*"
						placeholder="Choose a file or drop it here..."
						drop-placeholder="Drop file here..."></b-form-file>
				</b-form-group>
				<b-form-group
					label="Background Image"
					description="Your site's background. Max 1 MB in size"
					class="pr-1 w-50">
					<b-form-file
						v-model="site.backgroundImage"
						name="backgroundImage"
						accept="image/*"
						placeholder="Choose a file or drop it here..."
						drop-placeholder="Drop file here..."></b-form-file>
				</b-form-group>
			</div>
			<div class="d-flex">
				<b-form-group
					label="Drop Date"
					description="Sets the countdown timer, enter your local time"
					class="pr-1 w-50">
					<b-form-input
						id="dropDateInput"
						name="dropDateInput"
						v-model="site.dropDate"
						type="date"
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
						type="time"></b-form-input>
				</b-form-group>
			</div>
			<div class="d-flex">
				<b-form-group class="pr-1 w-50">
					<template #label>
						<ExternalLink :href="site.twitterURL" text="Twitter URL" />
					</template>
					<b-form-input
						id="twitterURL"
						name="twitterURL"
						type="url"
						v-model="site.twitterURL"></b-form-input>
				</b-form-group>
				<b-form-group class="w-50">
					<template #label>
						<ExternalLink :href="site.discordURL" text="Discord URL" />
					</template>
					<b-form-input
						id="discordURL"
						name="discordURL"
						v-model="site.discordURL"></b-form-input>
				</b-form-group>
			</div>
			<div class="d-flex">
				<b-form-group class="pr-1 w-50">
					<template #label>
						<ExternalLink :href="site.instagramURL" text="Instagram URL" />
					</template>
					<b-form-input
						id="instagramURL"
						name="instagramURL"
						v-model="site.instagramURL"></b-form-input>
				</b-form-group>
				<b-form-group class="w-50">
					<template #label>
						<ExternalLink :href="site.tikTokURL" text="TikTok URL" />
					</template>
					<b-form-input
						id="tikTokURL"
						name="tikTokURL"
						v-model="site.tikTokURL"></b-form-input>
				</b-form-group>
			</div>
			<div class="d-flex">
				<b-form-group class="pr-1 w-50">
					<template #label>
						<ExternalLink :href="site.marketplaceURL" text="Marketplace URL" />
					</template>
					<b-form-input
						id="marketplaceURL"
						name="marketplaceURL"
						v-model="site.marketplaceURL"></b-form-input>
				</b-form-group>
				<b-form-group class="w-50" description="Etherscan, snowtrace, etc.">
					<template #label>
						<ExternalLink :href="site.blockExplorerUrl" text="Block Explorer URL" />
					</template>
					<b-form-input
						id="blockExplorerUrl"
						name="blockExplorerUrl"
						v-model="site.blockExplorerUrl">
					</b-form-input>
				</b-form-group>
			</div>
			<div class="d-flex justify-content-end">
				<b-button
					variant="danger"
					v-b-modal="site.id"
					:disabled="isBusy || site.status !== WEBSITE_STATUS.Ready"
					>Delete</b-button
				>
				<b-button class="ml-2" type="submit" variant="success">Update</b-button>
			</div>
		</b-form>
		<b-modal
			:id="site.id"
			title="Confirm"
			centered
			body-class="text-center"
			ok-variant="success"
			ok-title="Yes"
			cancel-title="No"
			@ok="onDelete"
		>
			<h5>Are you sure want to delete this website ?</h5>
		</b-modal>
	</b-container>
</template>

<script>
import { WEBSITE_STATUS, WEBSITE_TYPE } from '@/constants'
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
	middleware: 'authenticated',
	data() {
		return {
			WEBSITE_STATUS,
			WEBSITE_TYPE,
			site: {},
			showPreview: true
		}
	},
	fetchOnServer: false,
	fetchKey: 'website-id',
	async fetch() {
		const { data } = await this.$axios.get(`/websites/${this.$route.params.id}`)
		this.site = data
		if (this.site.dropDate) {
			const [date, time] = this.site.dropDate.split('T')
			this.site.dropDate = date
			this.site.dropTime = time || '00:00'
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
		iframeCode() {
			return `
				<iframe 
					width="100%" 
					height="800px"
					allowfullscreen="true"
					loading="lazy"
					title="${this.site.title}"
					src="https://mint.zerocodenft.com?siteId=${this.site.id}"></iframe>`
		}
	},
	methods: {
		...mapMutations(['setBusy']),
		async onDelete() {
			try {
				this.setBusy(true)
				await this.$axios.delete(`/websites/${this.site.id}`)
				this.setBusy(false)
				this.$router.push('/')
			} catch (err) {
				this.setBusy(false)
				this.$bvToast.toast('Website delete failed', {
					title: 'Website',
					variant: 'danger',
				})
			}
		},
		async onUpdate() {
			if(this.site.backgroundImage?.size / (1024*1024) > 1) {
				alert("Background image is too big. Max supported size is 1 mb.")
				return
			}

			if(this.site.icon?.size / (1024*1024) > 1) {
				alert("Icon is too big. Max supported size is 1 mb.")
				return
			}

			this.setBusy(true)

			try {
				const { dropDate, dropTime, id } = this.site

				const update = { ...this.site }
				update.dropDate = dropDate
				if (dropDate && dropTime) {
					update.dropDate += `T${dropTime}`
				}

				const payload = Object.keys(update).reduce((formData, key) => {
					if (update[key]) formData.append(key, update[key])
					return formData
				}, new FormData())

				await this.$axios.put(`websites/${id}`, payload)

				// reload iframe
				this.showPreview = false
				setTimeout(() => this.showPreview = true, 1000)

				this.$bvToast.toast(
					'Website updated. Please give it 5-10 mins for the changes to take effect',
					{
						title: 'Website',
						variant: 'success',
					}
				)
			} catch (err) {
				this.$bvToast.toast(err.message || 'Failed to update the website', {
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
