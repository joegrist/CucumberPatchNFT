<template>
	<b-card class="shadow-sm py-3" no-body>
		<b-avatar
			class="p-2 border card-logo"
			:src="blockchainImage[$props.sc.blockchain]"
			size="lg"></b-avatar>
		<b-dropdown
			size="lg"
			variant="link"
			class="card-menu"
			toggle-class="text-decoration-none p-0"
			no-caret
			right>
			<template #button-content>
				<b-icon icon="three-dots-vertical" class="text-muted" /><span
					class="sr-only"
					>Card Menu</span
				>
			</template>
			<template v-if="$props.sc.isDeployed">
				<b-dd-text v-if="$props.sc.address" class="text-center">
					<span class="text-muted">Block Expolorer</span><br />
					<b-link target="_blank" :href="viewContractUrl"
						>{{ addressCompact }} ></b-link
					>
				</b-dd-text>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dd-item
					v-if="$props.sc.website"
					:to="`/websites/${$props.sc.website.id}`"
					><b-icon icon="pencil-square" /> Website</b-dd-item
				>
				<b-dd-item v-if="!$props.sc.website && $config.FF_CREATE_SITE" @click="() => $emit('create-site', $props.sc.id)"
					><b-icon icon="cloud-upload" /> Website</b-dd-item
				>
			</template>
			<b-dd-item variant="danger" @click="onRemoveCard"
				><b-icon icon="trash" /> Remove Card
			</b-dd-item>
		</b-dropdown>
		<b-card-title class="text-center">
			<b-link
				v-if="$props.sc.isDeployed"
				class="text-dark"
				:to="`/smart-contracts/${$props.sc.id}`"
				>{{ $props.sc.name | startCase }}</b-link
			>
			<span v-else>{{ $props.sc.name | startCase }}</span>
		</b-card-title>
		
		<b-card-sub-title class="text-center mb-2">{{
			isTestnet($props.sc.chainId) ? 'Testnet' : 'Mainnet'
		}}</b-card-sub-title>

		<b-container fluid>
			<b-row class="stats">
				<b-col cols="6" class="text-center">
					<span
						:class="[
							'font-weight-bold',
							{
								'text-success': $props.sc.isDeployed,
								'text-info': !$props.sc.isDeployed,
							},
						]"
						>{{ $props.sc.isDeployed ? 'Live' : 'Draft' }}</span
					>
					<br />
					<span class="text-muted">Status</span>
				</b-col>
				<b-col cols="6" class="text-center">
					<span class="font-weight-bold">{{ revealed | yesNo }}</span>
					<br />
					<span class="text-muted">Revealed</span>
				</b-col>
				<b-col cols="6" class="text-center">
					<span class="font-weight-bold"
						>{{ minted }} / {{ $props.sc.collectionSize }}</span
					>
					<span v-if="minted === $props.sc.collectionSize">🎉</span>
					<br />
					<span class="text-muted">Minted</span>
				</b-col>
				<b-col cols="6" class="text-center">
					<span class="font-weight-bold">{{
						formattedBalance
					}}</span>
					<br />
					<span class="text-muted">Balance</span>
				</b-col>
			</b-row>
			<b-row>
				<b-col>
					<hr class="hr mb-0" />
				</b-col>
			</b-row>
			<b-row class="stats mt-3">
				<b-col cols="6" class="text-center" style="padding-bottom: 0">
					<span class="font-weight-bold">{{ openSeaStats.num_owners }}</span>
					<br />
					<span class="text-muted">Owners</span>
				</b-col>
				<b-col cols="6" class="text-center" style="padding-bottom: 0">
					<span class="font-weight-bold">{{
						openSeaStats.total_volume === 'n/a'
							? 'n/a'
							: `${openSeaStats.total_volume} ${getCurrency($props.sc.chainId)}`
					}}</span>
					<br />
					<span class="text-muted">Volume</span>
				</b-col>
				<b-col cols="12" class="text-center" style="padding: 0">
					<template v-if="openSeaUrl">
						<b-link :href="openSeaUrl || '#'" target="_blank">
							<b-img width="90px" src="@/assets/images/open-sea-logo-dark.svg" />
						</b-link>
					</template>
					<template v-else>
						<b-img width="90px" src="@/assets/images/open-sea-logo-dark.svg" />
					</template>
				</b-col>
				<b-col cols="6" class="text-center">
					<span class="font-weight-bold">{{ openSeaStats.floor_price }}</span>
					<br />
					<span class="text-muted">Floor Price</span>
				</b-col>
				<b-col cols="6" class="text-center">
					<span class="font-weight-bold">{{ openSeaStats.total_sales }}</span>
					<br />
					<span class="text-muted">Sales</span>
				</b-col>
			</b-row>
			<b-row class="pb-0">
				<b-col cols="6">
					<b-button
						v-if="$props.sc.isDeployed"
						variant="link"
						size="sm"
						:to="`/smart-contracts/${sc.id}`"
						>Manage contract ></b-button
					>
					<b-button v-else variant="link" size="sm" @click="onEdit"
						>Edit/Deploy ></b-button
					>
				</b-col>
				<b-col cols="6" class="text-muted d-flex justify-content-end my-auto">
					{{ $props.sc.createdOn | toDate }}
				</b-col>
			</b-row>
		</b-container>
	</b-card>
