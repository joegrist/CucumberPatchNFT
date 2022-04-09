<template>
	<div>
		<b-button size="sm" variant="primary" v-b-modal="modalId"
			>Refer and Earn!</b-button
		>
		<b-modal :id="modalId" centered title="Earn 25% commission" hide-footer>
            <b-form novalidate @submit.prevent="onSubmit">
                <b-form-group
                    label="Referral code"
                    label-class="required"
                    description="Alphanumeric, min 3 characters. Code you would like to use as your referral code">
                    <b-form-input
                        name="ambassadorCode"
                        debounce="500"
                        v-model="ambassadorCode"
                        :state="validation"
                    >
                    </b-form-input>
                    <b-form-invalid-feedback v-if="$v.ambassadorCode.$anyError">
                        Please correct "Ambassador code"
                    </b-form-invalid-feedback>
                    <b-form-invalid-feedback v-if="!$v.ambassadorCode.isUnique">
                        "{{ ambassadorCode }}" is already taken
                    </b-form-invalid-feedback>
                </b-form-group>
                <b-button type="submit" block variant="primary">Submit</b-button>
            </b-form>
		</b-modal>
	</div>
</template>

<script>
import { required, alphaNum, minLength } from 'vuelidate/lib/validators'
import { nanoid } from 'nanoid'

export default {
	data() {
		return {
			ambassadorCode: null,
            modalId: nanoid()
		}
	},
	validations: {
		ambassadorCode: {
			required,
			alphaNum,
            minLength: minLength(3),
            async isUnique(value) {
                if (value === '') return true

                const {data: isTaken} = await this.$axios.get('/referrals/exists', { params: { code: this.ambassadorCode }})
                return !isTaken
            }
		},
	},
	computed: {
		validation() {
            return this.$v.ambassadorCode.$dirty ? (!this.$v.ambassadorCode.$anyError && this.$v.ambassadorCode.isUnique) : null
		},
	},
    methods: {
        async onSubmit() {
            try {
                this.$v.$touch()
                if (this.$v.$invalid) {
                    return
                }
                await this.$store.dispatch('becomeAmbassador', {
                    code: this.ambassadorCode
                })
                this.$bvModal.hide(this.modalId)
                this.$bvToast.toast('Submission accepted', {
                    title: 'Referral Code',
                    variant: 'success',
                })
            } catch (err) {
                this.$bvToast.toast('Submission failed', {
                    title: 'Referral Code',
                    variant: 'danger',
                })
            }
        }
    }
}
</script>
