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
						@change="onCreatedAlreadyChange"
					>
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
							:class="{
								'is-invalid': $v.smartContractBuilder.marketplace.$error,
							}"
							></b-form-select>
							<b-form-invalid-feedback :state="validation.marketplace">
								Please correct "Marketplace"
							</b-form-invalid-feedback>
					</b-form-group>
				</b-col>
			</b-row>
			<template v-if="smartContractBuilder.marketplace === MARKETPLACE.OpenSea">
				<b-row class="mb-3">
					<b-col>
						<h4 class="text-center text-info">All this information can be later updated on OpenSea</h4>
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
							placeholder="Doodles"
							:value="smartContractBuilder.marketplaceCollection.name"
							@change="onNameChange"
							@blur="$v.smartContractBuilder.marketplaceCollection.name.$touch()"
							:class="{
								'is-invalid': $v.smartContractBuilder.marketplaceCollection.name.$error || nameIsTaken,
							}"
							required></b-form-input>
							<b-form-invalid-feedback :state="validation.marketplaceCollection.name">
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
							:value="smartContractBuilder.marketplaceCollection.externalUrl"
							@change="
								(val) =>
									updateSmartContractBuilder({
										marketplaceCollection: { externalUrl: val },
									})
							"
							type="text"
							></b-form-input>
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
							:value="smartContractBuilder.marketplaceCollection.royalties"
							@change="
								(val) =>
									updateSmartContractBuilder({ marketplaceCollection: { royalties: val ? +val:null } })
							"
							:class="{
								'is-invalid': $v.smartContractBuilder.marketplaceCollection.royalties.$error,
							}"
							@blur="$v.smartContractBuilder.marketplaceCollection.royalties.$touch()"
							type="number"
							step="0.1"
							min="0"
							max="10"></b-form-input>
						<b-form-invalid-feedback :state="validation.marketplaceCollection.royalties">
							Please correct "Royalties"
						</b-form-invalid-feedback>
					</b-form-group>
					</b-col>
					<b-col sm="12" md="6">
						<b-form-group
						label="Royalties recipient"
						description="Wallet address to send royalty payments to">
						<b-form-input
							id="collectionFeeRecipient"
							name="collectionFeeRecipient"
							placeholder="0x3fad..."
							:value="smartContractBuilder.marketplaceCollection.feeRecipient"
							:class="{
								'is-invalid': $v.smartContractBuilder.marketplaceCollection.feeRecipient.$error,
							}"
							@blur="$v.smartContractBuilder.marketplaceCollection.feeRecipient.$touch()"
							@change="
								(val) =>
									updateSmartContractBuilder({
										marketplaceCollection: { feeRecipient: val },
									})
							"
							type="text"></b-form-input>
						<b-form-invalid-feedback :state="validation.marketplaceCollection.feeRecipient">
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
									(val) =>
										updateSmartContractBuilder({
											marketplaceCollection: { description: val },
										})"
								></b-form-textarea>
						</b-form-group>
					</b-col>
				</b-row>
			</template>
		</b-container>
	</b-form>
</template>

<script>
import { ethers } from 'ethers'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { MARKETPLACE, BLOCKCHAIN } from '@/constants'
import { required, requiredIf, minValue, decimal, maxValue } from 'vuelidate/lib/validators'

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			MARKETPLACE,
			maxValue,
			createdAlready: false,
			nameIsTaken: false,
			openSeaBlockchains: [BLOCKCHAIN.Ethereum, BLOCKCHAIN.Polygon],
			marketplaces: []
		}
	},
	mounted() {
		if(this.$wallet.account && !this.smartContractBuilder.marketplaceCollection?.feeRecipient) {
			this.updateSmartContractBuilder({ 
				marketplaceCollection: { 
					...this.smartContractBuilder.marketplaceCollection || {},
					feeRecipient: this.$wallet.account
				}
			})
		}
		this.marketplaces = [
			{
				text: 'Other',
				value: MARKETPLACE.Other,
			}
		]

		if(this.openSeaBlockchains.includes(this.smartContractBuilder.blockchain)) {
			this.marketplaces.unshift({
				text: 'OpenSea',
				value: MARKETPLACE.OpenSea
			})
			// set OpenSea as default
			if (this.smartContractBuilder.marketplace === null || this.smartContractBuilder.marketplace === undefined) {
				this.updateSmartContractBuilder({
					marketplace: MARKETPLACE.OpenSea
				})
			}
		}
	},
	computed: {
		validation() {
			return {
				marketplace: !this.$v.smartContractBuilder.marketplace.$error,
				marketplaceCollection: {
					name: !this.$v.smartContractBuilder.marketplaceCollection.name.$error,
					feeRecipient: !this.$v.smartContractBuilder.marketplaceCollection.feeRecipient.$error,
					royalties: !this.$v.smartContractBuilder.marketplaceCollection.royalties.$error,
				},
			}
		},
		collectionNameDesc() {
			const name = this.smartContractBuilder.marketplaceCollection?.name || ''
			const formattedName = name.replace(/\s/g, '-').toLowerCase()
			return `https://testnets.opensea.io/collection/${formattedName}`
		}
	},
	validations: {
		smartContractBuilder: {
			marketplace: { required },
			marketplaceCollection: {
				name: { required: requiredIf(function() {
					return this.smartContractBuilder.marketplace === MARKETPLACE.OpenSea
				})},
				feeRecipient: { hasValidAddress: val => val ? ethers.utils.isAddress(val) : true }, 
				royalties: { decimal, minValue: minValue(0), maxValue: maxValue(10) },
			},
		},
	},
	methods: {
		onMarketplaceChange(val) {
			const payload = +val === MARKETPLACE.Other
				? { marketplace: val, marketplaceCollection: null }
				: { marketplace: val, marketplaceCollection: { marketplace: val, feeRecipient: this.$wallet.account } }

			this.updateSmartContractBuilder(payload)
		},

		onCreatedAlreadyChange(val) {
			this.createdAlready = val
			if(this.createdAlready) {
				this.updateSmartContractBuilder({
					marketplace: MARKETPLACE.Other,
					marketplaceCollection: null
				})
			}
		},

		onNameChange(name) {
			this.updateSmartContractBuilder({ marketplaceCollection: { name } })
			const formattedName = name.replace(/\s/g, '-').toLowerCase()

			fetch(`https://rinkeby-api.opensea.io/api/v1/collection/${formattedName}`)
				.then(response => {
					// console.log(response)
					this.nameIsTaken = response.status !== 404
				})
				.catch(_ => {
					this.nameIsTaken = false
				})
		}
	}
}
</script>
