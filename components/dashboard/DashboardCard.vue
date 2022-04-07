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
			<template v-if="isDeployed">
				<b-dd-text v-if="$props.sc.address" class="text-center">
					<span class="text-muted">Block Expolorer</span><br />
					<b-link target="_blank" :href="viewContractUrl"
						>{{ $props.sc.address | compactAddress }} ></b-link
					>
				</b-dd-text>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dd-item
					v-if="$props.sc.website"
					:to="`/websites/${$props.sc.website.id}`"
					><b-icon icon="pencil-square" /> Minting Page</b-dd-item
				>
				<b-dd-item v-if="!$props.sc.website && $config.FF_CREATE_SITE" @click="onCreateMintPage"
					><b-icon icon="cloud-upload" /> Minting Page</b-dd-item
				>
				<b-dd-item v-b-modal="`Clone${sc.id}`"
					><b-icon icon="files" /> Clone Contract</b-dd-item
				>
				<b-dd-item v-b-modal="`OpenSea${$props.sc.id}`"
					><b-icon icon="link" /> Link OpenSea</b-dd-item
				>
			</template>
			<b-dd-item variant="danger" v-b-modal="`Remove${$props.sc.id}`"
				><b-icon icon="trash" /> Remove Card
			</b-dd-item>
		</b-dropdown>
		<b-card-title class="text-center truncate-text px-3">
			<b-link
				v-if="isDeployed"
				class="text-dark"
				:to="`/smart-contracts/${$props.sc.id}`"
				>{{ $props.sc.name | startCase }}</b-link
			>
			<span v-else>{{ $props.sc.name | startCase }}</span>
		</b-card-title>
		
		<b-card-sub-title class="text-center mb-2">{{
			contractNetwork
		}}</b-card-sub-title>

		<b-container fluid>
			<b-row class="stats">
				<b-col cols="6" class="text-center">
					<span
						:class="[
							'font-weight-bold',
							{
								'text-success': isDeployed,
								'text-info': !isDeployed,
							},
						]"
						>{{ isDeployed ? 'Live' : 'Draft' }}</span
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
					<template v-if="isOpenSea">
						<b-link :href="collectionUrl" target="_blank">
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
						v-if="isDeployed"
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
		<b-modal
			:id="`Remove${$props.sc.id}`"
			title="Confirm"
			centered
			body-class="text-center"
			ok-variant="primary"
			ok-title="Yes"
			cancel-title="No"
			@ok="onRemoveCard"
		>
			<h5>Are you sure want to remove this card ?</h5>
		</b-modal>
		<b-modal
			:id="`Clone${sc.id}`"
			title="Clone Contract"
			centered
			ok-variant="primary"
			ok-title="Clone"
			cancel-title="Cancel"
			@ok="onCloneContract"
		>
			<b-form>
				<b-form-group
					label="Title"
					label-class='required'
				>
					<b-form-input
						id='cloneContractTitle'
						name='cloneContractTitle'
						type='text'
						v-model='cloneContractTitle'
						:state="validateState('cloneContractTitle')"
					></b-form-input>
					<b-form-invalid-feedback :state="validation.cloneContractTitle">
						Please correct "Title"
					</b-form-invalid-feedback>
				</b-form-group>
			</b-form>
		</b-modal>
		<b-modal
			:id="`OpenSea${$props.sc.id}`"
			title="Link your OpenSea collection"
			centered
			ok-variant="primary"
			ok-title="Link"
			:ok-disabled="$v.openSeaLinkUrl.$error"
			@ok="onLinkOpenSea"
			cancel-title="Cancel"
		>
			<div>
				 <b-form-group
					:label="`Collection URL on ${contractNetwork}`"
					label-class='required'
					:description="collectionNameDesc"
				>
					<b-form-input
					id='link'
					name='link'
					type='url'
					v-model='openSeaLinkUrl'
					:state="validateState('openSeaLinkUrl')"
					@blur="$v.openSeaLinkUrl.$touch()"
					></b-form-input>
					<b-form-invalid-feedback :state="validation.openSeaLinkUrl">
						Please correct "Collection URL"
					</b-form-invalid-feedback>
				</b-form-group>
			</div>
		</b-modal>
	</b-card>
</template>

<script>
import { ethers } from 'ethers'
import { BLOCKCHAIN, MARKETPLACE, SMARTCONTRACT_STATUS } from '@/constants'
import { getExplorerUrl, getCurrency } from '@/constants/metamask'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import { wait, validateState } from '@/utils'
import { required } from 'vuelidate/lib/validators'

const blockchainImage = {
	[BLOCKCHAIN.Ethereum]: require('@/assets/images/ethereum.svg'),
	[BLOCKCHAIN.Solana]: require('@/assets/images/solana.svg'),
	[BLOCKCHAIN.Fantom]: require('@/assets/images/fantom.svg'),
	[BLOCKCHAIN.Polygon]: require('@/assets/images/polygon.svg'),
	[BLOCKCHAIN.Avalanche]: require('@/assets/images/avalanche.svg'),
	[BLOCKCHAIN.BinanceSmartChain]: require('@/assets/images/binance.svg'),
	[BLOCKCHAIN.Cronos]: require('@/assets/images/cronos.svg'),
	[BLOCKCHAIN.Songbird]: require('@/assets/images/songbird.svg')
}

