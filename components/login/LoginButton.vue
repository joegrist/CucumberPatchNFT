<template>
	<div>
		<b-button v-if="$attrs.variant" v-bind="$attrs" class="text-decoration-none text-white" style="color:inherit" @click="tryLogin">{{
			caption
		}}</b-button>
		<b-button v-else v-bind="$attrs" class="bg-gradient-primary border-0 text-white" @click="tryLogin">{{
			caption
		}}</b-button>
		<b-modal :id="modalId" title="Register" centered hide-footer>
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
		RegistrationForm
	},
	props: {
		caption: {
			type: String,
			default: 'Login',
		},
		redirect: String
	},
	data() {
		return {
			modalId: nanoid()
		}
	},

	methods: {
		...mapActions(['login', 'signup']),
		async tryLogin() {
			if(!this.$wallet.isConnected) {
				await this.$wallet.connect()
			}
			
			const { account: publicKey } = this.$wallet
			
			const { data: nonce } = await this.$axios.get("/users/nonce", { params: { publicKey }})

			if(nonce) {
				await this.login()
				if(this.redirect) {
					this.$router.push(this.redirect)
				}
			} else {
				this.$bvModal.show(this.modalId)
			}
		},
		onRegistrationDone() {
			this.$bvModal.hide(this.modalId)
			if(this.redirect) {
				this.$router.push(this.redirect)
			}
		}
	}
}
</script>
