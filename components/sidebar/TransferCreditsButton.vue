<template>
    <div>
        <b-button size="sm" variant="primary" :disabled="userCredits === 0" v-b-modal="modalId">Transfer</b-button>
        <b-modal
            :id="modalId"
            ok-title="Send"
            ok-variant="success"
            @ok="onTransfer"
			title="Transfer Credits"
			centered
			no-close-on-backdrop>
			<div>
				<b-form-group
					label="Receiver address"
					label-class="required">
					<b-form-input
						name="receiverAddress"
						v-model="transfer.receiverAddress"
                        :class="{
                          'is-invalid': $v.transfer.receiverAddress.$anyError,
                        }">
					</b-form-input>
                    <b-form-invalid-feedback :state="validation.transfer.receiverAddress">
                        <span v-show="!$v.transfer.receiverAddress.required">Address is required</span>
                        <span v-show="!$v.transfer.receiverAddress.validAddress">Address is invalid</span>
                    </b-form-invalid-feedback>
				</b-form-group>
				<b-form-group
					label="How many"
					label-class="required">
					<b-form-input
						name="count"
						v-model="transfer.count"
                        :class="{
                          'is-invalid': $v.transfer.count.$anyError,
                        }"
						type="number"
						min="1">
					</b-form-input>
                    <b-form-invalid-feedback :state="validation.transfer.count">
                        Please correct "Credits count"
                    </b-form-invalid-feedback>
				</b-form-group>
			</div>
		</b-modal>
    </div>
</template>

<script>
import { ethers } from 'ethers'
import { mapGetters } from 'vuex'
import {
    required,
	minValue,
} from 'vuelidate/lib/validators'
import { nanoid } from 'nanoid'

export default {
    data() {
        return {
            modalId: nanoid(),
            transfer: {}
        }
    },
    validations: {
        transfer: {
            receiverAddress: { 
                required,
                validAddress: val => val ? ethers.utils.isAddress(val) : true
            },
            count: {
                required, minValue: minValue(1)
            }
        }
    },
    computed: {
		...mapGetters(['userCredits']),
        validation() {
			return {
                transfer: {
                    receiverAddress: !this.$v.transfer.receiverAddress.$anyError,
                    count: !this.$v.transfer.count.$anyError,
                }
			}
		},
    },
    methods: {
        onBlur(control) {
            this.$v.transfer[control].$touch()
        },
        async onTransfer(e) {
            e.preventDefault()
            this.$v.$touch()
            if (this.$v.$invalid) {
                return
            }
            try {
                await this.$axios.post('/users/credits/transfer', this.transfer)
                await this.$store.dispatch('getCreditsCount')
                this.$bvModal.hide(this.modalId)
                this.$bvToast.toast('Transfer successful', {
                    title: 'Credit Transfer',
                    variant: 'success',
                })
            } catch (err) {
                console.log({err})
                this.$bvToast.toast(`${err.response?.status}: ${err.response?.data}` || 'Transfer failed', {
                    title: `Credit Transfer`,
                    variant: 'danger',
                })
            }
        }
    }
}
</script>