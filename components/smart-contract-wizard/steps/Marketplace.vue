<template>
	<b-form>
		<b-container>
			<b-row class="mb-3">
				<b-col>
					<b-form-checkbox
						id="createdAlready"
						name="createdAlready"
						size="lg"
						:checked="createdAlready"
						@change="onCreatedAlreadyChange">
						I've created the marketplace collection already
					</b-form-checkbox>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group
						label-class="required"
						label="Marketplace"
						label-for="marketplace"
						description="OpenSea or other">
						<b-form-select
							id="marketplace"
							name="marketplace"
							:disabled="createdAlready"
							:options="marketplaces"
							:value="smartContractBuilder.marketplace"
							@change="onMarketplaceChange"
							@blur.native="$v.smartContractBuilder.marketplace.$touch()"
							:state="
								validateState('smartContractBuilder.marketplace')
							"></b-form-select>
						<b-form-invalid-feedback :state="state.marketplace">
							Please correct "Marketplace"
						</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row>
			<template v-if="smartContractBuilder.marketplace === MARKETPLACE.OpenSea">
				<b-row class="mb-3">
					<b-col>
						<h4 class="text-center text-info">
							All this information can be later updated on OpenSea
						</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col sm="12" md="6">
						<b-form-group
							label="Collection Name"
							label-class="required"
							:description="collectionNameDesc">
							<b-form-input
								id="collectionName"
								name="collectionName"
								type="text"
								placeholder="e.g. Doodles"
								:value="smartContractBuilder.marketplaceCollection.name"
								@change="onNameChange"
								@blur="
									$v.smartContractBuilder.marketplaceCollection.name.$touch()
								"
								:state="
									validateState(
										'smartContractBuilder.marketplaceCollection.name'
									)
								"></b-form-input>
							<b-form-invalid-feedback
								:state="state.marketplaceCollection.name">
								Please correct "Collection Name"
							</b-form-invalid-feedback>
							<b-form-invalid-feedback :state="!nameIsTaken">
								This name is already taken
							</b-form-invalid-feedback>
						</b-form-group>
					</b-col>
					<b-col sm="12" md="6">
						<b-form-group
							label="Project URL"
							description="Your website, twitter, etc.">
							<b-form-input
								id="collectionExternaLink"
								name="collectionExternaLink"
								type="text"
								:value="smartContractBuilder.marketplaceCollection.externalUrl"
								@blur="
									$v.smartContractBuilder.marketplaceCollection.externalUrl.$touch()
								"
								@change="
									(externalUrl) =>
										updateSmartContractBuilder({
											marketplaceCollection: { externalUrl },
										})
								"
								:state="
									validateState(
										'smartContractBuilder.marketplaceCollection.externalUrl'
									)
								"></b-form-input>
							<b-form-invalid-feedback
								:state="state.marketplaceCollection.externalUrl">
								Please correct "Project URL"
							</b-form-invalid-feedback>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col sm="12" md="6">
						<b-form-group
							label="Royalties (1-10%)"
							description="How much you will get from each secondary sale. Max 10%.">
							<b-form-input
								id="collectionRoyalties"
								name="collectionRoyalties"
								type="number"
								step="0.1"
								min="0"
								max="10"
								:value="smartContractBuilder.marketplaceCollection.royalties"
								@change="
									(val) =>
										updateSmartContractBuilder({
											marketplaceCollection: { royalties: val ? +val : null },
										})
								"
								@blur="
									$v.smartContractBuilder.marketplaceCollection.royalties.$touch()
								"
								:state="
									validateState(
										'smartContractBuilder.marketplaceCollection.royalties'
									)
								"></b-form-input>
							<b-form-invalid-feedback
								:state="state.marketplaceCollection.royalties">
								Please correct "Royalties"
							</b-form-invalid-feedback>
						</b-form-group>
					</b-col>
					<b-col sm="12" md="6">
						<b-form-group
							label="Royalties recipient"
							:label-class="{ required: hasRoyalty }"
							description="Wallet address to send royalty payments to">
							<b-form-input
								id="collectionFeeRecipient"
								name="collectionFeeRecipient"
								type="text"
								placeholder="0x3fad..."
								:value="smartContractBuilder.marketplaceCollection.feeRecipient"
								:state="
									validateState(
										'smartContractBuilder.marketplaceCollection.feeRecipient'
									)
								"
								@blur="
									$v.smartContractBuilder.marketplaceCollection.feeRecipient.$touch()
								"
								@change="
									(feeRecipient) =>
										updateSmartContractBuilder({
											marketplaceCollection: { feeRecipient },
										})
								"></b-form-input>
							<b-form-invalid-feedback
								:state="state.marketplaceCollection.feeRecipient">
								Please correct "Fee Recipient"
							</b-form-invalid-feedback>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group label="Description">
							<b-form-textarea
								id="collectionDescription"
								name="collectionDescription"
								type="text"
								placeholder="Doodles are characters that came from..."
								:value="smartContractBuilder.marketplaceCollection.description"
								@change="
									(description) =>
										updateSmartContractBuilder({
											marketplaceCollection: { description },
										})
								"></b-form-textarea>
						</b-form-group>
					</b-col>
				</b-row>
			</template>
		</b-container>
	</b-form>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { MARKETPLACE, BLOCKCHAIN } from '@/constants'
