<template>
	<b-container class="pt-2">
		<b-form @submit.prevent="onUpdate" class="mb-1">
			<b-row class="mb-3">
				<b-col sm="12" md="9">
					<h1>{{ site.title }}</h1>
				</b-col>
				<b-col sm="12" md="3" class="my-auto">
					<b-button type="submit" variant="primary" block>
						Save
						<b-icon v-show="notSaved" icon="exclamation-triangle" />
					</b-button>
				</b-col>
			</b-row>
			<b-row class="mb-2 mb-md-0">
				<b-col sm="12" md="9" style="overflow: auto" class="text-center">
					<div v-if="showPreview" v-html="iframeCode"></div>
					<b-link :href="directURL" target="_blank">{{ directURL }}</b-link>
					<h5 class="text-center text-muted mb-3">
						Preview window |
						<ExternalLink
							href="https://www.youtube.com/playlist?list=PLSimebE4ITqOVKn2mZXb3dS51Ifqu_BEm"
							text="How To Use"
							icon="youtube" />
					</h5>
				</b-col>
				<b-col sm="12" md="3">
					<div class="mb-2 accordion" role="tablist">
						<b-card no-body class="rounded-0">
							<b-card-header
								header-class="p-0"
								header-bg-variant="transparent"
								role="tab">
								<b-button
									class="d-flex justify-content-between"
									v-b-toggle.mintPageCollapse
									block
									variant="transparent">
									<span>Mint Page</span>
									<b-icon icon="chevron-down" class="my-auto" />
								</b-button>
							</b-card-header>
							<b-collapse
								id="mintPageCollapse"
								visible
								accordion="mint-page-accordion"
								role="tabpanel">
								<b-card-body class="pb-1">
									<b-form-group
										v-show="site.template === WEBSITE_TEMPLATE.Full"
										label="Bars Color"
										label-cols="9"
										content-cols="3">
										<b-form-input
											type="color"
											v-model="stylesConfig.navbarBgColor"></b-form-input>
									</b-form-group>
									<b-form-group
										label="Background Color"
										label-cols="9"
										content-cols="3">
										<b-form-input
											type="color"
											v-model="stylesConfig.pageBackground"></b-form-input>
									</b-form-group>
									<b-form-group
										label="Text Color"
										label-cols="9"
										content-cols="3">
										<b-form-input
											type="color"
											v-model="stylesConfig.pageTextColor"></b-form-input>
									</b-form-group>
									<b-form-group label="Mint Page Template">
										<b-form-select
											v-model="site.template"
											:options="viewOptions"></b-form-select>
									</b-form-group>
									<b-form-group label="Mint Count Selector">
										<b-form-select
											v-model="site.mintCountSelectorType"
											:options="mintCountSelectorOptions"></b-form-select>
									</b-form-group>
									<b-form-group :label="`Window Width (${site.windowWidth}%)`">
										<b-form-input
											v-model="site.windowWidth"
											type="range"
											max="100"></b-form-input>
									</b-form-group>
									<b-form-group
										:label="`Window Height (${site.windowHeight}px)`">
										<b-form-input
											v-model="site.windowHeight"
											type="range"
											max="2000"></b-form-input>
									</b-form-group>
									<b-form-group
										label="Minted Counter"
										label-cols="9"
										content-cols="3">
										<b-form-checkbox
											id="isCounterHidden"
											name="isCounterHidden"
											class="pt-1"
											size="lg"
											switch
											:checked="!site.isCounterHidden"
											@input="
												(val) => (site.isCounterHidden = !val)
											"></b-form-checkbox>
									</b-form-group>
								</b-card-body>
							</b-collapse>
						</b-card>
						<b-card no-body class="rounded-0">
							<b-card-header
								header-class="p-0"
								header-bg-variant="transparent"
								role="tab">
								<b-button
									class="d-flex justify-content-between"
									v-b-toggle.mintBtnStyles
									block
									variant="transparent">
									<span>Mint Button</span>
									<b-icon icon="chevron-down" class="my-auto" />
								</b-button>
							</b-card-header>
							<b-collapse
								id="mintBtnStyles"
								accordion="mint-page-accordion"
								role="tabpanel">
								<b-card-body class="pb-1">
									<b-form-group
										label="Background Color"
										label-cols="9"
										content-cols="3">
										<b-form-input
											type="color"
											v-model="stylesConfig.mintBtnBgColor"></b-form-input>
									</b-form-group>
									<b-form-group
										label="Text Color"
										label-cols="9"
										content-cols="3">
										<b-form-input
											type="color"
											v-model="stylesConfig.mintBtnTextColor"></b-form-input>
									</b-form-group>
									<b-form-group :label="`Width (${stylesConfig.mintBtnWidth})`">
										<b-form-input
											type="range"
											max="100"
											:value="
												stylesConfig.mintBtnWidth.toString().replace('%', '')
											"
											@change="
												(val) => (stylesConfig.mintBtnWidth = `${val}%`)
											"></b-form-input>
									</b-form-group>
								</b-card-body>
							</b-collapse>
						</b-card>
					</div>
					Embed code <Copy :value="iframeCode" />
					<br />
					<div class="border rounded p-2">
						<code>
							{{ iframeCode }}
						</code>
					</div>
					<ExternalLink
						href="https://www.youtube.com/playlist?list=PLSimebE4ITqOVKn2mZXb3dS51Ifqu_BEm"
						text="How to videos"
						icon="youtube" />
				</b-col>
			</b-row>
			<b-row>
				<b-col>
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
					<b-row>
						<b-col sm="12" md="6">
							<b-form-group
								label="Drop Date"
								description="Sets the countdown timer, display purposes only">
								<b-form-input
									id="dropDateInput"
									name="dropDateInput"
									v-model="site.dropDateInput"
									type="date"></b-form-input>
							</b-form-group>
						</b-col>
						<b-col sm="12" md="6">
							<b-form-group
								label="Drop Time"
								description="Sets the countdown timer, enter your local time">
								<b-form-input
									id="dropTimeInput"
									name="dropTimeInput"
									v-model="site.dropTimeInput"
									type="time"></b-form-input>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row>
						<b-col sm="12" md="6">
							<b-form-group
								label="Icon"
								description="Your site's icon. Max 1 MB in size">
								<b-form-file
									v-model="site.icon"
									name="icon"
									accept="image/*"
									placeholder="Choose a file or drop it here..."
									drop-placeholder="Drop file here..."></b-form-file>
							</b-form-group>
						</b-col>
						<b-col sm="12" md="6">
							<b-form-group
								label="Background Image"
								description="Your site's background. Max 1 MB in size">
								<template #label>
									Background Image
									<b-link v-if="site.backgroundImageURL" @click="resetBgImage"
										>[Reset]</b-link
									>
								</template>
								<b-form-file
									v-model="site.backgroundImage"
									name="backgroundImage"
									accept="image/*"
									placeholder="Choose a file or drop it here..."
									drop-placeholder="Drop file here...">
								</b-form-file>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-show="site.template === WEBSITE_TEMPLATE.Full">
						<b-col sm="12" md="6">
							<b-form-group>
								<template #label>
									<ExternalLink :href="site.twitterURL" text="Twitter URL" />
								</template>
								<b-form-input
									id="twitterURL"
									name="twitterURL"
									type="url"
									v-model="site.twitterURL"></b-form-input>
							</b-form-group>
						</b-col>
						<b-col sm="12" md="6">
							<b-form-group>
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
						</b-col>
					</b-row>
					<b-row v-show="site.template === WEBSITE_TEMPLATE.Full">
						<b-col sm="12" md="6">
							<b-form-group>
								<template #label>
									<ExternalLink :href="site.discordURL" text="Discord URL" />
								</template>
								<b-form-input
									id="discordURL"
									name="discordURL"
									v-model="site.discordURL"></b-form-input>
							</b-form-group>
						</b-col>
						<b-col sm="12" md="6">
							<b-form-group>
								<template #label>
									<ExternalLink :href="site.tikTokURL" text="TikTok URL" />
								</template>
								<b-form-input
									id="tikTokURL"
									name="tikTokURL"
									v-model="site.tikTokURL"></b-form-input>
							</b-form-group>
						</b-col>
					</b-row>

					<b-row v-show="site.template === WEBSITE_TEMPLATE.Full">
            <b-col sm="12" md="6">
              <b-form-group>
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
            </b-col>
            <b-col sm="12" md="6">
              <b-form-group description="Etherscan, snowtrace, etc.">
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
            </b-col>
					</b-row>
				</b-col>
			</b-row>
		</b-form>
	</b-container>
