<template>
	<div>
		<b-navbar toggleable="lg" type="light" variant="light" style="z-index: 3">
			<b-navbar-brand href="https://zerocodenft.com">
				<b-img img src="/logo-black.png" alt="logo" width="100px" />
			</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item
						to="/wizard"
						active-class="active-nav"
						class="text-center text-md-left"
						>Wizard</b-nav-item
					>
					<b-nav-item
						v-if="isLoggedIn"
						to="/"
						exact
						active-class="active-nav"
						class="text-center text-md-left"
						>Dashboard</b-nav-item
					>
					<b-nav-item v-else class="gradient-text" to="/login"
						>Login</b-nav-item
					>
					<b-nav-item
						v-show="canTour"
						active-class="active-nav"
						class="text-center text-md-left"
						@click="handleTourToggle">
						{{ isProductTourActivated ? 'End tour' : 'Start tour' }}</b-nav-item
					>
				</b-navbar-nav>

				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<b-button
						variant="transparent"
						class="gradient-text border d-flex"
						@click="showSidebar(true)">
						<b-avatar
							class="bg-gradient-primary my-auto"
							:src="$wallet.avatarUrl"></b-avatar>
						<div
							class="d-flex flex-column ml-1 my-auto text-left"
							style="line-height: 1.2">
							<span>{{ walletAddress }}</span>
							<span v-if="$wallet.isConnected" class="text-muted small">{{
								$wallet.balanceFormatted
							}}</span>
						</div>
					</b-button>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
		<b-modal
			v-model="$store.state.isBusy"
			body-class="text-center"
			title="Loading..."
			size="lg"
			centered
			no-close-on-backdrop
			no-close-on-esc
			hide-footer
			hide-header-close>
			<h4
				v-if="$store.state.isBusyMessage"
				v-html="$store.state.isBusyMessage"
				class="break-word"></h4>
			<b-spinner
				style="width: 3rem; height: 3rem"
				class="m-3"
				label="Loading..."
				type="grow"></b-spinner>
		</b-modal>
		<Sidebar />
	</div>
</template>

<script>
import Sidebar from '@/components/sidebar/Sidebar.vue'
import { mapGetters, mapMutations, mapActions, mapState } from 'vuex'
import LoginButton from '@/components/login/LoginButton.vue'
export default {
	components: {
		Sidebar,
		LoginButton,
	},
	computed: {
		...mapState(['dashboardItems']),
		...mapGetters(['isLoggedIn', 'isProductTourActivated']),
		walletAddress() {
			return this.$wallet.ensName || this.$wallet.accountCompact
		},
		canTour() {
			return this.$route.path === '/' && this.dashboardItems.length
		}
	},
	methods: {
		...mapMutations(['showSidebar', 'toggleProductTourStatus']),
		...mapActions(['login', 'logout']),
		onLogout() {
			this.logout()
			this.$router.push('/login')
		},
		handleTourToggle() {
			this.toggleProductTourStatus()
			if (!this.isProductTourActivated) {
				this.$bvToast.toast('Tour has been finished.', {
					title: 'Dashboard Tour',
					variant: 'info',
				})
				return
			}
			/* if (this.$route.path !== '/') {
				this.$router.push('/')
			} else {
				this.$router.go(0)
			} */
		},
	},
}
</script>
