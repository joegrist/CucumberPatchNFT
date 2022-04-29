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
						description="URL to the .json file containing pre-reveal metadata"
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
				<b-col sm="12" md="6">
					<b-form-group
						:label="`Price per NFT in ${getCurrency(smartContractBuilder.chainId)}`"
						description="Can be the same as public sale price or even zero to allow free mint"
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
							></b-form-input>
						<b-form-invalid-feedback :state="validation.whitelistPrice">
							Please correct "Presale Price"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
				<b-col sm="12" md="6">
					<b-form-group
						label="Max NFTs Per Person"
						description="Maximum number of tokens someone can mint during whitelist sale, independent of public"
						:label-class="{ required: smartContractBuilder.hasWhitelist }"
						:disabled="!smartContractBuilder.hasWhitelist">
						<b-form-input
							id="maxTokensPerPersonOnWhitelist"
							name="maxTokensPerPersonOnWhitelist"
							:value="smartContractBuilder.maxTokensPerPersonOnWhitelist"
							@change="
								(val) =>
									updateSmartContractBuilder({
										maxTokensPerPersonOnWhitelist: val ? +val : null,
									})
							"
							@blur="$v.smartContractBuilder.maxTokensPerPersonOnWhitelist.$touch()"
							:class="{
								'is-invalid': $v.smartContractBuilder.maxTokensPerPersonOnWhitelist.$error,
							}"
							type="number"
							step="1"
							min="1"
							></b-form-input>
						<b-form-invalid-feedback :state="validation.maxTokensPerPersonOnWhitelist">
							Please correct "Max NFTs Per Person"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group description="If you are the 100% shareholder your wallet will be added automatically during deployment">
						<b-form-checkbox
							id="revenueSplitFeature"
							name="revenueSplitFeature"
							switch
							size="lg"
							:checked="smartContractBuilder.hasRevenueSplits"
							@change="
								(val) => updateSmartContractBuilder({ hasRevenueSplits: val })
							">
							Primary Sales Revenue Splits
							<b-button
								variant="success"
								size="sm"
								:hidden="!smartContractBuilder.hasRevenueSplits"
								@click="onAddSplit">
								<b-icon icon="plus-circle" />
							</b-button>
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row v-for="(split, idx) in revenueSplits" :key="idx">
				<b-col cols="8">
					<b-form-group
						label="Wallet Address"
						:label-class="{ required: smartContractBuilder.hasRevenueSplits }"
						:disabled="!smartContractBuilder.hasRevenueSplits">
						<b-form-input
							:name="`wallet${idx}`"
							:value="split.wallet"
							@change="(val) => onSplitWalletUpdate(val, idx)"
							type="text"></b-form-input>
						<!-- <b-form-invalid-feedback :state="revenueSplitErrors[idx]">
							Please correct "Wallet {{ idx }}"
						</b-form-invalid-feedback> -->
					</b-form-group>
				</b-col>
				<b-col cols="3">
					<b-form-group
						label="Share %"
						:label-class="{ required: smartContractBuilder.hasRevenueSplits }"
						:disabled="!smartContractBuilder.hasRevenueSplits">
						<b-form-input
							:name="`share${idx}`"
							:value="split.share"
							@change="(val) => onSplitShareUpdate(val ? +val : 0, idx)"
							type="number"
							step="any"
							min="0"></b-form-input>
					</b-form-group>
				</b-col>
				<b-col cols="1">
					<b-form-group
						label="Actions"
						label-class="text-center"
						class="text-center">
						<b-button
							variant="danger"
							@click="onRemoveSplit(idx)"
							:disabled="revenueSplits.length === 1">
							<b-icon icon="trash" />
						</b-button>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row v-if="revenueSplitErrors.length > 0">
				<b-col cols="12">
					<ul>
						<li
							v-for="msg in revenueSplitErrors"
							:key="msg"
							class="text-danger">
							{{ msg }}
						</li>
					</ul>
				</b-col>
			</b-row>
			<b-row class="mt-3">
				<b-col>
					<b-button type="reset" variant="danger">Reset</b-button>
				</b-col>
			</b-row>
		</b-container>
	</b-form>
</template>

<script>
import Vue from 'vue'
import { ethers } from 'ethers'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import {
	requiredIf,
	decimal,
	minValue,
	maxValue,
} from 'vuelidate/lib/validators'
import { getCurrency } from '@/constants/metamask'

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
				delayedRevealURL: null,
				whitelistPrice: null,
				maxTokensPerPersonOnWhitelist: 1,
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
			maxTokensPerPersonOnWhitelist: {
				required: requiredIf(function () {
					return this.smartContractBuilder.hasWhitelist
				}),
				minValue: minValue(1)
			}
		},
		revenueSplitErrors: {
			maxValue: maxValue(0),
		},
	},
	mounted() {
		const splits = this.$store.state.smartContractBuilder.revenueSplits
		if (splits?.length) {
			// hard copy from state to avoid vuex errors of mutating state outside of store
			this.revenueSplits = JSON.parse(JSON.stringify(splits))
		}
	},
	beforeDestroy() {
		// we perform split revenue updates locally and only update store before leaving
		if(this.smartContractBuilder.hasRevenueSplits) {
			this.updateBuilderRevenueSplits(this.revenueSplits)
		}
	},
	computed: {
		validation() {
			return {
				delayedRevealURL: !this.$v.smartContractBuilder.delayedRevealURL.$error,
				whitelistPrice: !this.$v.smartContractBuilder.whitelistPrice.$error,
				maxTokensPerPersonOnWhitelist: !this.$v.smartContractBuilder.maxTokensPerPersonOnWhitelist.$error,
				shares: this.revenueSplitErrors.length === 0,
			}
		},
		splitShareTotal() {
			return this.revenueSplits
				.map((x) => x.share)
				.reduce((acc, val) => acc + val, 0)
		},
		revenueSplitErrors() {
			if(!this.smartContractBuilder.hasRevenueSplits) return []

			const errors = []
			const sumsTo100 = this.splitShareTotal === 100
			const hasValidWallets = this.revenueSplits
				.map((x) => x.wallet)
				.every((w) => w !== null && w !== '' && ethers.utils.isAddress(w))
			const hasShares = this.revenueSplits
				.map((x) => x.share)
				.every((s) => s !== null && s !== 0)

			if (!sumsTo100) errors.push('Shares must add up to 100%')
			if (!hasValidWallets) errors.push('All wallets must have a valid address')
			if (!hasShares) errors.push('Shares must be greater than 0')

			return errors
		},
	},
	methods: {
		getCurrency,
		onAddSplit() {
			const otherShares = this.revenueSplits
				.map((x) => x.share)
				.reduce((acc, val) => acc + val, 0)
			this.revenueSplits.push({
				wallet: null,
				share: 100 - otherShares,
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