export default {
	data() {
		return {
			blockchainImage,
			revealed: 'n/a',
			balance: 'n/a',
			minted: 0,
			openSeaLinkUrl: null,
			royalties: 'n/a',
			cloneContractTitle: null,
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
	validations: {
		openSeaLinkUrl: { required },
		cloneContractTitle: { required },
	},
	mounted() {
		if (!this.isDeployed) return
		this.getContractStats()
		this.getOpenSeaStats()
	},
	computed: {
		...mapGetters(['userId']),
		validation() {
			return {
				openSeaLinkUrl: !this.$v.openSeaLinkUrl.$error,
				cloneContractTitle: !this.$v.cloneContractTitle.$error
			}
		},
		formattedBalance() {
			return this.balance === 'n/a' ? 'n/a' : `${this.balance} ${getCurrency(this.$props.sc.chainId)}`
		},
		viewContractUrl() {
			return `${this.getExplorerUrl(this.$props.sc.chainId)}/address/${
				this.$props.sc.address
			}`
		},
		isOpenSea() {
			return this.$props.sc.marketplace === MARKETPLACE.OpenSea
		},
		collectionUrl() {
			return this.$props.sc.marketplaceCollection?.url || null
		},
		isDeployed() {
			return this.$props.sc.status !== SMARTCONTRACT_STATUS.Draft
		},
		isTestnet() {
			return this.$props.sc.status === SMARTCONTRACT_STATUS.Testnet
		},
		isMainnet() {
			return this.$props.sc.status === SMARTCONTRACT_STATUS.Mainnet
		},
		contractNetwork() {
			if(this.isTestnet) return 'Testnet'
			if(this.isMainnet) return 'Mainnet'
			return 'Draft'
		},
		collectionNameDesc() {
			const name = this.openSeaLinkUrl || ''
			const parts = name.split('/')
			const slug = parts[parts.length - 1]
			return this.isTestnet
				? `https://testnets.opensea.io/collection/${slug}`
				: `https://opensea.io/collection/${slug}`
		}
	},
	methods: {
		...mapMutations(['updateSmartContractBuilder', 'setBusy']),
		...mapActions(['removeDashboardCard', 'cloneDashboardCard', 'linkOpenSea']),
		getCurrency,
		getExplorerUrl,
		validateState,
		onEdit() {
			this.updateSmartContractBuilder({ ...this.sc, marketplaceCollection: {} })
			this.$router.push('/wizard')
		},
		async onLinkOpenSea(e) {
			e.preventDefault()

			this.setBusy(true)

			try {
				const payload = {
					smartContractId: this.$props.sc.id,
					url: this.openSeaLinkUrl
				}

				await this.linkOpenSea(payload)
				this.$bvModal.hide(`OpenSea${this.$props.sc.id}`)
				this.$bvToast.toast('Linked successfully', {
					title: 'OpenSea Link',
					variant: 'success',
				})
				wait(2000).then(this.getOpenSeaStats)
			} catch (err) {
				this.$bvToast.toast('Linking failed', {
					title: 'OpenSea Link',
					variant: 'danger',
				})
			} finally {
				this.setBusy(false)
			}
		},
		async onCreateMintPage() {
			this.$emit('create-site', this.$props.sc.id)

			const pagesCount = this.$axios.get(`/users/${this.userId}/websites/count`)
			if(pagesCount >= 2) {
				alert("You've reached minting pages limit (2). Please remove other pages first or contact us to upgrade your account")
			}
			else {
				this.$emit('create-site', this.$props.sc.id)
			}
		},
		async onCloneContract(e) {
			e.preventDefault()
			this.$v.cloneContractTitle.$touch()
			if(this.$v.cloneContractTitle.$invalid) return
			try {
				this.setBusy(true)
				await this.cloneDashboardCard({ id: this.sc.id, name: this.cloneContractTitle })
				this.$bvModal.hide(`Clone${this.sc.id}`)
				this.cloneContractTitle = null
			} catch (err) {
				console.error(err)
				this.$bvToast.toast('Clone failed', {
					title: 'Smart Contract',
					variant: 'danger',
				})
			} finally {
				this.setBusy(false)
			}
		},
		async onRemoveCard() {
			try {
				this.setBusy(true)
				await this.removeDashboardCard(this.$props.sc.id)
				this.$bvToast.toast('Card removed', {
					title: 'Dashboard',
					variant: 'success',
				})
			} catch (err) {
				this.$bvToast.toast('Card delete failed', {
					title: 'Dashboard',
					variant: 'danger',
				})
			} finally {
				this.setBusy(false)
			}
		},
		async getContractStats() {
			try {
				const { address, abi, status } = this.$props.sc
				if(status < SMARTCONTRACT_STATUS.Testnet) {
					return
				}

				const contract = new ethers.Contract(
					address,
					abi,
					this.$wallet.provider
				)

				const contractBalance = await this.$wallet.provider.getBalance(
					this.$props.sc.address
				)

				this.balance = +ethers.utils.formatEther(contractBalance)
				this.minted = +(await contract.totalSupply())
				this.revealed = this.$props.sc.hasDelayedReveal
					? await contract.canReveal()
					: 'n/a'
			} catch (err) {
				console.error({ err })
			}
		},
		async getOpenSeaStats() {
			if (!this.isOpenSea || !this.isDeployed) return

			let openseaApiUrl
			let retryCount = 0
			const fetchParams = {}

			const name = this.$props.sc.marketplaceCollection.formattedName

			if (this.isTestnet) {
				openseaApiUrl = `https://testnets-api.opensea.io/api/v1/collection/${name}/stats`
				fetchParams.headers = {
					'X-API-KEY': ''
				}
			} else {
				openseaApiUrl = `https://api.opensea.io/api/v1/collection/${name}/stats`
				fetchParams.headers = {
					'X-API-KEY': process.env.OPENSEA_API_KEY,
				}
			}

			const getData = () => {
				fetch(openseaApiUrl, fetchParams)
				.then((response) => {
					if(response.status == 429 && retryCount < 3) {
						retryCount++
						wait(2000).then(() => getData())
					}
					return response.json()
				})
				.then((data) => {
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

			return getData()
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
