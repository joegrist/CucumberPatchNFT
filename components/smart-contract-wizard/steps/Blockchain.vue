<template>
	<b-container fluid class="px-0 px-md-5">
		<b-row>
			<b-col>
				<h1 class="text-center mb-3">Pick the Blockchain</h1>
			</b-col>
		</b-row>
		<b-row>
			<b-col sm="12" md="4" v-for="blockchain in supportedBlockchains" :key="blockchain.id">
				<b-link v-if="!blockchain.available" href="mailto:drop@zerocodenft.com?subject=Unsupported Chain Inquiry">
					<b-img
						:class="[blockchain.class, { 'shadow': hasShadow(blockchain.id) }]"
						center
						:width="blockchain.width"
						:height="blockchain.height"
						:src="blockchain.imageSrc" />
					<h4 class="text-center text-muted position-relative" style="top: -45px">
						Inquire!
					</h4>
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
		<!-- <b-row v-show="smartContractBuilder.blockchain">
			<b-col cols="12">
				<b-form-group
					label="Network"
					label-for="chainId"
					description="Network to deploy the smart contract to. Only test network is available. This is intentional">
					<b-form-select
						id="chainId"
						name="chainId"
						:disabled="true"
						:value="smartContractBuilder.chainId"
						@change="onNetworkChange"
						:class="{ 'is-invalid': $v.smartContractBuilder.chainId.$error }"
						:options="networkOptions"
						required></b-form-select>
				</b-form-group>
			</b-col>
			<b-col cols="12">
				<p>
					You are currently connected to:
					<strong class="text-capitalize">{{ $wallet.networkName || '' }}</strong>
				</p>
			</b-col>
		</b-row> -->
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
	// [BLOCKCHAIN.Optimism]: 69
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
		// onNetworkChange(chainId) {
		// 	this.$v.smartContractBuilder.chainId.$touch()
		// 	this.updateSmartContractBuilder({chainId})
		// },
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