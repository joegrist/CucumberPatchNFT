import Vue from 'vue'

export default {
	head() {
		const scripts = []

		const isBraveBrowser = typeof navigator.brave !== 'undefined'
		console.info({isBraveBrowser})

		if(isBraveBrowser) {
			// mock $gtag function since Brave blocks GA script
			Vue.prototype.$gtag = function() {}
		}

		// analytics
		scripts.push({
			hid: 'gtag',
			src: `https://www.googletagmanager.com/gtag/js?id=${this.$config.GTAG_ID}`,
			async: true,
			once: true,
			skip: isBraveBrowser,
			callback: () => {
				window.dataLayer = window.dataLayer || []

				function gtag() {
					dataLayer.push(arguments)
				}
				Vue.prototype.$gtag = gtag

				gtag('js', new Date())
				gtag('config', this.$config.GTAG_ID, { 'debug_mode': this.$config.GTAG_DEBUG })
			},
		})

		return {
			script: scripts,
		}
	},
}
