<template>
	<b-card-group v-if="items.length > 0" class="p-4" deck>
		<b-card v-for="sc in items" :key="sc.id">
			<template #header>
				<h6 class="mb-0">{{ sc.name | startCase }}</h6>
			</template>
			<b-card-text>
				<ul class="px-3">
					<li>Symbol: {{ sc.symbol }}</li>
					<li>Price: {{ sc.mintPrice }} {{ getCurrency(sc.chainId) }}</li>
					<li>Whitelist: {{ sc.hasWhitelist | yesNo }}</li>
					<li>Delayed Reveal: {{ sc.hasDelayedReveal | yesNo }}</li>
					<li>Blockchain: {{ sc.blockchain | blockchainName }}</li>
					<li class="text-info">Network: {{ getNetwork(sc.chainId) }}</li>
                    <li class="text-info">Status: {{sc.isDeployed ? 'Live': 'Draft'}}</li>
					<li>Created On {{ sc.createdOn }} </li>
				</ul>
			</b-card-text>
			<template #footer>
				<b-button
					v-if="sc.isDeployed"
					variant="primary"
					size="sm"
					target="_blank"
					:href="`${getExplorerUrl(sc.chainId)}/address/${sc.address}`"
					>View</b-button
				>
				<b-button
					v-if="sc.isDeployed"
					variant="primary"
					size="sm"
					:to="`/smart-contracts/${sc.id}`"
					>Interact</b-button
				>
				<b-button v-else variant="primary" size="sm" @click="onEdit(sc)"
					>Edit/Deploy</b-button
				>
				<b-overlay
					:show='isBusy'
					rounded
					opacity='0.6'
					spinner-small
					spinner-variant='primary'
					class='d-inline-block'
				>
				<b-button v-if="sc.isDeployed && isTestnet(sc.chainId)" size="sm" variant="primary" @click="onDeploy(sc)">Deploy to mainnet</b-button>
            </b-overlay>
			</template>
		</b-card>
	</b-card-group>
	<div v-else class="d-flex justify-content-center align-items-center h-100">
		<div class="d-flex flex-column">
			<h3>You don't have any smart contracts yet</h3>
			<b-button variant="primary" size="lg" to="/"
				>Create</b-button
			>
		</div>
	</div>
</template>

<script>
import { mapMutations } from 'vuex'
import { CHAINID_CONFIG_MAP, getExplorerUrl, getCurrency, getNetwork, isTestnet } from '@/constants/metamask'

export default {
	data: () => ({
		items: [],
		deployedAddress: null,
		isBusy: false
	}),
	fetchOnServer: false,
	fetchKey: 'smart-contracts-tab',
	async fetch() {
		if (!this.$wallet.account) return
		const { data } = await this.$axios.get('/smartcontracts', {
			params: { ownerAddress: this.$wallet.account },
		})
		this.items = data
		console.log('smart-contracts-tab', this.items)
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder']),
		getExplorerUrl,
		getCurrency,
		getNetwork,
		isTestnet,
		onEdit(sc) {
			this.updateSmartContractBuilder({ ...sc })
			this.$router.push('/')
		},
		async onDeploy(sc) {
			try {
				const { id, chainId } = sc
				console.log(sc, chainId, this.$wallet.network.chainId)

				if(this.$wallet.network.chainId != chainId) { 
					await this.switchNetwork(chainId)
				}

				this.isBusy = true

				const { data } = await this.$axios.get(`/smartcontracts/${id}/compiled`, {
					params: { ownerAddress: this.$wallet.account },
				})
				const { abi, bytecode } = data


				const signer = new ethers.providers.Web3Provider(window.ethereum)?.getSigner()
				
				const contractFactory = new ethers.ContractFactory(abi, bytecode, signer)
				const contract = await contractFactory.deploy()
				this.deployedAddress = contract.address

				// await this.$axios.post('/smartcontracts', {
				// 	...sc,

				// })
			} catch (e) {
				this.isBusy = false
				console.error({e})
			}
		},
		async switchNetwork(chainId) {
			const config = CHAINID_CONFIG_MAP[chainId]
			console.log({ config })
			let switchError

			try {
				await this.$wallet.provider.send('wallet_switchEthereumChain', [
					{ chainId: config.chainId },
				])
			} catch (err) {
				// This error code indicates that the chain has not been added to MetaMask.
				if (err.code === 4902) {
					try {
						await this.$wallet.provider.send('wallet_addEthereumChain', [config])
					} catch (addError) {
						switchError = err
					}
				} else {
					// handle other "switch" errors
					switchError = err
				}
			} finally {
				if(switchError) {
					this.$bvToast.toast(switchError.message || 'Network switch failed', {
						title: 'Network',
						variant: 'danger',
						autoHideDelay: 3000,
					})
				}
			}
		},
	},
}
</script>
