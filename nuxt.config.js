import getSiteMeta from './scripts/siteMeta'

const {
	API_URL,
	OPENSEA_API_KEY,
	DISCORD_INVITE_URL,
	MINT_SITE_URL,
	DISCORD_SERVER,
	DISCORD_CHANNEL,
	GTAG_ID,
	GTAG_DEBUG,
} = process.env

export default {
	// Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
	ssr: false,

	server: {
		port: 9000,
	},

	// Target: https://go.nuxtjs.dev/config-target
	target: 'static',

	publicRuntimeConfig: {
		API_URL,
		OPENSEA_API_KEY,
		DISCORD_INVITE_URL,
		MINT_SITE_URL,
		DISCORD_SERVER,
		DISCORD_CHANNEL,
		GTAG_ID,
		GTAG_DEBUG,
	},

	router: {
		middleware: 'alerts',
	},

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: 'Zero Code NFT App',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' }, // mobile responsive https://search.google.com/test/mobile-friendly
			{ name: 'format-detection', content: 'telephone=no' },
			{
				hid: 'description',
				name: 'description',
				content: 'Drop your NFT collection with ZERO coding skills!',
			},
			{ property: 'og:site_name', content: 'Zero Code NFT App' },
			...getSiteMeta(),
		],
		link: [{ rel: 'icon', type: 'image/x-icon', href: '/zero-code-icon.png' }],
		script: [
			{
				hid: 'discord-widget-bot',
				src: 'https://cdn.jsdelivr.net/npm/@widgetbot/crate@3',
				async: true,
				defer: true,
				callback: () => {
					new Crate({
						server: $nuxt.$config.DISCORD_SERVER,
						channel: $nuxt.$config.DISCORD_CHANNEL,
						notifications: true,
						indicator: true,
						glyph: ['/chat_white.svg', '30px'],
					})
				},
			},
		],
	},

	sitemap: {
		hostname: 'https://app.zerocodenft.com',
		exclude: ['/admin/**'],
		defaults: {
			changefreq: 'daily',
			priority: 1,
			lastmod: new Date(),
		},
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: ['@/assets/styles/main.scss', 'prismjs/themes/prism.css'],

	styleResources: {
		scss: ['@/assets/styles/variables.scss'],
	},

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		'@/plugins/axios',
		// '@/plugins/netlify',
		'@/plugins/vuelidate',
		'@/plugins/filters',
		'@/plugins/wallet',
		'@/plugins/vue-prism',
	],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: ['@/components', '@/components/dashboard'],

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		// https://go.nuxtjs.dev/bootstrap
		'bootstrap-vue/nuxt',
		// https://go.nuxtjs.dev/axios
		'@nuxtjs/axios',
		// https://go.nuxtjs.dev/pwa
		'@nuxtjs/pwa',
		'@nuxtjs/sitemap',
		// '@nuxtjs/recaptcha',
		'@nuxtjs/style-resources',
		'@nuxtjs/i18n',
		'vue-social-sharing/nuxt',
	],

	i18n: {
		locales: [
			{
				code: 'en',
				iso: 'en-US',
			},
			{
				code: 'es',
				iso: 'es-ES',
			},
			{
				code: 'ua',
				iso: 'uk-UA',
			},
		],
		defaultLocale: 'en',
		vueI18nLoader: true,
		// vueI18n: {
		// 	fallbackLocale: 'en',
		// 	messages: {

		// 	},
		// },
	},

	// recaptcha: {
	//   siteKey: RECAPTCHA_KEY,
	//   version: 3,
	//   size: 'compact'
	// },

	bootstrapVue: {
		icons: true,
		bootstrapCSS: false,
		bootstrapVueCSS: false,
	},

	// Axios module configuration: https://go.nuxtjs.dev/config-axios
	axios: {
		baseURL: API_URL,
	},

	// PWA module configuration: https://go.nuxtjs.dev/pwa
	pwa: {
		icon: {
			source: '/static/zero-code-icon.png',
			fileName: 'zero-code-icon.png',
		},
		manifest: {
			name: 'Zero Code NFT',
			short_name: 'ZCNFT',
		},
		meta: {
			name: 'Zero Code NFT',
			ogHost: 'https://app.zerocodenft.com',
			twitterCard: 'summary_large_image',
			twitterSite: 'Drop your NFT collection with ZERO code!',
			twitterCreator: 'zero_code_nft',
		},
	},

	generate: {
		fallback: true,
	},

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {
		loaders: {
			scss: {
				sassOptions: {
					quietDeps: true,
				},
			},
		},
		extend(config, { isDev, isClient }) {
			config.node = {
				fs: 'empty',
			}
		},
	},
}
