<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4>Other Configuration</h4>
			</b-col>
			<b-col sm="12" md="3">
				<b-overlay :show="isBusy">
					<b-button variant="primary" block @click="update">Save</b-button>
				</b-overlay>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<b-card bg-variant="light">
                    <b-card-title>
                        <ExternalLink href="https://widgetbot.io" text="Chat Bot Window" />
                    </b-card-title>
					<b-row>
						<b-col sm="12" md="6">
							<b-form-group
                                label="Discord Server ID"
								description="Server ID to connect chat window to (not URL)">
								<b-form-input
									id="widgetBotServer"
									name="widgetBotServer"
									v-model="widgetBot.server"
									type="text"></b-form-input>
							</b-form-group>
						</b-col>
						<b-col sm="12" md="6">
							<b-form-group
								label="Discord Channel ID"
								description="Channel ID to connect chat window to (not URL)">
								<b-form-input
									id="widgetBotChannel"
									name="widgetBotChannel"
									v-model="widgetBot.channel"
									type="text"></b-form-input>
							</b-form-group>
						</b-col>
					</b-row>
				</b-card>
			</b-col>
		</b-row>
		<b-row class="mt-3">
			<b-col>
				<b-card bg-variant="light" title="Google Analytics">
                    <b-form-group
                        label="Google Analytics GA4 Tag ID (experimental)"
                        :description="`Supported events: ${analyticsEvents}`">
                        <b-input v-model="analytics.gtagId" />
                    </b-form-group>
                </b-card>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { DEFAULT_CONFIG_STRING, ANALYTICS_EVENTS } from '@/constants'

export default {
	props: {
		smartContractId: String,
	},
	data() {
		return {
			isBusy: false,
			site: {},
			widgetBot: {
				notifications: true,
				indicator: true,
				location: ['bottom', 'left'],
			},
			analytics: {
				gtagId: null,
			},
		}
	},
	async created() {
		const { data } = await this.$axios.get(
			`/smartcontracts/${this.smartContractId}/website`
		)
		this.site = data

		const configs = JSON.parse(data.configs || DEFAULT_CONFIG_STRING)

		this.widgetBot = {
            ...this.widgetBot,
			...configs.widgetBot
		}

		this.analytics = {
            ...this.analytics,
			...configs.analytics
		}
	},
	computed: {
		analyticsEvents() {
			return [...Object.values(ANALYTICS_EVENTS)].join(', ')
		},
	},
	methods: {
		async update() {
			try {
				const update = { ...this.site }

				const existingConfig = JSON.parse(
					update.configs || DEFAULT_CONFIG_STRING
				)

				update.configs = JSON.stringify({
					...existingConfig,
					widgetBot: this.widgetBot,
					analytics: this.analytics
				})

				const payload = Object.keys(update).reduce((formData, key) => {
					if (update[key]) formData.append(key, update[key])
					return formData
				}, new FormData())

				await this.$axios.put(`/websites/${this.site.id}`, payload)

                this.$bvToast.toast('Updated successfully', {
					title: 'Other',
					variant: 'success',
				})
			} catch (err) {
				this.$bvToast.toast(err.message || 'Failed to update', {
					title: 'Other',
					variant: 'danger',
				})
			} finally {
				this.isBusy = false
			}
		},
	},
}
</script>
