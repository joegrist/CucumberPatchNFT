<template>
	<b-container fluid class="px-0 px-md-5">
		<b-row>
			<b-col>
				<h1 class="text-center mb-3">Pick the Blockchain</h1>
			</b-col>
		</b-row>
		<b-row>
			<b-col sm="12" md="4">
				<b-img
					:class="['pointer mw-100 rounded p-4', { 'shadow': hovered === BLOCKCHAIN.Ethereum || smartContractBuilder.blockchain === BLOCKCHAIN.Ethereum }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/ethereum.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Ethereum)"
					@mouseover="hoverCard(BLOCKCHAIN.Ethereum)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Avalanche || smartContractBuilder.blockchain === BLOCKCHAIN.Avalanche }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/avalanche.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Avalanche)"
					@mouseover="hoverCard(BLOCKCHAIN.Avalanche)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Polygon || smartContractBuilder.blockchain === BLOCKCHAIN.Polygon }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/polygon.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Polygon)"
					@mouseover="hoverCard(BLOCKCHAIN.Polygon)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Fantom || smartContractBuilder.blockchain === BLOCKCHAIN.Fantom }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/fantom.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Fantom)"
					@mouseover="hoverCard(BLOCKCHAIN.Fantom)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.BinanceSmartChain || smartContractBuilder.blockchain === BLOCKCHAIN.BinanceSmartChain }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/binance.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.BinanceSmartChain)"
					@mouseover="hoverCard(BLOCKCHAIN.BinanceSmartChain)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4" class="">
				<b-img
					:class="['pointer mw-100 px-4 cryptodotcom', { 'shadow': hovered === BLOCKCHAIN.Cronos || smartContractBuilder.blockchain === BLOCKCHAIN.Cronos }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/cronos.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Cronos)"
					@mouseover="hoverCard(BLOCKCHAIN.Cronos)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4">
				<b-img
					:class="['pointer mw-100 py-3', { 'shadow': hovered === BLOCKCHAIN.Songbird || smartContractBuilder.blockchain === BLOCKCHAIN.Songbird }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/songbird.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Songbird)"
					@mouseover="hoverCard(BLOCKCHAIN.Songbird)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="4">
				<b-img
					:class="['mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Solana }]"
					center
					width="400px"
					height="150px"
					src="@/assets/images/blockchain/solana.svg" />
				<h4 class="text-center text-muted position-relative" style="top: -45px">
					Coming soon!
				</h4>
			</b-col>
		</b-row>
		<b-row v-show="smartContractBuilder.blockchain">
			<b-col cols="12">
				<b-form-group
					label-class="required"
					label="Network"
					label-for="chainId"
					description="Network to deploy the smart contract to">
					<b-form-select
						id="chainId"
						name="chainId"
						:value="smartContractBuilder.chainId"
						@change="onNetworkChange"
						:class="{ 'is-invalid': $v.smartContractBuilder.chainId.$error }"
						:options="networkOptions"
						required></b-form-select>
				</b-form-group>
			</b-col>
			<!-- <b-col cols="12">
				<p>
					You are currently connected to:
					<strong class="text-capitalize">{{ $wallet.networkName || '' }}</strong>
				</p>
			</b-col> -->
		</b-row>
	</b-container>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { BLOCKCHAIN } from '@/constants'
import { required } from 'vuelidate/lib/validators'

export default {
	mixins: [smartContractBuilderMixin],
	data() {
		return {
			hovered: null,
			BLOCKCHAIN: BLOCKCHAIN,
			networks: [
				{
					chainId: '4',
					blockchain: BLOCKCHAIN.Ethereum,
					chainName: 'Rinkeby',
					symbol: 'ETH',
				},
				{
					chainId: '80001',
					blockchain: BLOCKCHAIN.Polygon,
					chainName: 'Polygon Testnet',
					symbol: 'MATIC',
				},
				{
					chainId: '43113',
					blockchain: BLOCKCHAIN.Avalanche,
					chainName: 'Avalanche Testnet C-Chain',
					symbol: 'AVAX',
				},
				{
					chainId: '4002',
					blockchain: BLOCKCHAIN.Fantom,
					chainName: 'Fantom Testnet',
					symbol: 'FTM',
				},
				{
					chainId: '97',
					blockchain: BLOCKCHAIN.BinanceSmartChain,
					chainName: 'Binance Smart Chain Testnet',
					symbol: 'BNB',
				},
				{
					chainId: '338',
					blockchain: BLOCKCHAIN.Cronos,
					chainName: 'Cronos Testnet',
					symbol: 'TCRO',
				},
				{
					chainId: '16',
					blockchain: BLOCKCHAIN.Songbird,
					chainName: 'Songbird Testnet',
					symbol: 'CFLR',
				},
			],
		}
	},
	validations: {
		smartContractBuilder: {
			chainId: { required },
		},
	},
	computed: {
		networkOptions() {
			return this.networks
				.filter((n) => n.blockchain === this.smartContractBuilder.blockchain)
				.map((n) => {
					return {
						value: n.chainId,
						text: n.chainName,
					}
				})
		},
	},
	methods: {
		onNetworkChange(chainId) {
			this.$v.smartContractBuilder.chainId.$touch()
			this.updateSmartContractBuilder({chainId})
		},
		hoverCard(blockchain) {
			this.hovered = blockchain
		},
		onSelectBlockchain(blockchain) {
			const chainId = this.networks.find((n) => n.blockchain === blockchain)?.chainId
			this.updateSmartContractBuilder({ 
				blockchain, 
				chainId 
			})
			document.getElementById("chainId").scrollIntoView({behavior: 'smooth'})
		}
	},
}
</script>