<template>
	<b-form v-if="showForm" @reset.prevent="onFormReset(reset)">
		<b-container>
			<b-row>
				<b-col>
					<b-form-group>
						<b-form-checkbox
							id="delayedRevealFeature"
							name="delayedRevealFeature"
                            switch
                            size="lg"
							:checked="smartContractBuilder.hasDelayedReveal"
							@change="
								(val) => updateSmartContractBuilder({ hasDelayedReveal: val })
							">
							Delayed Reveal
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group
						label="Placeholder URL"
						description="URL to the .json file that contains generic metadata"
						:label-class="{ required: smartContractBuilder.hasDelayedReveal }"
						:disabled="!smartContractBuilder.hasDelayedReveal">
						<b-form-input
							id="delayedRevealURL"
							name="delayedRevealURL"
							:value="smartContractBuilder.delayedRevealURL"
							@change="
								(val) => updateSmartContractBuilder({ delayedRevealURL: val })
							"
							@blur="$v.smartContractBuilder.delayedRevealURL.$touch()"
							:class="{
								'is-invalid': $v.smartContractBuilder.delayedRevealURL.$error,
							}"
							type="text"
							placeholder="ipfs://..."></b-form-input>
						<b-form-invalid-feedback :state="validation.delayedRevealURL">
							Enter the URL
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group>
						<b-form-checkbox
							id="whitelistFeature"
							name="whitelistFeature"
                            switch
                            size="lg"
							:checked="smartContractBuilder.hasWhitelist"
							@change="
								(val) => updateSmartContractBuilder({ hasWhitelist: val })
							">
							Whitelist
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group
						label="Presale Price"
						description="Can be the same as public sale price or zero to allow free mint"
						:label-class="{ required: smartContractBuilder.hasWhitelist }"
						:disabled="!smartContractBuilder.hasWhitelist">
						<b-form-input
							id="whitelistPrice"
							name="whitelistPrice"
							:value="smartContractBuilder.whitelistPrice"
							@change="
								(val) =>
									updateSmartContractBuilder({
										whitelistPrice: val ? +val : null,
									})
							"
							@blur="$v.smartContractBuilder.whitelistPrice.$touch()"
							:class="{
								'is-invalid': $v.smartContractBuilder.whitelistPrice.$error,
							}"
							type="number"
							step="any"
							min="0"
							placeholder="0.03"></b-form-input>
						<b-form-invalid-feedback :state="validation.whitelistPrice">
							Please correct "Presale Price"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group
						label="List of wallet addresses"
						description="Paste address and press Enter to save. Can be updated later on">
						<b-form-tags
							id="whitelist"
							name="whitelist"
							:disabled="!smartContractBuilder.hasWhitelist"
							:value="smartContractBuilder.whitelist"
							@input="(val) => updateSmartContractBuilder({ whitelist: val })"
							placeholder="0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199">
						</b-form-tags>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-button class="float-right" type="reset" variant="danger"
						>Reset</b-button
					>
				</b-col>
			</b-row>
		</b-container>
	</b-form>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { requiredIf, decimal, minValue } from 'vuelidate/lib/validators'

export default {
	data() {
		return {
			reset: {
				delayedRevealURL: null,
				whitelistPrice: null,
				whitelist: []
			},
		}
	},
	mixins: [smartContractBuilderMixin],
	computed: {
		validation() {
			return {
				delayedRevealURL: !this.$v.smartContractBuilder.delayedRevealURL.$error,
				whitelistPrice: !this.$v.smartContractBuilder.whitelistPrice.$error,
			}
		},
	},
	validations: {
		smartContractBuilder: {
			delayedRevealURL: {
				required: requiredIf(function () {
					return this.smartContractBuilder.hasDelayedReveal
				}),
			},
			whitelistPrice: {
				required: requiredIf(function () {
					return this.smartContractBuilder.hasWhitelist
				}),
				decimal,
				minValue: minValue(0),
			},
		},
	},
}
</script>
