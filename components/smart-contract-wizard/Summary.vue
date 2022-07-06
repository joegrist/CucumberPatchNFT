<template>
	<b-card class="border-0 shadow">
		<template #header>
			<h2 class="text-center py-1">Verify Your Contract's Information</h2>
      	</template>
		<b-row class="px-0 px-md-3">
			<b-col sm="12" md="3" class="d-flex flex-column justify-content-between">
				<div>
					<h3 class="mb-1">
						{{ smartContract.name | startCase }}
					</h3>
					<h6 class="text-muted">{{ smartContract.symbol }}</h6>
				</div>
				<b-img
					width="130px"
					:src="blockchainIcon[smartContract.blockchain]"></b-img>
			</b-col>
			<b-col sm="12" md="9">
				<b-row
					v-for="item in summary"
					:key="item.key"
					class="border-bottom pt-1">
					<b-col cols="6" class="truncate-text text-muted">{{
						item.key | startCase
					}}</b-col>
					<b-col cols="6" class="truncate-text">{{ item.val | yesNo }}</b-col>
				</b-row>
			</b-col>
		</b-row>
	</b-card>
</template>

<script>
import { MARKETPLACE, CONTRACT_TYPE } from '@/constants'
import { getCurrency } from '@/constants/metamask'
import { isArray } from 'lodash-es'
import BlockchainImage from '@/mixins/blockchainImage'

const excludeList = [
	'id',
	'isDeployed',
	'collectionMetadataURL',
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
	'whitelist',
	'email',
	'revenueSplits',
	'hasRaribleRoyalties',
	'hasMintableRoyalties',
	'isClearedForMainnet',
	'ownerAddress',
	'clonedFrom',
	'status',
	'isVerified',
	'isImported',
	'features'
]

export default {
	mixins: [BlockchainImage],
	props: {
		smartContract: Object
	},
	computed: {
		summary() {
			const marketplace = Object.entries(this.smartContract.marketplaceCollection || {})
				.reduce((acc, val) => {
					const [k,v] = val
					if(k === 'marketplace') return acc

					const key = `Marketplace ${k}`
					let value = v

					if(k === 'royalties') value += '%'
					
					acc[key] = value
					return acc
				}, {})
			
			return Object.entries({...this.smartContract, ...marketplace})
				.filter(([k, _]) => !excludeList.includes(k))
				.map(([key, val]) => {
					if (isArray(val)) {
						val = val.join(',')
					}
					if (key === 'marketplace') {
						val = MARKETPLACE[val]
					}
					if (key === 'contractType') {
						val = CONTRACT_TYPE[val]
					}
					if (key.includes('Price')) {
						val = `${val} ${getCurrency(this.smartContract.chainId)}`
					}
					return {
						key: key.replace('has', ''),
						val,
					}
				})
				.sort((a, b) => a.key.localeCompare(b.key))
		},
	},
}
</script>
