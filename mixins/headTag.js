import Vue from 'vue'

export default {
	head() {
		const scripts = []

		const isBraveBrowser = typeof navigator.brave !== 'undefined'
		console.info({isBraveBrowser})

		// mock $gtag function in case script gets blocked
		Vue.prototype.$gtag = function() {}

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

		scripts.push({
			hid: 'twitter',
			src: `https://static.ads-twitter.com/uwt.js`,
			async: true,
			once: true,
			skip: isBraveBrowser,
			callback: () => {
				!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
				},s.version='1.1',s.queue=[])}(window,document,'script');
				// console.log(window.twq)
				twq('init','o8shs');
				twq('track','PageView');
			},
		})

		return {
			script: scripts,
		}
	},
}
