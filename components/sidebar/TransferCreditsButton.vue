<template>
	<div>
		<b-button
			size="sm"
			block
			variant="primary"
			:disabled="userCredits === 0"
			v-b-modal="modalId"
			>Transfer</b-button
		>
		<b-modal
			:id="modalId"
			ok-title="Send"
			ok-variant="primary"
			@ok.prevent="onTransfer"
			title="Transfer Credits"
			centered
			no-close-on-backdrop>
			<div>
				<b-form-group label="Receiver address" label-class="required">
					<b-form-input
						name="receiverAddress"
						v-model="transfer.receiverAddress"
						:state="validateState('transfer.receiverAddress')">
					</b-form-input>
					<b-form-invalid-feedback :state="state.transfer.receiverAddress">
                        Please correct "Receiver Address"
					</b-form-invalid-feedback>
				</b-form-group>
				<b-form-group label="How many" label-class="required">
					<b-form-input
						name="count"
						v-model="transfer.count"
						type="number"
						min="1"
						:state="validateState('transfer.count')">
					</b-form-input>
					<b-form-invalid-feedback :state="state.transfer.count">
						Please correct "Credits count"
					</b-form-invalid-feedback>
				</b-form-group>
			</div>
		</b-modal>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, minValue } from 'vuelidate/lib/validators'
import { nanoid } from 'nanoid'
import { validateState, hasValidAddress } from '@/utils'

export default {
	data() {
		return {
			modalId: nanoid(),
			transfer: {
                receiverAddress: '',
                count: ''
            },
		}
	},
	validations: {
		transfer: {
			receiverAddress: {
                hasValidAddress,
			},
			count: {
				required,
				minValue: minValue(1),
			},
		},
	},
	computed: {
		...mapGetters(['userCredits']),
		state() {
            const { receiverAddress, count } = this.$v.transfer
			return {
				transfer: {
					receiverAddress: !receiverAddress.$anyError,
					count: !count.$anyError,
				},
			}
		},
	},
	methods: {
		validateState,
		async onTransfer() {
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
				this.$bvToast.toast(
					`${err.response?.status}: ${err.response?.data}` || 'Transfer failed',
					{
						title: 'Credit Transfer',
						variant: 'danger',
					}
				)
			}
		},
	},
}
</script>
