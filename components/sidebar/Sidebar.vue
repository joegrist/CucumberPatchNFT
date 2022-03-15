<template>
    <b-sidebar
			v-model="isSidebarOpen"
			@shown="onShown"
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
				<b-list-group flush>
					<template v-if="$wallet.account">
						<b-list-group-item>
							Address:
							<span class="pointer"> {{ $wallet.accountCompact }}
								<Copy :value="$wallet.account" />
							</span>
						</b-list-group-item>
						<b-list-group-item>Balance: {{ $wallet.balance }}</b-list-group-item>
						<b-list-group-item class="text-capitalize">Network: {{ $wallet.networkName }}</b-list-group-item>
					</template>
					<template v-if="isLoggedIn">
						<b-list-group-item>
							<span>Credits: {{ userCredits }}</span>
							<TransferCreditsButton />
						</b-list-group-item>
					</template>
					<template v-if="referral">
						<b-list-group-item>Referrals: {{ referral.count }}</b-list-group-item>
						<b-list-group-item>Referral Code:
							<span class="pointer"> {{ referral.code }} 
								<Copy :value="referral.code" />
							</span>
						</b-list-group-item>
						<b-list-group-item>Referral Balance: ${{ referral.balance.toFixed(2) }}</b-list-group-item>
					</template>
				</b-list-group>
			</div>
			<template #footer>
				<b-button
					v-if="isLoggedIn"
					block
					class="bg-gradient-primary border-0 rounded-0"
					@click="onLogout"
					size="lg"
					>Logout</b-button
				>
				<LoginButton v-else size="lg" block squared />
			</template>
		</b-sidebar>
</template>

<script>
import TransferCreditsButton from './TransferCreditsButton.vue'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import LoginButton from '@/components/auth/LoginButton.vue'

export default {
    components: {
        TransferCreditsButton,
		LoginButton
    },
	computed: {
        ...mapGetters(['userId', 'isLoggedIn', 'userCredits', 'referral']),
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
		...mapActions(['login', 'logout', 'loadUser']),
		onLogout() {
			this.showSidebar(false)
			this.logout()
			this.$router.push('/wizard')
		},
		async onShown(){
			this.$wallet.refreshBalance()
			if(this.isLoggedIn) {
				await this.loadUser(this.userId)
			}
		},
		disconnect() {
			this.showSidebar(false)
			this.$wallet.disconnect()
		}
	},
}
</script>