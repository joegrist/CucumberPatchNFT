<template>
	<div>
		<b-navbar toggleable="lg" type="light" variant="light" style="z-index: 3">
			<b-navbar-brand href="https://zerocodenft.com">
				<b-img img src="/logo-black.png" alt="logo" width="100px" />
			</b-navbar-brand>

			<b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

			<b-collapse id="nav-collapse" is-nav>
				<b-navbar-nav>
					<b-nav-item to="/wizard" class="gradient-text my-auto">Wizard</b-nav-item>
					<b-nav-item v-if="isLoggedIn" to="/" class="gradient-text"
						>Dashboard</b-nav-item
					>
					<b-nav-item v-else class="gradient-text">
						<LoginButton variant="link" />
					</b-nav-item
					>
				</b-navbar-nav>

				<!-- Right aligned nav items -->
				<b-navbar-nav class="ml-auto">
					<!-- <span v-if="$wallet.account" class="mr-2 my-auto"
						>{{ $wallet.balance }}
					</span> -->
					<b-avatar
						button 
						@click="showSidebar(true)"
						class="bg-gradient-primary"
					></b-avatar>
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
import { mapGetters, mapMutations, mapActions } from 'vuex'
import LoginButton from '@/components/auth/LoginButton.vue'

export default {
	components: {
		Sidebar,
		LoginButton
	},
	computed: {
		...mapGetters(['isLoggedIn']),
	},
	methods: {
		...mapMutations(['showSidebar']),
		...mapActions(['login'])
	},
}
</script>
