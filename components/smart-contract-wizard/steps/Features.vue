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
								(hasDelayedReveal) => updateSmartContractBuilder({ hasDelayedReveal })
							">
							Delayed Reveal
						</b-form-checkbox>
						<span class="text-muted">Your customers will see a placeholder image on all NFTs until the reveal date</span>
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
								(hasWhitelist) => updateSmartContractBuilder({ hasWhitelist })
							">
							Whitelist
						</b-form-checkbox>
						<span class="text-muted">Give specific group of people (team, early supporters, etc.) access to mint before others</span>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row v-show="smartContractBuilder.hasWhitelist">
				<b-col sm="12" md="6">
					<b-form-group
						description="Can be the same as public sale price or even zero to allow free mint"
						:label="`Price per NFT in ${currency}`"
						label-class="required"
						:disabled="!smartContractBuilder.hasWhitelist">
						<b-form-input
							id="whitelistPrice"
							name="whitelistPrice"
							type="number"
							step="any"
							min="0"
							:value="smartContractBuilder.whitelistPrice"
							@change="
								(val) =>
									updateSmartContractBuilder({
										whitelistPrice: val ? +val : null,
									})
							"
							@blur="$v.smartContractBuilder.whitelistPrice.$touch()"
							:state="
								validateState('smartContractBuilder.whitelistPrice')
							"></b-form-input>
						<b-form-invalid-feedback :state="state.whitelistPrice">
							Please correct "Whitelist Price"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
				<b-col sm="12" md="6">
					<b-form-group
						label="Max NFTs Per Person"
						description="Maximum number of tokens someone can mint during whitelist sale, independent of public"
						label-class="required"
						:disabled="!smartContractBuilder.hasWhitelist">
						<b-form-input
							id="maxTokensPerPersonOnWhitelist"
							name="maxTokensPerPersonOnWhitelist"
							type="number"
							step="1"
							min="1"
							:value="smartContractBuilder.maxTokensPerPersonOnWhitelist"
							@change="
								(val) =>
									updateSmartContractBuilder({
										maxTokensPerPersonOnWhitelist: val ? +val : null,
									})
							"
							@blur="
								$v.smartContractBuilder.maxTokensPerPersonOnWhitelist.$touch()
							"
							:state="
								validateState(
									'smartContractBuilder.maxTokensPerPersonOnWhitelist'
								)
							"></b-form-input>
						<b-form-invalid-feedback
							:state="state.maxTokensPerPersonOnWhitelist">
							Please correct "Max NFTs Per Person"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col sm="12" md="8">
					<b-form-group>
						<b-form-checkbox
							id="revenueSplitFeature"
							name="revenueSplitFeature"
							switch
							size="lg"
							:checked="smartContractBuilder.hasRevenueSplits"
							@change="
								(hasRevenueSplits) => updateSmartContractBuilder({ hasRevenueSplits })
							">
							Primary Sales Revenue Splits
						</b-form-checkbox>
						<span class="text-muted">Skip when you (the collection owner) are the 100% shareholder</span>
					</b-form-group>
				</b-col>
				<b-col sm="12" md="4" class="text-left text-md-right mb-2 mb-md-0">
					<b-button
						v-show="smartContractBuilder.hasRevenueSplits"
						variant="outline-success"
						@click="onAddSplit">
						Add Split <b-icon icon="diagram3" />
					</b-button>
				</b-col>
			</b-row>
			<b-row v-show="smartContractBuilder.hasRevenueSplits" v-for="(split, idx) in revenueSplits" :key="idx">
				<b-col sm="12" md="8">
					<b-form-group
						:label="`Wallet Address ${idx+1}`"
						label-class="required"
						:disabled="!smartContractBuilder.hasRevenueSplits">
						<b-form-input
							type="text"
							:name="`wallet${idx}`"
							:value="split.wallet"
							@change="(val) => onSplitWalletUpdate(val, idx)"
							@blur="$v.revenueSplits.$each[idx].wallet.$touch()"
							:state="
								validateState(
									`revenueSplits.$each[${idx}].wallet`
							)"></b-form-input>
							<b-form-invalid-feedback :state="!$v.revenueSplits.$each[idx].wallet.$anyError">
								Please correct "Wallet Address"
							</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
				<b-col sm="12" md="3">
					<b-form-group
						label="Share %"
						label-class="required"
						:disabled="!smartContractBuilder.hasRevenueSplits">
						<b-form-input
							:name="`share${idx}`"
							:value="split.share"
							type="number"
							step="any"
							min="0"
							@change="(val) => onSplitShareUpdate(val ? +val : 0, idx)"
							@blur="$v.revenueSplits.$each[idx].share.$touch()"
							:state="validateState(`revenueSplits.$each[${idx}].share`)"
							></b-form-input>
							<b-form-invalid-feedback :state="!$v.revenueSplits.$each[idx].share.$anyError">
								Please correct "Share"
							</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
				<b-col sm="12" md="1">
					<b-form-group label-class="text-center d-none d-md-block">
						<template #label> Actions </template>
						<b-button
							block
							variant="danger"
							@click="onRemoveSplit(idx)"
							:disabled="revenueSplits.length === 1">
							<b-icon icon="trash" />
						</b-button>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row v-show="revenueSplitErrors.length > 0">
				<b-col cols="12">
					<b-alert v-for="err in revenueSplitErrors" :key="err" variant="danger" show>{{ err }}</b-alert>
				</b-col>
			</b-row>
			<b-row class="mt-3">
				<b-col class="text-right">
					<b-button type="reset" variant="danger">Reset All</b-button>
				</b-col>
			</b-row>
		</b-container>
	</b-form>
