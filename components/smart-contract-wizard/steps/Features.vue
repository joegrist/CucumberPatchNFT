<template>
	<b-form v-if="showForm" @reset.prevent="onFormReset(reset)">
		<b-container>
			<b-row>
				<b-col>
					<b-form-group description="Your customers will see a placeholder image on all NFTs until the reveal date.">
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
					</b-form-group>
				</b-col>
			</b-row>
			<!-- <b-row>
				<b-col>
					<b-form-group
						description="URL to the .json file containing pre-reveal metadata, can be updated later"
						:disabled="!smartContractBuilder.hasDelayedReveal">
						<template #label>
							Placeholder URL
							<ExternalLink
								href="https://youtu.be/It05AkP_Wt4"
								icon="youtube"
								text="What's this?" />
						</template>
						<b-form-input
							id="delayedRevealURL"
							name="delayedRevealURL"
							type="text"
							placeholder="ipfs://..."
							:value="smartContractBuilder.delayedRevealURL"
							@change="
								(delayedRevealURL) => updateSmartContractBuilder({ delayedRevealURL })
							"
							@blur="$v.smartContractBuilder.delayedRevealURL.$touch()"
							:state="
								validateState('smartContractBuilder.delayedRevealURL')
							"></b-form-input>
						<b-form-invalid-feedback :state="state.delayedRevealURL">
							Please correct "Placeholder URL"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row> -->
			<b-row>
				<b-col>
					<b-form-group description="Give specific group of people (could be team, early supporters, etc.) access to mint before others">
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
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col sm="12" md="6">
					<b-form-group
						description="Can be the same as public sale price or even zero to allow free mint"
						:label="`Price per NFT in ${currency}`"
						:label-class="{ required: smartContractBuilder.hasWhitelist }"
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
						:label-class="{ required: smartContractBuilder.hasWhitelist }"
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
					<b-form-group
						description="If you are the 100% shareholder your wallet will be added automatically during deployment">
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
					</b-form-group>
				</b-col>
				<b-col sm="12" md="4" class="text-left text-md-right mb-2 mb-md-0">
					<b-button
						variant="outline-success"
						:hidden="!smartContractBuilder.hasRevenueSplits"
						@click="onAddSplit">
						Add Split <b-icon icon="diagram3" />
					</b-button>
				</b-col>
			</b-row>
			<b-row v-for="(split, idx) in revenueSplits" :key="idx">
				<b-col sm="12" md="8">
					<b-form-group
						label="Wallet Address"
						:label-class="{ required: smartContractBuilder.hasRevenueSplits }"
						:disabled="!smartContractBuilder.hasRevenueSplits">
						<b-form-input
							type="text"
							:name="`wallet${idx}`"
							:value="split.wallet"
							@change="(val) => onSplitWalletUpdate(val, idx)"></b-form-input>
						<!-- <b-form-invalid-feedback :state="revenueSplitErrors[idx]">
							Please correct "Wallet {{ idx }}"
						</b-form-invalid-feedback> -->
					</b-form-group>
				</b-col>
				<b-col sm="12" md="3">
					<b-form-group
						label="Share %"
						:label-class="{ required: smartContractBuilder.hasRevenueSplits }"
						:disabled="!smartContractBuilder.hasRevenueSplits">
						<b-form-input
							:name="`share${idx}`"
							:value="split.share"
							type="number"
							step="any"
							min="0"
							@change="(val) => onSplitShareUpdate(val ? +val : 0, idx)"
							></b-form-input>
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
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import {
	requiredIf,
	decimal,
	minValue,
	maxValue,
} from 'vuelidate/lib/validators'
import { getMainnetConfig } from '@/constants/metamask'
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
			// delayedRevealURL: { mustBeURL },
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
		revenueSplitErrors: {
			maxValue: maxValue(0),
		},
	},
	mounted() {
		const splits = this.$store.state.smartContractBuilder.revenueSplits
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
		currency() {
			const chainId = this.smartContractBuilder.chainId
			return this.getMainnetConfig(chainId)?.nativeCurrency.symbol || ''
		},
		splitShareTotal() {
			return this.revenueSplits
				.map((x) => x.share)
				.reduce((acc, val) => acc + val, 0)
		},
		revenueSplitErrors() {
			if (!this.smartContractBuilder.hasRevenueSplits) return []

			const errors = []
			const sumsTo100 = this.splitShareTotal === 100
			const hasValidWallets = this.revenueSplits
				.map((x) => x.wallet)
				.every(hasValidAddress)
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
		getMainnetConfig,
		validateState,
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