import {
	required,
	requiredIf,
	minValue,
	decimal,
	maxValue,
} from 'vuelidate/lib/validators'
import { validateState, hasValidAddress } from '@/utils'

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			MARKETPLACE,
			maxValue,
			createdAlready: false,
			nameIsTaken: false,
			openSeaBlockchains: [BLOCKCHAIN.Ethereum, BLOCKCHAIN.Polygon],
			marketplaces: [],
		}
	},
	mounted() {
		if (
			this.$wallet.account &&
			!this.smartContractBuilder.marketplaceCollection?.feeRecipient
		) {
			this.updateSmartContractBuilder({
				marketplaceCollection: {
					...(this.smartContractBuilder.marketplaceCollection || {}),
					feeRecipient: this.$wallet.account,
				},
			})
		}
		this.marketplaces = [
			{
				text: 'Other',
				value: MARKETPLACE.Other,
			},
		]

		if (
			this.openSeaBlockchains.includes(this.smartContractBuilder.blockchain)
		) {
			this.marketplaces.unshift({
				text: 'OpenSea',
				value: MARKETPLACE.OpenSea,
			})
			// set OpenSea as default
			if (
				this.smartContractBuilder.marketplace === null ||
				this.smartContractBuilder.marketplace === undefined
			) {
				this.updateSmartContractBuilder({
					marketplace: MARKETPLACE.OpenSea,
				})
			}
		}
	},
	computed: {
		state() {
			const { name, feeRecipient, royalties } =
				this.$v.smartContractBuilder.marketplaceCollection

			return {
				marketplaceCollection: {
					name: !name.$anyError,
					feeRecipient: !feeRecipient.$anyError,
					royalties: !royalties.$anyError,
				},
			}
		},
		hasRoyalty() {
			return this.smartContractBuilder.marketplaceCollection.royalties > 0
		},
		isOpenSea() {
			return this.smartContractBuilder.marketplace === MARKETPLACE.OpenSea
		},
		collectionNameDesc() {
			const name = this.smartContractBuilder.marketplaceCollection?.name || ''
			const formattedName = name.replace(/\s/g, '-').toLowerCase()
			return `https://testnets.opensea.io/collection/${formattedName}`
		},
	},
	validations: {
		smartContractBuilder: {
			marketplace: { required },
			marketplaceCollection: {
				name: {
					required: requiredIf(function () {
						return this.isOpenSea
					}),
				},
				externalUrl: {},
				feeRecipient: {
					hasValidAddress: (val) => !val || hasValidAddress(val),
					required: requiredIf(function () {
						return this.isOpenSea && this.hasRoyalty
					}),
				},
				royalties: { decimal, minValue: minValue(0), maxValue: maxValue(10) },
			},
		},
	},
	methods: {
		validateState,
		onMarketplaceChange(val) {
			const payload =
				+val === MARKETPLACE.Other
					? { marketplace: val, marketplaceCollection: null }
					: {
							marketplace: val,
							marketplaceCollection: {
								marketplace: val,
								feeRecipient: this.$wallet.account,
							},
					  }

			this.updateSmartContractBuilder(payload)
		},

		onCreatedAlreadyChange(val) {
			this.createdAlready = val
			if (this.createdAlready) {
				this.updateSmartContractBuilder({
					marketplace: MARKETPLACE.Other,
					marketplaceCollection: null,
				})
			}
		},

		onNameChange(name) {
			this.updateSmartContractBuilder({ marketplaceCollection: { name } })

			if (name?.length > 0) {
				const formattedName = name.replace(/\s/g, '-').toLowerCase()

				fetch(
					`https://rinkeby-api.opensea.io/api/v1/collection/${formattedName}`
				)
					.then((response) => {
						// console.log(response)
						this.nameIsTaken = response.status !== 404
					})
					.catch((_) => {
						this.nameIsTaken = false
					})
			} else {
				this.nameIsTaken = false
			}
		},
	},
}
</script>
