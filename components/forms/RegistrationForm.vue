<template>
	<b-form novalidate @submit.prevent="onSubmit">
		<b-form-group label="First Name" label-class="required">
			<b-form-input
				id="firstName"
				name="firstName"
				type="text"
				v-model="form.firstName"
				:state="validateState('form.firstName')">
			</b-form-input>
			<b-form-invalid-feedback :state="state.firstName">
				Please correct "First Name"
			</b-form-invalid-feedback>
		</b-form-group>
		<b-form-group label="Last Name" label-class="required">
			<b-form-input
				id="lastName"
				name="lastName"
				type="text"
				v-model="form.lastName"
				:state="validateState('form.lastName')">
			</b-form-input>
			<b-form-invalid-feedback :state="state.lastName">
				Please correct "Last Name"
			</b-form-invalid-feedback>
		</b-form-group>
		<b-form-group label="Email Address" label-class="required">
			<b-form-input
				id="email"
				name="email"
				type="email"
				v-model="form.email"
				:state="validateState('form.email')">
			</b-form-input>
			<b-form-invalid-feedback :state="state.email">
				Please correct "Email"
			</b-form-invalid-feedback>
		</b-form-group>
		<b-form-group label="Referral Code">
			<b-form-input
				id="referralCode"
				name="referralCode"
				debounce="500"
				type="text"
				v-model="form.referralCode"
				:state="validateState('form.referralCode')"
			></b-form-input>
			<b-form-invalid-feedback v-if="$v.form.referralCode.$anyError">
				Please correct "Referral Code"
			</b-form-invalid-feedback>
			<b-form-invalid-feedback v-if="!$v.form.referralCode.exists">
				Referral Code is invalid or doesn't exist
			</b-form-invalid-feedback>
		</b-form-group>
		<b-form-group label="Phone Number">
			<b-form-input
				id="phoneNumber"
				name="phoneNumber"
				type="text"
				v-model="form.phoneNumber"
				></b-form-input>
			<!-- <b-form-invalid-feedback :state="state.phoneNumber">
				Please correct "Phone Number"
			</b-form-invalid-feedback> -->
		</b-form-group>
		<b-overlay :show="isBusy" rounded>
			<b-button type="submit" block variant="primary">Register</b-button>
		</b-overlay>
	</b-form>
</template>

<script>
import { mapActions } from 'vuex'
import { validateState } from '@/utils'
import { required, alpha, alphaNum, email } from 'vuelidate/lib/validators'

export default {
	data() {
		return {
			isBusy: false,
			form: {
				publicKey: this.$wallet.account,
				referralCode: this.$route.query['ref'] || sessionStorage.getItem('ref'),
				tags: ['website-lead']
			},
		}
	},
	validations: {
		form: {
			email: { required, email },
			firstName: { required, alpha },
			lastName: { required, alpha },
			referralCode: {
				alphaNum,
				async exists(code) {
					if (!code) return true
					const { data: exists } = await this.$axios.get('/referrals/exists', {
						params: {
							code
						}
					})
					return exists
				}
			},
		},
	},
	computed: {
		state() {
			return {
				email: !this.$v.form.email.$anyError,
				firstName: !this.$v.form.firstName.$anyError,
				lastName: !this.$v.form.lastName.$anyError,
			}
		},
	},
	methods: {
		...mapActions(['signUp']),
		validateState,
		async onSubmit() {
			this.$v.$touch()
            if (this.$v.form.$invalid) {
				console.log(this.$v.form.referralCode)
				return
            }
			try {
				this.isBusy = true
				await this.signUp(this.form)
				this.$emit('done')
			} catch (err) {
				console.error({err})
			} finally {
				this.isBusy = false
			}
		}
	}
}
</script>
