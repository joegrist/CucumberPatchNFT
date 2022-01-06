<template>
	<b-container class="px-5 px-md-0">
		<b-row>
			<b-col>
				<h1 class="text-center mb-3">Pick the Blockchain</h1>
			</b-col>
		</b-row>
		<b-row>
			<b-col sm="12" md="6">
				<b-img
					:class="['pointer mw-10 rounded p-4', { 'shadow': hovered === BLOCKCHAIN.Ethereum || smartContractBuilder.blockchain === BLOCKCHAIN.Ethereum }]"
					center
					width="500px"
					height="150px"
					src="@/assets/images/blockchain/ethereum.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Ethereum)"
					@mouseover="hoverCard(BLOCKCHAIN.Ethereum)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="6">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Avalanche || smartContractBuilder.blockchain === BLOCKCHAIN.Avalanche }]"
					center
					width="500px"
					height="150px"
					src="@/assets/images/blockchain/avalanche.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Avalanche)"
					@mouseover="hoverCard(BLOCKCHAIN.Avalanche)"
        			@mouseout="hoverCard(null)" />
			</b-col>
		</b-row>
		<b-row class="mt-1">
			<b-col sm="12" md="6">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Polygon || smartContractBuilder.blockchain === BLOCKCHAIN.Polygon }]"
					center
					width="500px"
					height="150px"
					src="@/assets/images/blockchain/polygon.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Polygon)"
					@mouseover="hoverCard(BLOCKCHAIN.Polygon)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="6">
				<b-img
					:class="['pointer mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Fantom || smartContractBuilder.blockchain === BLOCKCHAIN.Fantom }]"
					center
					width="500px"
					height="150px"
					src="@/assets/images/blockchain/fantom.svg"
					@click="onSelectBlockchain(BLOCKCHAIN.Fantom)"
					@mouseover="hoverCard(BLOCKCHAIN.Fantom)"
        			@mouseout="hoverCard(null)" />
			</b-col>
			<b-col sm="12" md="6">
				<b-img
					:class="['mw-100 p-4', { 'shadow': hovered === BLOCKCHAIN.Solana }]"
					center
					width="500px"
					height="150px"
					src="@/assets/images/blockchain/solana.svg" />
				<h4 class="text-center text-muted position-relative" style="top: -30px">
					Coming soon!
				</h4>
			</b-col>
		</b-row>
		<template v-if="smartContractBuilder.blockchain">
			<b-row>
				<b-col>
					<b-form-group
						label-class="required"
						label="Network"
						label-for="chainId"
						description="Network to deploy the smart contract to">
						<b-form-select
							id="chainId"
							name="chainId"
							:value="smartContractBuilder.chainId"
							@change="(val) => updateSmartContractBuilder({ chainId: val })"
							@input="$v.smartContractBuilder.chainId.$touch()"
							:class="{ 'is-invalid': $v.smartContractBuilder.chainId.$error }"
							:options="networkOptions"
							required></b-form-select>
					</b-form-group>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<template v-if="requireNetworkSwitch">
						<p>
							<b-button variant="warning" @click="switchNetwork"
								>Switch to {{ switchToName }}</b-button
							>
							before proceeding
						</p>
					</template>
					<template v-else>
						<p class="text-capitalize">
							Your current metamask network:
							<strong>{{ $wallet.network.name || '' }}</strong
							>✅
						</p>
						<p>
							Current Balance: <strong>{{ $wallet.balance || 'Balance unavailable' }}</strong>
						</p>
					</template>
				</b-col>
			</b-row>
		</template>
	</b-container>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { BLOCKCHAIN } from '@/constants'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'
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
		requireNetworkSwitch() {
			console.log(this.$wallet.network?.chainId)
			return (
				this.smartContractBuilder.chainId &&
				this.$wallet.network?.chainId?.toString() != this.smartContractBuilder.chainId
			)
		},
		switchToName() {
			return this.networks.find(
				(n) => n.chainId === this.smartContractBuilder.chainId
			)?.chainName
		},
	},
	methods: {
		hoverCard(index) {
			this.hovered = index
		},
		async connectWallet() {
			try {
				await this.$wallet.connect();
			} catch (err) {
				console.error(err)
				this.$bvToast.toast(err?.message || 'Wallet connection failed', {
					title: 'Wallet',
					variant: 'danger',
					autoHideDelay: 3000,
				})
			}
		},
		async switchNetwork() {
			try {
				await this.$wallet.switchNetwork(CHAINID_CONFIG_MAP[this.smartContractBuilder.chainId])
			} catch (err) {
				console.error(err)
				this.$bvToast.toast(err?.message || 'Network switch failed', {
					title: 'Wallet',
					variant: 'danger',
					autoHideDelay: 3000,
				})
			}
		},
		onSelectBlockchain(blockchain) {
			this.updateSmartContractBuilder({ blockchain, chainId: null })
		},
	},
}
</script>