</template>

<script>
import {
	WEBSITE_STATUS,
	WEBSITE_TYPE,
	WEBSITE_TEMPLATE,
	MINT_SELECTOR_TYPE,
} from '@/constants'
import { mapGetters, mapMutations, mapState } from 'vuex'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

export default {
	middleware: 'authenticated',
	props: {
		smartContractId: String,
	},
	data() {
		return {
			WEBSITE_STATUS,
			WEBSITE_TYPE,
			WEBSITE_TEMPLATE,
			site: {},
			stylesConfig: {
				mintBtnBgColor: '#8859EC',
				mintBtnTextColor: '#FFFFFF',
				mintBtnWidth: '100%',
				// mintBtnFontSize: "20px",
				pageBackground: '#FFFFFF',
				pageTextColor: '#8859EC',
			},
			showPreview: true,
			notSaved: false,
			viewOptions: [
				{ value: WEBSITE_TEMPLATE.Tabs, text: 'Tabs' },
				{ value: WEBSITE_TEMPLATE.Button, text: 'Button' },
				{ value: WEBSITE_TEMPLATE.Full, text: 'Full' },
			],
			mintCountSelectorOptions: [
				{ value: MINT_SELECTOR_TYPE.SpinButton, text: 'Spin Button' },
				{ value: MINT_SELECTOR_TYPE.Range, text: 'Slider' },
			],
		}
	},
	async created() {
		const { data } = await this.$axios.get(
			`/smartcontracts/${this.smartContractId}/website`
		)
		this.site = data

		this.stylesConfig = {
			...this.stylesConfig,
			...JSON.parse(data.stylesConfig || '{}'),
		}
		// console.log(this.stylesConfig)

		this.site.windowWidth = this.site.windowWidth ?? 100
		this.site.windowHeight = this.site.windowHeight ?? 550
		this.site.template = this.site.template ?? WEBSITE_TEMPLATE.Tabs

		if (this.site.dropDate) {
			const [date, time] = dayjs
				.utc(this.site.dropDate)
				.tz(this.site.timeZone || dayjs.tz.guess())
				.format('YYYY-MM-DDTHH:mm:ss')
				.split('T')
      console.log(date, time)
			this.site.dropDateInput = date
			this.site.dropTimeInput = time
		}
	},
	computed: {
		...mapState(['isBusy']),
		...mapGetters(['userId']),
		templateName() {
			return this.site.template === WEBSITE_TEMPLATE.Full
				? ''
				: WEBSITE_TEMPLATE[this.site.template]
		},
		iframeCode() {
			const { id, title, windowWidth, windowHeight } = this.site
			return `
				<iframe 
					width="${windowWidth}%" 
					height="${windowHeight}px"
					allowfullscreen="true"
					style="border:none;"
					loading="lazy"
					title="${title}"
					src="${this.$config.MINT_SITE_URL}/${this.templateName}?siteId=${id}"></iframe>`
		},
		directURL() {
			return `${this.$config.MINT_SITE_URL}/${this.templateName}?siteId=${this.site.id}`
		},
	},
	methods: {
		...mapMutations(['setBusy']),
		async resetBgImage() {
			try {
				await this.$axios.delete(`/websites/${this.site.id}/bgimage`)
				this.site.backgroundImageURL = null
				this.resetPreview()
				this.$bvToast.toast('Background image reset', {
					title: 'Website',
					variant: 'success',
				})
			} catch (err) {
				this.$bvToast.toast('Background image reset failed', {
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

			this.setBusy({ isBusy: true })

			try {
				const update = { ...this.site }

				// const stylesUpdate = { ...this.stylesConfig }

				const { dropDateInput, dropTimeInput, id } = this.site
				update.dropDate = dropDateInput
				update.dropTimeZone = dayjs.tz.guess()
				if (dropDateInput && dropTimeInput) {
					update.dropDate = new Date(
						`${dropDateInput}T${dropTimeInput}`
					).toUTCString()
				}

				update.stylesConfig = JSON.stringify(this.stylesConfig)

				const payload = Object.keys(update).reduce((formData, key) => {
					if (update[key]) formData.append(key, update[key])
					return formData
				}, new FormData())

				const { data } = await this.$axios.put(`/websites/${id}`, payload)
				this.site = data
				// reload iframe
				this.resetPreview()

				this.$bvToast.toast('Website updated successfully', {
					title: 'Website',
					variant: 'success',
				})

				this.notSaved = false
			} catch (err) {
				this.$bvToast.toast(err.message || 'Failed to update the website', {
					title: 'Website',
					variant: 'danger',
				})
			} finally {
				this.setBusy({ isBusy: false })
			}
		},
		resetPreview() {
			this.showPreview = false
			setTimeout(() => (this.showPreview = true), 100)
		},
	},
}
</script>
