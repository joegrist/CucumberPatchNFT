<template>
	<div>
		<b-navbar toggleable="lg" type="light" variant="light" style="z-index: 3">
			<b-navbar-brand href="https://zerocodenft.com">
				<b-img img src="/logo-black.png" alt="logo" width="100px" />
			</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item to="/wizard" class="gradient-text">Wizard</b-nav-item>
					<b-nav-item
						v-if="isLoggedIn"
						to="/"
						class="gradient-text"
						>Dashboard</b-nav-item
					>
					<b-nav-item
						v-else
						@click="onLogin"
						class="gradient-text"
						>Login</b-nav-item
					>
				</b-navbar-nav>

				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<span v-if="$wallet.account" class="mr-2 my-auto"
						>{{ $wallet.balance }}
					</span>
					<b-avatar v-b-toggle.sidebar-1 class="bg-gradient-primary"></b-avatar>
				</b-navbar-nav>
			</b-collapse>
		</b-navbar>
		<b-sidebar
			v-model="isSidebarVisible"
			@shown="_ => isLoggedIn && $store.dispatch('getCreditsCount')"
			id="sidebar-1"
			title="Account"
			right
			backdrop
			z-index="100">
			<div class="px-3 py-4">
				<div v-if="!$wallet.account" class="mb-2">
					<b-button
						class="bg-gradient-primary border-0 w-100"
						:disabled="!!$wallet.account"
						@click="$wallet.connect">
						<strong>Connect Wallet</strong>
					</b-button>
				</div>
				<div v-if="$wallet.account">
					<p>
						Address:
						<span class="pointer" @click="onAccountCopy"> {{ $wallet.accountCompact }} 
            				<b-icon icon="files" ></b-icon>
						</span>
					</p>
					<p>Balance: {{ $wallet.balance }}</p>
					<p class="text-capitalize">Network: {{ $wallet.networkName }}</p>
				</div>
				<p v-if="isLoggedIn">Credits: {{ $store.state.user.credits }}</p>
			</div>
			<template #footer>
				<b-button
					v-if="isLoggedIn"
					class="bg-gradient-primary border-0 rounded-0 w-100"
					@click="onLogout"
					size="lg"
					>Logout</b-button
				>
				<b-button
					v-else
					class="bg-gradient-primary border-0 rounded-0 w-100"
					@click="onLogin"
					size="lg"
					>Login</b-button
				>
			</template>
		</b-sidebar>
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
			<b-spinner
				style="width: 3rem; height: 3rem"
				class="m-3"
				label="Loading..."
				type="grow"></b-spinner>
		</b-modal>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
	data() {
		return {
			isSidebarVisible: false,
		}
	},
	computed: {
		...mapGetters(['isLoggedIn'])
	},
	methods: {
		async onLogin() {
			await this.$store.dispatch('login')
		},
		onLogout() {
			this.isSidebarVisible = false
			this.$store.dispatch('logout')
			this.$router.push('/wizard')
		},
		disconnect() {
			this.isSidebarVisible = false
			this.$wallet.disconnect()
		},
		async onAccountCopy() {
			await navigator.clipboard.writeText(this.$wallet.account)
			this.$bvToast.toast('Address copied to clipboard', {
				title: 'Wallet',
				variant: 'info',
			})
		},
	},
}
</script>
