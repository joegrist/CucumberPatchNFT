<template>
	<b-container>
		<b-row>
			<b-col>
				<h1 class="text-center py-2">Your Contract's Information</h1>
			</b-col>
		</b-row>
		<b-row>
			<b-col cols="12" class="pb-3 pb-md-5">
				<b-card class="border-0 shadow">
					<b-row class="px-3">
						<b-col
							sm="12"
							md="4"
							class="d-flex flex-column justify-content-between">
							<div>
								<h2 class="mb-1">
									{{ smartContractBuilder.name | startCase }}
								</h2>
								<h6 class="text-muted">{{ smartContractBuilder.symbol }}</h6>
							</div>
							<b-img
								width="130px"
								:src="blockchainImage[smartContractBuilder.blockchain]"></b-img>
						</b-col>
						<b-col sm="12" md="8">
							<b-row
								v-for="item in summary"
								:key="item.key"
								class="border-bottom pt-1">
								<b-col cols="5" class="truncate-text text-muted">{{
									item.key | startCase
								}}</b-col>
								<b-col cols="7" class="truncate-text">{{
									item.val | yesNo
								}}</b-col>
							</b-row>
						</b-col>
					</b-row>
				</b-card>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { isArray } from 'lodash-es'
import { BLOCKCHAIN, MARKETPLACE } from '@/constants'

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			MARKETPLACE,
			blockchainImage: {
				[BLOCKCHAIN.Ethereum]: require('@/assets/images/blockchain/ethereum.svg'),
				[BLOCKCHAIN.Solana]: require('@/assets/images/blockchain/solana.svg'),
				[BLOCKCHAIN.Fantom]: require('@/assets/images/blockchain/fantom.svg'),
				[BLOCKCHAIN.Polygon]: require('@/assets/images/blockchain/polygon.svg'),
				[BLOCKCHAIN.Avalanche]: require('@/assets/images/blockchain/avalanche.svg'),
			},
			excludeList: [
				'id',
				'hasMintableRoylaties',
				'hasRaribleRoylaties',
				'abi',
				'bytecode',
				'address',
				'createdOn',
				'blockchain',
				'name',
				'chainId',
				'voucherSignerPublicAddress',
				'website',
				'marketplaceCollection',
			],
		}
	},
	computed: {
		summary() {
			return Object.entries(this.smartContractBuilder)
				.filter(([k, _]) => !this.excludeList.includes(k))
				.map(([key, val]) => {
					if (isArray(val)) {
						val = val.join(',')
					}
					if (key === 'marketplace') {
						val = MARKETPLACE[val]
					}
					return {
						key: key.replace('has', ''),
						val,
					}
				})
				.sort((a, b) => a.key.localeCompare(b.key))
		},
	},
	validations: {
		smartContractBuilder: {},
	},
}
</script>
