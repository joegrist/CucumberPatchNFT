<template>
	<b-form>
		<b-container>
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
							:options="marketplaces"
							:value="smartContractBuilder.marketplace"
							@change="
								(val) => updateSmartContractBuilder({ marketplace: val, marketplaceCollection: { marketplace: val } })
							"
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
			<b-row v-if="smartContractBuilder.marketplace === MARKETPLACE.OpenSea">
				<b-col>
					<!-- <b-form-group>
						<b-form-checkbox
							id="openSeaRoyalties"
							name="openSeaRoyalties"
							:checked="true"
							:disabled="true">
							Open Sea royalties are enabled by default and the actual % can be
							specified on Open Sea's colllection settings page
						</b-form-checkbox>
					</b-form-group> -->
					<h4 class="text-center text-info">All this information can be later updated on OpenSea</h4>
					<b-form-group 
						label="Collection Name" 
						label-class="required" 
						description="This will be your collection's OpenSea identifier on TESTNET. For example if you name it 'doodles' your collection will be at https://testnets.opensea.io/collection/doodles">
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
					<b-form-group
						label="Project URL"
						description="Where people can get more inforamtion about your collection like a website or a twitter page">
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
							step="0.01"
							min="0"
							max="10"></b-form-input>
						<b-form-invalid-feedback :state="validation.marketplaceCollection.royalties">
							Please correct "Royalties"
						</b-form-invalid-feedback>
					</b-form-group>
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
			<!-- <b-row>
				<b-col>
					<b-form-group>
						<b-form-checkbox
							id="raribleRoyltiesFeature"
							name="raribleRoyltiesFeature"
							:checked="smartContractBuilder.raribleRoyltiesFeature"
							:disabled="true"
							@change="
								(val) => updateSmartContractBuilder({ raribleRoyltiesFeature: val })">
							Add Rarible royalties feature (coming soon) ?
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<b-form-group>
						<b-form-checkbox
							id="mintableRoylatiesFeature"
							name="mintableRoylatiesFeature"
							:checked="smartContractBuilder.mintableRoylatiesFeature"
							:disabled="true"
							@change="
								(val) => updateSmartContractBuilder({ mintableRoylatiesFeature: val })">
							Add Mintable royalties feature (coming soon) ?
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row> -->
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
			nameIsTaken: false,
			openSeaBlockchains: [BLOCKCHAIN.Ethereum, BLOCKCHAIN.Polygon],
			marketplaces: []
		}
	},
	mounted() {
		if(!this.smartContractBuilder.marketplaceCollection?.feeRecipient) {
			this.updateSmartContractBuilder({ marketplaceCollection: { feeRecipient: this.$wallet.account } })
		}
		this.marketplaces = [
			{
				text: 'Other',
				value: MARKETPLACE.Other,
			}
		]
		this.updateSmartContractBuilder({
			marketplace: MARKETPLACE.Other
		})
		if(this.openSeaBlockchains.includes(this.smartContractBuilder.blockchain)) {
			this.marketplaces.unshift({
				text: 'OpenSea',
				value: MARKETPLACE.OpenSea
			})

			// set OpenSea as default
			if (!this.smartContractBuilder.marketplace) {
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
	},
	validations: {
		smartContractBuilder: {
			marketplace: { required },
			marketplaceCollection: {
				name: { required: requiredIf(function(model) {
					return model.marketplace === MARKETPLACE.OpenSea
				})},
				feeRecipient: { hasValidAddress: val => ethers.utils.isAddress(val) }, 
				royalties: { decimal, minValue: minValue(0), maxValue: maxValue(10) },
			},
		},
	},
	methods: {
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