</template>

<script>
import { ethers } from 'ethers'
import { BLOCKCHAIN, MARKETPLACE } from '@/constants'
import { getExplorerUrl, getCurrency, isTestnet } from '@/constants/metamask'
import { mapActions, mapMutations } from 'vuex'
const blockchainImage = {
	[BLOCKCHAIN.Ethereum]: require('@/assets/images/ethereum.svg'),
	[BLOCKCHAIN.Solana]: require('@/assets/images/solana.svg'),
	[BLOCKCHAIN.Fantom]: require('@/assets/images/fantom.svg'),
	[BLOCKCHAIN.Polygon]: require('@/assets/images/polygon.svg'),
	[BLOCKCHAIN.Avalanche]: require('@/assets/images/avalanche.svg'),
	[BLOCKCHAIN.BinanceSmartChain]: require('@/assets/images/binance.svg'),
	[BLOCKCHAIN.Cronos]: require('@/assets/images/cronos.svg'),
}

export default {
	data() {
		return {
			blockchainImage,
			revealed: 'n/a',
			balance: 'n/a',
			minted: 0,
			royalties: 'n/a',
			openSeaStats: {
				num_owners: 'n/a',
				floor_price: 'n/a',
				total_supply: 'n/a',
				total_sales: 'n/a',
				total_volume: 'n/a',
			},
		}
	},
	props: {
		sc: Object,
	},
	mounted() {
		if (!this.$props.sc.isDeployed) return

		this.getContractStats()

		if (this.$props.sc.marketplace === MARKETPLACE.OpenSea) {
			this.getOpenSeaStats()
		}
	},
	computed: {
		formattedBalance() {
			return this.balance === 'n/a' ? 'n/a' : `${this.balance} ${getCurrency(this.$props.sc.chainId)}`
		},
		viewContractUrl() {
			return `${this.getExplorerUrl(this.$props.sc.chainId)}/address/${
				this.$props.sc.address
			}`
		},
		addressCompact() {
			const address = this.$props.sc.address
			if (address) {
				const length = address.length
				return `${address.substring(0, 4)}...${address.substring(
					length - 4,
					length
				)}`
			}
			return address
		},
		openSeaUrl() {
			if(!this.$props.sc.marketplaceCollection || this.$props.sc.marketplace !== MARKETPLACE.OpenSea) {
				return null
			}

			const { name } = this.$props.sc.marketplaceCollection
			const formattedName = name.replace(/\s/g, '-').toLowerCase()
			return isTestnet(this.$props.sc.chainId)
				? `https://testnets.opensea.io/collection/${formattedName}`
				: `https://opensea.io/collection/${formattedName}`
		}
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder']),
		...mapActions(['removeDashboardCard']),
		getCurrency,
		isTestnet,
		getExplorerUrl,
		onEdit() {
			this.updateSmartContractBuilder({ ...this.$props.sc })
			this.$router.push('/wizard')
		},
		async onRemoveCard() {
			if (!confirm('Are you sure want to remove this card ?')) return

			try {
				await this.removeDashboardCard(this.$props.sc.id)
				this.$bvToast.toast('Card removed', {
					title: 'Dashboard',
					variant: 'success',
				})
			} catch (err) {
				console.error({ err })
			}
		},
		async getContractStats() {
			try {
				const { address, abi } = this.$props.sc

				const contract = new ethers.Contract(
					address,
					abi,
					this.$wallet.provider
				)

				// console.log('contract is deployed:', await contract.deployed())
				// console.log('contractUri', await contract.contractURI())

				const contractBalance = await this.$wallet.provider.getBalance(
					this.$props.sc.address
				)
				this.balance = +ethers.utils.formatEther(contractBalance)
				this.minted = (await contract.totalSupply())?.toNumber()
				this.revealed = this.$props.sc.hasDelayedReveal
					? await contract.canReveal()
					: 'n/a'
			} catch (err) {
				console.error({ err })
			}
		},
		getOpenSeaStats() {
			if (!this.$props.sc.marketplaceCollection || !this.$props.sc.isDeployed) return

			let openseaApiUrl
			let retryCount = 0
			const fetchParams = {}

			const { name } = this.$props.sc.marketplaceCollection
			const formattedName = name.replace(/\s/g, '-').toLowerCase()

			if (isTestnet(this.$props.sc.chainId)) {
				openseaApiUrl = `https://testnets-api.opensea.io/api/v1/collection/${formattedName}/stats`
				fetchParams.headers = {
					'X-API-KEY': ''
				}
			} else {
				openseaApiUrl = `https://api.opensea.io/api/v1/collection/${formattedName}/stats`
				fetchParams.headers = {
					'X-API-KEY': process.env.OPENSEA_API_KEY,
				}
			}

			const getData = () => {
				fetch(openseaApiUrl, fetchParams)
				.then((response) => {
					if(response.status == 429 && retryCount < 3) {
						retryCount++
						this.wait(2000).then(() => getData())
					}
					return response.json()
				})
				.then((data) => {
					console.log('OpenSea stats', data.stats)
					if (
						data.detail?.startsWith('Request was throttled') ||
						!data.stats ||
						(data.success && data.success === false)
					) {
						return
					}

					this.openSeaStats = data.stats
					this.openSeaStats.floor_price = !!data.stats.floor_price
						? data.stats.floor_price.toFixed(2)
						: 'n/a'
					this.openSeaStats.total_volume =
						data.stats.total_volume > 0 ? data.stats.total_volume.toFixed(2) : 0
				})
				.catch(console.error)
			}

			getData()
		},
		wait(delay) {
			return new Promise((resolve) => setTimeout(resolve, delay));
		}
	},
}
</script>

<style lang="scss">
.card {
	border-radius: 12px;
}

.b-avatar-img > img {
	object-fit: contain !important;
}

.open-sea-label {
	font-size: 0.8rem;
}

.card-menu {
	position: absolute;
	right: 0;
	ul {
		border-radius: 12px 0px 0px 12px;
	}
}

.card-logo {
	position: absolute;
	top: 53%;
	left: 50%;
	z-index: 1;
	background: white;
	transform: translate(-50%, -50%);

	// border-image-source: $theme-gradient !important;
	// border-image-slice:1 !important;
}

.hr {
	border-image-source: $theme-gradient;
	border-image-slice: 1;
}

.stats {
	div {
		padding-bottom: 1rem;
	}
}
</style>
>
