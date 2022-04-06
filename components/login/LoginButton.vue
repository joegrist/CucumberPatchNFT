<template>
	<div>
		<b-button v-if="$attrs.variant" v-bind="$attrs" class="text-decoration-none" style="color:inherit" @click="tryLogin">{{
			caption
		}}</b-button>
		<b-button v-else v-bind="$attrs" class="bg-gradient-primary border-0" @click="tryLogin">{{
			caption
		}}</b-button>
		<b-modal :id="modalId" title="Register" centered hide-footer>
			<RegistrationForm @done="$bvModal.hide(modalId)" />
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
		}
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
			} else {
				this.$bvModal.show(this.modalId)
			}
		},
	}
}
</script>
