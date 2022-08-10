import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import { mapState, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState(['tourPrompts']),
		canTour() {
			return (
				(this.$route.path === '/' && this.dashboardItems.length) ||
				this.$route.path === '/project'
			)
		},
	},
	methods: {
		...mapMutations(['updateTourPrompts']),
		async initTour(tourId) {
			const driver = new Driver({
				allowClose: false,
			})
			const { [tourId]: steps } = await import('@/assets/data/tourSteps')
			driver.defineSteps(steps)
			driver.start()
		},
		startTour() {
			switch (this.$route.path) {
				case '/':
					this.initTour('dashboard')
					this.updateTourPrompts({
						dashboard: false,
					})
					break
				case '/project':
					this.$root.$emit('activate-smart-contract-tab');
					this.initTour('project')
					this.updateTourPrompts({
						project: false,
					})
					break
			}
		},
	},
}
