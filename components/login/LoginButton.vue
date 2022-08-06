<template>
	<div>
		<b-overlay :show="isBusy" rounded>
			<b-button
				v-if="$attrs.variant"
				v-bind="$attrs"
				class="text-decoration-none text-white"
				style="color: inherit"
				@click="tryLogin"
				>{{ caption }}</b-button
			>
			<b-button
				v-else
				v-bind="$attrs"
				class="bg-gradient-primary border-0 text-white"
				@click="tryLogin"
				>{{ caption }}</b-button
			>
		</b-overlay>
		<b-modal :id="modalId" title="Registration Form" centered hide-footer>
			<RegistrationForm @done="onRegistrationDone" />
		</b-modal>
	</div>
</template>

<script>
import { nanoid } from 'nanoid'
import { mapActions } from 'vuex'
import RegistrationForm from '@/components/forms/RegistrationForm'

export default {
	components: {
		RegistrationForm,
	},
	props: {
		caption: {
			type: String,
			default: 'Login',
		},
		redirect: String,
	},
	data() {
		return {
			modalId: nanoid(),
			isBusy: false,
		}
	},

	methods: {
		...mapActions(['login', 'signup']),
		async tryLogin() {
			try {
				this.isBusy = true

				if (!this.$wallet.isConnected) {
					await this.$wallet.connect()
				}

				const { account: publicKey } = this.$wallet

				const { data: nonce } = await this.$axios.get('/users/nonce', {
					params: { publicKey },
				})

				if (nonce) {
					await this.login()
					if (this.redirect) {
						this.$router.push(this.localePath(this.redirect))
					}
				} else {
					this.$bvModal.show(this.modalId)
				}
			} catch (err) {
				console.error(err)
			} finally {
				this.isBusy = false
			}
		},
		onRegistrationDone() {
			this.$bvModal.hide(this.modalId)
			if (this.redirect) {
				this.$router.push(this.localePath(this.redirect))
			}
		},
	},
}
</script>