</template>

<script>
import Vue from 'vue'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import {
	requiredIf,
	decimal,
	minValue,
	maxValue,
	helpers
} from 'vuelidate/lib/validators'
import { validateState, hasValidAddress } from '@/utils'
import { cloneDeep } from 'lodash-es'

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			revenueSplits: [
				{
					wallet: this.$wallet.account,
					share: 100,
				},
			],
			reset: {
				hasDelayedReveal: false,
				hasWhitelist: false,
				hasRevenueSplits: false,
				whitelistPrice: null,
				maxTokensPerPersonOnWhitelist: null,
				revenueSplits: [
					{
						wallet: this.$wallet.account,
						share: 100,
					},
				],
			},
		}
	},
	validations: {
		smartContractBuilder: {
			whitelistPrice: {
				required: requiredIf(function () {
					return this.smartContractBuilder.hasWhitelist
				}),
				decimal,
				minValue: minValue(0),
			},
			maxTokensPerPersonOnWhitelist: {
				required: requiredIf(function () {
					return this.smartContractBuilder.hasWhitelist
				}),
				minValue: minValue(1),
			},
		},
		revenueSplits: {
			$each: {
				wallet: {
					required: requiredIf(function () {
						return this.smartContractBuilder.hasRevenueSplits
					}),
					hasValidAddress: (value) => !helpers.req(value) || hasValidAddress(value)
				},
				share: {
					minValue: minValue(0),
					maxValue: maxValue(100)
				}
			}
		},
		revenueSplitErrors: {
			maxValue: maxValue(0), // this won't let to go Next if there is at least 1 error
		},
	},
	created() {
		const splits = this.smartContractBuilder.revenueSplits
		if (splits?.length) {
			// hard copy from state to avoid vuex errors of mutating state outside of store
			this.revenueSplits = cloneDeep(splits)
		}
	},
	beforeDestroy() {
		// we perform split revenue updates locally and only update store before leaving
		if (this.smartContractBuilder.hasRevenueSplits) {
			this.updateBuilderRevenueSplits(this.revenueSplits)
		}
	},
	computed: {
		splitShareTotal() {
			return this.revenueSplits
				.map((x) => x.share)
				.reduce((acc, val) => acc + val, 0)
		},
		revenueSplitErrors() {
			if (!this.smartContractBuilder.hasRevenueSplits) return []

			const errors = []
			const sumsTo100 = this.splitShareTotal === 100

			if (!sumsTo100) errors.push('Shares must add up to 100%')

			return errors
		},
	},
	methods: {
		validateState,
		onAddSplit() {
			this.revenueSplits.push({
				wallet: null,
				share: 100 - this.splitShareTotal,
			})
		},
		onRemoveSplit(idx) {
			this.revenueSplits.splice(idx, 1)
		},
		onSplitWalletUpdate(wallet, idx) {
			Vue.set(this.revenueSplits, idx, {
				wallet: wallet,
				share: this.revenueSplits[idx].share,
			})
		},
		onSplitShareUpdate(share, idx) {
			Vue.set(this.revenueSplits, idx, {
				wallet: this.revenueSplits[idx].wallet,
				share: share,
			})
		},
	},
}
</script>
