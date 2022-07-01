<template>
	<b-container fluid class="px-0 px-md-5">
		<b-row>
			<b-col>
				<h1 class="text-center mb-3">Pick the Blockchain</h1>
			</b-col>
		</b-row>
		<b-row>
			<b-col sm="12" md="3" v-for="blockchain in supportedBlockchains" :key="blockchain.id">
				<b-link v-if="!blockchain.available" href="mailto:drop@zerocodenft.com?subject=Custom Order Inquiry">
					<b-img
						:class="[blockchain.class, { 'shadow': hasShadow(blockchain.id) }]"
						center
						:width="blockchain.width"
						:height="blockchain.height"
						:src="blockchain.imageSrc" />
					<h5 class="text-center text-muted position-relative" style="top: -45px">
						Inquire (custom order)
					</h5>
				</b-link>
				<b-img v-else
					:class="[blockchain.class, { 'shadow': hasShadow(blockchain.id) }]"
					center
					:width="blockchain.width"
					:height="blockchain.height"
					:src="blockchain.imageSrc"
					@click="onSelectBlockchain(blockchain.id)"
					@mouseover="hoverCard(blockchain.id)"
        			@mouseout="hoverCard(null)" />
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { BLOCKCHAIN } from '@/constants'

const blockchainToTestChainIdMap = {
	[BLOCKCHAIN.Ethereum]: 4,
	[BLOCKCHAIN.Fantom]: 4002,
	[BLOCKCHAIN.BinanceSmartChain]: 97,
	[BLOCKCHAIN.Polygon]: 80001,
	[BLOCKCHAIN.Avalanche]: 43113,
	[BLOCKCHAIN.Cronos]: 338,
	[BLOCKCHAIN.Songbird]: 16,
	[BLOCKCHAIN.Thinkium]: 60001,
	[BLOCKCHAIN.Arbitrum]: 421611,
	[BLOCKCHAIN.Optimism]: 69,
	[BLOCKCHAIN.Harmony]: 1666700000,
	[BLOCKCHAIN.Klaytn]: 1001,
	[BLOCKCHAIN.Heco]: 256,
}

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			hovered: null
		}
	},
	computed: {
		supportedBlockchains() {
			return Object.keys(BLOCKCHAIN)
				.filter(k => isNaN(k))
				.map(k => {
					return {
						id: BLOCKCHAIN[k],
						class: `pointer mw-100 ${(k === 'Arbitrum' || k === 'Thinkium') ? '' : 'p-3'}`,
						width: "400px",
						height: "150px",
						imageSrc: require(`@/assets/images/blockchain/${k.toLowerCase()}.svg`),
						available: k !== 'Solana'
					}
			})
		}
	},
	methods: {
		hasShadow(blockchain) {
			return this.hovered === blockchain || this.smartContractBuilder.blockchain === blockchain
		},
		hoverCard(blockchain) {
			this.hovered = blockchain
		},
		onSelectBlockchain(blockchain) {
			this.updateSmartContractBuilder({ 
				chainId: blockchainToTestChainIdMap[blockchain],
				blockchain
			})
			this.goNext()
		}
	},
}
</script>