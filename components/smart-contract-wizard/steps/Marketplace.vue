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
							:value="smartContractBuilder.marketplace"
							@change="
								(val) => updateSmartContractBuilder({ marketplace: val, marketplaceCollection: { marketplace: val } })
							"
							@input="$v.smartContractBuilder.marketplace.$touch()"
							:class="{
								'is-invalid': $v.smartContractBuilder.marketplace.$error,
							}"
							:options="marketplaces"
							required></b-form-select>
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
						description="This will be your collection's OpenSea identifier. For example if you name it 'doodles' your collection will be at https://opensea.io/collection/doodles">
						<b-form-input
							id="collectionName"
							name="collectionName"
							:value="smartContractBuilder.marketplaceCollection.name"
							@change="onNameChange"
							@input="$v.smartContractBuilder.marketplaceCollection.name.$touch()"
							:class="{
								'is-invalid': $v.smartContractBuilder.marketplaceCollection.name.$error || nameIsTaken,
							}"
							type="text"
							placeholder="Doodles"
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
							:value="smartContractBuilder.marketplaceCollection.description"
							@change="
								(val) =>
									updateSmartContractBuilder({
										marketplaceCollection: { description: val },
									})
							"
							type="text"
							placeholder="Doodles are characters that came from..."
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
							@input="$v.smartContractBuilder.marketplaceCollection.royalties.$touch()"
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
							@change="
								(val) =>
									updateSmartContractBuilder({
										marketplaceCollection: { feeRecipient: val },
									})
							"
							type="text"></b-form-input>
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
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { MARKETPLACE } from '@/constants'
import { required, minValue, decimal, maxValue } from 'vuelidate/lib/validators'

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			MARKETPLACE,
			marketplaces: [
				{
					text: 'OpenSea',
					value: 1,
				},
				{
					text: 'Other',
					value: 0,
				},
			],
			maxValue,
			nameIsTaken: false,
		}
	},
	mounted() {
		if(!this.$store.state.smartContractBuilder?.marketplaceCollection?.feeRecipient) {
			this.updateSmartContractBuilder({ marketplaceCollection: { feeRecipient: this.$wallet.account } })
		}
		else {
			this.updateSmartContractBuilder({ marketplaceCollection: { feeRecipient: this.$wallet.account } })
		}
	},
	computed: {
		validation() {
			return {
				marketplaceCollection: {
					name: !this.$v.smartContractBuilder.marketplaceCollection.name.$error,
					royalties: !this.$v.smartContractBuilder.marketplaceCollection.royalties.$error,
				},
			}
		},
	},
	validations: {
		smartContractBuilder: {
			marketplace: { required },
			marketplaceCollection: {
				name: { required },
				royalties: { decimal, minValue: minValue(0), maxValue: maxValue(10) },
			},
		},
	},
	methods: {
		onNameChange(name) {
			this.updateSmartContractBuilder({ marketplaceCollection: { name } })
			const formattedName = name.replace(/\s/g, '').toLowerCase()

			fetch(`https://api.opensea.io/api/v1/collection/${formattedName}`)
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
