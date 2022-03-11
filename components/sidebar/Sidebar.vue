<template>
    <b-sidebar
			v-model="isSidebarOpen"
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
						@click="$wallet.connect">
						<strong>Connect Wallet</strong>
					</b-button>
				</div>
				<div v-else>
					<p>
						Address:
						<span class="pointer" @click="copyToClipboard($wallet.account)"> {{ $wallet.accountCompact }} 
            				<b-icon icon="files" ></b-icon>
						</span>
					</p>
					<p>Balance: {{ $wallet.balance }}</p>
					<p class="text-capitalize">Network: {{ $wallet.networkName }}</p>
				</div>
				<div v-if="isLoggedIn" class="d-flex">
					<span class="my-auto mr-2">Credits: {{ userCredits }}</span>
					<!-- <b-button class="mx-2" size="sm" variant="primary">Buy</b-button> -->
					<TransferCreditsButton />
				</div>
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
</template>

<script>
import TransferCreditsButton from './TransferCreditsButton.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { copyToClipboard } from '@/utils'

export default {
    components: {
        TransferCreditsButton
    },
	computed: {
        ...mapGetters(['isLoggedIn', 'userCredits']),
        isSidebarOpen: {
            get: function() {
                return this.$store.state.isSidebarOpen
            },
            set: function(value) {
                this.showSidebar(value)
            }
        },
	},
	methods: {
		...mapMutations(['showSidebar']),
		...mapActions(['login', 'logout']),
		copyToClipboard,
		onLogout() {
			this.showSidebar(false)
			this.logout()
			this.$router.push('/wizard')
		},
		disconnect() {
			this.showSidebar(false)
			this.$wallet.disconnect()
		}
	},
}
</script>