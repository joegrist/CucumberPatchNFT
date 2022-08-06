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
			<div v-if="!$wallet.isConnected" class="mb-2">
				<b-button block variant="primary" @click="$wallet.connect">
					<strong>Connect Wallet</strong>
				</b-button>
			</div>
			<b-list-group flush>
				<template v-if="$wallet.account">
					<b-list-group-item>
						Address:
						<span class="pointer">
							{{ $wallet.accountCompact }}
							<Copy :value="$wallet.account" />
						</span>
					</b-list-group-item>
					<b-list-group-item
						>Balance: {{ $wallet.balanceFormatted }}</b-list-group-item
					>
					<b-list-group-item class="text-capitalize"
						>Network: {{ $wallet.networkName }}</b-list-group-item
					>
				</template>
				<template v-if="isLoggedIn && userCredits > 0">
					<b-list-group-item>
						<p class="mb-1">Credits: {{ userCredits }}</p>
						<TransferCreditsButton />
					</b-list-group-item>
				</template>
				<template v-if="referral">
					<b-list-group-item>Referrals: {{ referral.count }}</b-list-group-item>
					<b-list-group-item
						>Referral Code:
						<span class="pointer">
							{{ referral.code }}
							<Copy
								:value="`https://app.zerocodenft.com?ref=${referral.code}`" />
						</span>
					</b-list-group-item>
					<b-list-group-item
						>Referral Balance: Ξ{{
							referral.balanceEth.toFixed(2)
						}}</b-list-group-item
					>
				</template>
				<template v-if="isLoggedIn && !referral">
					<b-list-group-item>
						<BecomeAmbasssadorButton />
					</b-list-group-item>
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
import LoginButton from '@/components/login/LoginButton.vue'
import BecomeAmbasssadorButton from './BecomeAmbassadorButton.vue'

export default {
	components: {
		BecomeAmbasssadorButton,
		TransferCreditsButton,
		LoginButton,
	},
	computed: {
		...mapGetters(['userId', 'isLoggedIn', 'userCredits', 'referral']),
		isSidebarOpen: {
			get: function () {
				return this.$store.state.isSidebarOpen
			},
			set: function (value) {
				this.showSidebar(value)
			},
		},
	},
	methods: {
		...mapMutations(['showSidebar']),
		...mapActions(['login', 'logout', 'loadUser']),
		onLogout() {
			this.showSidebar(false)
			this.logout()
			this.$router.push(this.localePath('/login'))
		},
		async onShown() {
			this.$wallet.refreshBalance()
			if (this.isLoggedIn) {
				await this.loadUser(this.userId)
			}
		},
		disconnect() {
			this.showSidebar(false)
			this.$wallet.disconnect()
		},
	},
}
</script>
