<template>
	<b-form novalidate @submit.prevent="onSubmit">
		<b-form-group label="First Name" label-class="required">
			<b-form-input
				id="firstName"
				name="firstName"
				type="text"
				v-model="form.firstName"
				:class="{
					'is-invalid': $v.form.firstName.$anyError,
				}"
				required></b-form-input>
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
				:class="{
					'is-invalid': $v.form.lastName.$anyError,
				}"
				required></b-form-input>
			<b-form-invalid-feedback :state="state.lastName">
				Please correct "Last Name"
			</b-form-invalid-feedback>
		</b-form-group>
		<b-form-group label="Email Address" label-class="required">
			<b-form-input
				id="email"
				name="email"
				type="email"
				placeholder="john.doe@gmail.com"
				v-model="form.email"
				:class="{
					'is-invalid': $v.form.email.$anyError,
				}"
				required></b-form-input>
			<b-form-invalid-feedback :state="state.email">
				Please correct "Email"
			</b-form-invalid-feedback>
		</b-form-group>
		<b-form-group label="Referral Code">
			<b-form-input
				id="referralCode"
				name="referralCode"
				type="text"
				v-model="form.referralCode"
				:class="{
					'is-invalid': $v.form.referralCode.$anyError,
				}"
				></b-form-input>
			<b-form-invalid-feedback :state="state.referralCode">
				Please correct "Referral Code"
			</b-form-invalid-feedback>
		</b-form-group>
		<!-- <b-form-group label="Phone Number">
			<b-form-input
				id="phoneNum"
				name="phoneNum"
				type="text"
				v-model="form.phoneNum"
				:class="{
					'is-invalid': $v.form.phoneNum.$anyError,
				}"
				></b-form-input>
			<b-form-invalid-feedback :state="state.phoneNum">
				Please correct "Phone Number"
			</b-form-invalid-feedback>
		</b-form-group> -->
		<b-button type="submit" block variant="success">Register</b-button>
	</b-form>
</template>

<script>
import { mapActions } from 'vuex'
import { required, alpha, alphaNum, email } from 'vuelidate/lib/validators'

export default {
	data() {
		return {
			form: {
				publicKey: this.$wallet.account
			},
		}
	},
	validations: {
		form: {
			email: { required, email },
			firstName: { required, alpha },
			lastName: { required, alpha },
			referralCode: { alphaNum },
		},
	},
	computed: {
		state() {
			return {
				email: !this.$v.form.email.$anyError,
				firstName: !this.$v.form.firstName.$anyError,
				lastName: !this.$v.form.lastName.$anyError,
				referralCode: !this.$v.form.referralCode.$anyError,
			}
		},
	},
	methods: {
		...mapActions(['signUp']),
		async onSubmit() {
			this.$v.$touch()
            if (this.$v.form.$invalid) {
				return
            }
			else {
				await this.signUp(this.form)
				this.$emit('done')
			}
		}
	}
}
</script>
