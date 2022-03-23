<template>
	<b-container class="pt-2">
		<h1 class="text-center my-3">{{ site.title }}</h1>
		<b-row v-if="site.type !== WEBSITE_TYPE.Full">
			<b-col cols="9" style="overflow: auto" class="text-center">
				<div v-if="showPreview" v-html="iframeCode"></div>
				<h5 class="text-center text-muted mb-3">Preview window</h5>
			</b-col>
			<b-col cols="3">
				<b-form-group label="Template">
					<b-form-select
						v-model="iframe.view"
						:options="viewOptions"></b-form-select>
				</b-form-group>
				<b-form-group :label="`Width (${iframe.width}%)`">
					<b-form-input
						v-model="iframe.width"
						type="range"
						max="100"></b-form-input>
				</b-form-group>
				<b-form-group :label="`Height (${iframe.height}px)`">
					<b-form-input
						v-model="iframe.height"
						type="range"
						max="2000"></b-form-input>
				</b-form-group>
				Embed code <Copy :value="iframeCode" />
				<br />
				<div class="border rounded p-2">
					<code>
						{{ iframeCode }}
					</code>
				</div>
				<ExternalLink
					href="https://www.youtube.com/watch?v=uo7mtt510hg&t=7s"
					text="How to video"
					icon="youtube" />
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<div>
					<ul>
						<template v-if="site.type === WEBSITE_TYPE.Full">
							<li>
								Site URL:
								<ExternalLink :href="site.url" :text="site.url" />
							</li>
						</template>
					</ul>
				</div>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<b-form @submit.prevent="onUpdate" class="mb-3">
					<b-form-group label="Title" label-class="required">
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
							@input="(val) => (site.isCounterHidden = !val)"></b-form-checkbox>
						<div class="mt-1">
							<label class="mb-0">Minted/Collection Size counter</label>
						</div>
					</div>
					<div class="d-flex">
						<b-form-group
							label="Drop Date"
							description="Sets the countdown timer, enter your local time"
							class="pr-1 w-50">
							<b-form-input
								id="dropDateInput"
								name="dropDateInput"
								v-model="site.dropDateInput"
								type="date"></b-form-input>
						</b-form-group>
						<b-form-group
							label="Drop Time"
							description="Sets the countdown timer"
							class="w-50">
							<b-form-input
								id="dropTimeInput"
								name="dropTimeInput"
								v-model="site.dropTimeInput"
								type="time"></b-form-input>
						</b-form-group>
					</div>
					<div v-show="iframe.view === ''">
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
									<ExternalLink
										:href="site.instagramURL"
										text="Instagram URL" />
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
									<ExternalLink
										:href="site.marketplaceURL"
										text="Marketplace URL" />
								</template>
								<b-form-input
									id="marketplaceURL"
									name="marketplaceURL"
									v-model="site.marketplaceURL"></b-form-input>
							</b-form-group>
							<b-form-group
								class="w-50"
								description="Etherscan, snowtrace, etc.">
								<template #label>
									<ExternalLink
										:href="site.blockExplorerUrl"
										text="Block Explorer URL" />
								</template>
								<b-form-input
									id="blockExplorerUrl"
									name="blockExplorerUrl"
									v-model="site.blockExplorerUrl">
								</b-form-input>
							</b-form-group>
						</div>
					</div>
					<div class="d-flex justify-content-end">
						<b-button
							variant="danger"
							v-b-modal="site.id"
							:disabled="isBusy || site.status !== WEBSITE_STATUS.Ready"
							>Delete</b-button
						>
						<b-button class="ml-2" type="submit" variant="success"
							>Update</b-button
						>
					</div>
				</b-form>
			</b-col>
		</b-row>
		<b-modal
			:id="site.id"
			title="Confirm"
			centered
			body-class="text-center"
			ok-variant="success"
			ok-title="Yes"
			cancel-title="No"
			@ok="onDelete">
			<h5>Are you sure want to delete this page ?</h5>
		</b-modal>
	</b-container>
</template>

<script>
import { WEBSITE_STATUS, WEBSITE_TYPE } from '@/constants'
import { mapGetters, mapMutations, mapState } from 'vuex'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

export default {
	middleware: 'authenticated',
	data() {
		return {
			WEBSITE_STATUS,
			WEBSITE_TYPE,
			site: {},
			showPreview: true,
			iframe: {
				view: 'tabs',
				width: 100,
				height: 206,
			},
			viewOptions: [
				{ value: 'tabs', text: 'Tabs' },
				{ value: '', text: 'Full' },
			],
		}
	},
	fetchOnServer: false,
	fetchKey: 'website-id',
	async fetch() {
		const { data } = await this.$axios.get(`/websites/${this.$route.params.id}`)
		this.site = data
		if (this.site.dropDate) {
			const [date, time] = dayjs
				.utc(this.site.dropDate)
				.tz(this.site.timeZone || dayjs.tz.guess())
				.format('YYYY-MM-DDTHH:mm:ss')
				.split('T')
			this.site.dropDateInput = date
			this.site.dropTimeInput = time
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
		iframeCode() {
			return `
				<iframe 
					width="${this.iframe.width}%" 
					height="${this.iframe.height}px"
					allowfullscreen="true"
					loading="lazy"
					title="${this.site.title}"
					src="${this.$config.MINT_SITE_URL}/${this.iframe.view}?siteId=${this.site.id}"></iframe>`
		},
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
			if (this.site.backgroundImage?.size / (1024 * 1024) > 1) {
				alert('Background image is too big. Max supported size is 1 mb.')
				return
			}

			if (this.site.icon?.size / (1024 * 1024) > 1) {
				alert('Icon is too big. Max supported size is 1 mb.')
				return
			}

			this.setBusy(true)

			try {
				const { dropDateInput, dropTimeInput, id } = this.site

				const update = { ...this.site }
				update.dropTimeZone = dayjs.tz.guess()
				update.dropDate = dropDateInput
				if (dropDateInput && dropTimeInput) {
					update.dropDate = new Date(
						`${dropDateInput}T${dropTimeInput}`
					).toUTCString()
				}

				const payload = Object.keys(update).reduce((formData, key) => {
					if (update[key]) formData.append(key, update[key])
					return formData
				}, new FormData())

				await this.$axios.put(`websites/${id}`, payload)

				// reload iframe
				this.showPreview = false
				setTimeout(() => (this.showPreview = true), 1000)

				this.$bvToast.toast('Website updated successfully', {
					title: 'Website',
					variant: 'success',
				})
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
