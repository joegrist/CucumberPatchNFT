<template>
	<b-container fluid class="px-0 px-md-5">
		<b-row>
			<b-col>
				<h1 class="text-center mb-3">Contract Type</h1>
			</b-col>
		</b-row>
		<b-row class="mb-5">
			<b-col
				sm="12"
				md="4"
				v-for="type in types"
				:key="type.id"
				@click="onCardSelected(type)"
				@mouseover="hoverCard(type.id)"
				@mouseout="hoverCard(null)">
				<ContractTypeCard
					v-bind="type"
					:class="[
						{
							shadow:
								type.isAvailable &&
								(hovered === type.id ||
									smartContractBuilder.contractType === type.id),
						},
					]" />
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { CONTRACT_TYPE } from '@/constants'
import { required } from 'vuelidate/lib/validators'
import ContractTypeCard from '@/components/smart-contract-wizard/ContractTypeCard.vue'
const contractTypes = [
	{
		id: CONTRACT_TYPE.ERC721,
		title: 'ERC721',
		description:
			'Typical NFT contract, suitable for most scenarios. Pick if unsure.',
		isAvailable: true,
	},
	{
		id: CONTRACT_TYPE.ERC721A,
		title: 'ERC721A (Experimental)',
		description: `
                        Known as <a href="https://www.azuki.com/erc721a" target="blank">Azuki contract</a>, 
                        suitable when you expect your users to mint NFTs in small batches thus saving them on gas fees.
                        Might increase the transfer fees (e.g sending NFTs to someone) for bigger batches.`,
		isAvailable: true,
	},
	{
		id: CONTRACT_TYPE.ERC20,
		title: 'ERC20 (Coming soon)',
		description: 'Typical fungible token contract.',
		isAvailable: false,
	},
]

export default {
	mixins: [smartContractBuilderMixin],
	components: {
		ContractTypeCard,
	},
	data() {
		return {
			hovered: null,
		}
	},
	validations: {
		smartContractBuilder: {
			contractType: { required },
		},
	},
	computed: {
		types() {
			return this.smartContractBuilder.id ||
				this.smartContractBuilder.clonedFrom // means it's a clone
				? contractTypes.filter(
						(t) => t.id === this.smartContractBuilder.contractType
				  )
				: contractTypes
		},
	},
	methods: {
		hoverCard(value) {
			this.hovered = value
		},
		onCardSelected(type) {
			if (!type.isAvailable) return
			this.updateSmartContractBuilder({
				contractType: type.id,
			})
		},
	},
}
</script>
