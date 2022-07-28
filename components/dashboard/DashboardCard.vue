<template>
	<b-card class="shadow-sm py-3" no-body>
		<b-avatar id="blockchain-logo" class="p-2 border card-logo" :src="blockchainIcon[sc.blockchain]" size="lg">
		</b-avatar>
		<b-dropdown size="lg" variant="link" class="card-menu" ref="cardMenu" toggle-class="text-decoration-none p-0"
			no-caret id="contract-actions" right>
			<template #button-content>
				<b-icon icon="three-dots-vertical" class="text-muted" />
				<span class="sr-only">Card Menu</span>
			</template>
			<template v-if="isDeployed">
				<div id="block-explorer">
					<b-dd-text v-if="sc.address" class="text-center">
						<span class="text-muted">Block Expolorer</span><br />
						<b-link target="_blank" :href="viewContractUrl">{{ sc.address | compactAddress }} ></b-link>
					</b-dd-text>
				</div>
				<b-dropdown-divider></b-dropdown-divider>
				<b-dd-item v-b-modal="`Clone${sc.id}`" id="clone-contract">
					<b-icon icon="files" /> Clone Contract
				</b-dd-item>
				<b-dd-item v-if="supportsOpenSea" v-b-modal="`OpenSea${sc.id}`" id="link-opensea">
					<b-icon icon="link" /> Link OpenSea
				</b-dd-item>
				<b-dd-item v-if="isTestnet && !sc.isClearedForMainnet" :to="`/checkout?smId=${sc.id}`">
					<b-icon icon="wallet2" /> Go to Checkout
				</b-dd-item>
			</template>
			<b-dd-item id="remove-card" variant="danger" v-b-modal="`Remove${sc.id}`">
				<b-icon icon="trash" /> Remove Card
			</b-dd-item>
		</b-dropdown>
		<b-card-title class="text-center truncate-text px-3 mb-0 pb-2" id="project-name">
			<b-link v-if="isDeployed" class="text-dark" :to="`/project?id=${sc.id}`">{{ sc.name }}</b-link>
			<span v-else>{{ sc.name }}</span>
		</b-card-title>

		<b-card-sub-title class="text-center mb-2" id="project-type-network">
			{{ subTitle }}
			<b-icon v-if="sc.isVerified" icon="check-circle" variant="success" title="Source code verified"></b-icon>
		</b-card-sub-title>

		<b-container fluid>
			<b-row class="stats">
				<b-col cols="6" class="text-center" id="project-status">
					<span :class="[
							'font-weight-bold',
							{
								'text-success': isDeployed,
								'text-info': !isDeployed,
							},
						]">{{ isDeployed ? 'Live' : 'Draft' }}</span>
					<br />
					<span class="text-muted">Status</span>
				</b-col>
				<b-col cols="6" class="text-center" id="feature-preview">
					<span class="font-weight-bold">{{ sc.hasDelayedReveal | yesNo }} /
						{{ sc.hasWhitelist | yesNo }}</span>
					<br />
					<span class="text-muted" title="Delayed Reveal / White List">DR / WL</span>
				</b-col>
				<b-col cols="6" class="text-center" id="mint-count">
					<span class="font-weight-bold">{{ minted }} / {{ sc.collectionSize }}</span>
					<span v-if="minted === sc.collectionSize">🎉</span>
					<br />
					<span class="text-muted">Minted</span>
				</b-col>
				<b-col cols="6" class="text-center" id="withdraw-balance">
					<span class="font-weight-bold">{{ formattedBalance }}</span>
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
				<b-col cols="6" class="text-center" style="padding-bottom: 0;" id="owners-count">
					<span class="font-weight-bold">{{ openSeaStats.num_owners }}</span>
					<br />
					<span class="text-muted">Owners</span>
				</b-col>
				<b-col cols="6" class="text-center" style="padding-bottom: 0;" id="total-volume">
					<span class="font-weight-bold">{{
						openSeaStats.total_volume === 'n/a'
							? 'n/a'
							: `${openSeaStats.total_volume} ${getCurrency(sc.chainId)}`
					}}</span>
					<br />
					<span class="text-muted">Volume</span>
				</b-col>
				<b-col cols="12" class="text-center" style="padding: 0;" id="marketplace">
					<b-button v-if="isOpenSea" size="sm" :href="collectionUrl" target="_blank" variant="outline-light" class="border">
						<b-img width="90px" src="@/assets/images/open-sea-logo-dark.svg" />
					</b-button>
					<b-button v-else size="sm" variant="transparent" disabled>Marketplace N/A</b-button>
				</b-col>
				<b-col cols="6" class="text-center" id="floor-price">
					<span class="font-weight-bold">{{ openSeaStats.floor_price }}</span>
					<br />
					<span class="text-muted">Floor Price</span>
				</b-col>
				<b-col cols="6" class="text-center" id="total-sales">
					<span class="font-weight-bold">{{ openSeaStats.total_sales }}</span>
					<br />
					<span class="text-muted">Sales</span>
				</b-col>
			</b-row>
			<b-row class="pb-0">
				<b-col cols="8" id="manage-project">
					<b-button v-if="isDeployed" class="font-weight-bold" variant="link" size="sm" :to="`/project?id=${sc.id}`">
						Manage Project >></b-button>
					<b-button v-else variant="link" size="sm" class="font-weight-bold" @click="onEdit">Edit/Deploy >></b-button>
				</b-col>
				<b-col cols="4" class="text-muted text-right">
					{{ sc.createdOn | toDate }}
				</b-col>
			</b-row>
		</b-container>
		<b-modal :id="`Remove${sc.id}`" title="Confirm" centered body-class="text-center" ok-variant="primary"
			ok-title="Yes" cancel-title="No" @ok="onRemoveCard">
			<h5>Are you sure want to remove this card ?</h5>
		</b-modal>
		<b-modal :id="`Clone${sc.id}`" title="Clone Contract" centered ok-variant="primary" ok-title="Clone"
			cancel-title="Cancel" @ok.prevent="onCloneContract">
			<b-form>
				<b-form-group label="Title" label-class="required">
					<b-form-input id="cloneContractTitle" name="cloneContractTitle" type="text" v-model="cloneContractTitle"
						:state="validateState('cloneContractTitle')"></b-form-input>
					<b-form-invalid-feedback :state="validation.cloneContractTitle">
						Please correct "Title"
					</b-form-invalid-feedback>
				</b-form-group>
			</b-form>
		</b-modal>
		<b-modal :id="`OpenSea${sc.id}`" title="Link your OpenSea collection" centered ok-variant="primary" ok-title="Link"
			:ok-disabled="$v.openSeaLinkUrl.$error" @ok.prevent="onLinkOpenSea" cancel-title="Cancel">
			<div>
				<b-form-group :label="`Collection URL on ${projectDeploymentStatus}`" label-class="required"
					:description="collectionNameDesc">
					<b-form-input id="link" name="link" type="url" v-model="openSeaLinkUrl"
						:state="validateState('openSeaLinkUrl')" @blur="$v.openSeaLinkUrl.$touch()"></b-form-input>
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
import {
	MARKETPLACE,
	SMARTCONTRACT_STATUS,
	CONTRACT_TYPE,
	BLOCKCHAIN,
} from '@/constants'
import { getExplorerUrl, getCurrency } from '@/constants/metamask'
import { mapActions, mapMutations, mapGetters } from 'vuex'
import { wait, validateState, getProvider } from '@/utils'
import { required, maxLength } from 'vuelidate/lib/validators'
import BlockchainImage from '@/mixins/blockchainImage'

export default {
	mixins: [BlockchainImage],
	props: {
		sc: Object,
	},
	data() {
		return {
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
	validations: {
		openSeaLinkUrl: { required },
		cloneContractTitle: { required, maxLength: maxLength(50) },
	},
	async mounted() {
		if (!this.isDeployed) return
		await this.getContractStats()
		await this.getOpenSeaStats()
	},
	computed: {
		...mapGetters(['userId']),
		validation() {
			return {
				openSeaLinkUrl: !this.$v.openSeaLinkUrl.$error,
				cloneContractTitle: !this.$v.cloneContractTitle.$error,
			}
		},
		subTitle() {
			return `${this.projectDeploymentStatus} | ${
				CONTRACT_TYPE[this.sc.contractType]
			}`
		},
		formattedBalance() {
			return this.balance === 'n/a'
				? 'n/a'
				: `${this.balance} ${getCurrency(this.sc.chainId)}`
		},
		viewContractUrl() {
			return `${this.getExplorerUrl(this.sc.chainId)}/address/${
				this.sc.address
			}`
		},
		isOpenSea() {
			return this.sc.marketplace === MARKETPLACE.OpenSea
		},
		collectionUrl() {
			return this.sc.marketplaceCollection?.url || null
		},
		isDeployed() {
			return this.sc.status !== SMARTCONTRACT_STATUS.Draft
		},
		isTestnet() {
			return this.sc.status === SMARTCONTRACT_STATUS.Testnet
		},
		isMainnet() {
			return this.sc.status === SMARTCONTRACT_STATUS.Mainnet
		},
		supportsOpenSea() {
			return (
				this.sc.blockchain === BLOCKCHAIN.Ethereum ||
				this.sc.blockchain === BLOCKCHAIN.Polygon
			)
		},
		projectDeploymentStatus() {
			if (this.isTestnet) return 'Testnet'
			if (this.isMainnet) return 'Mainnet'
			return 'Draft'
		},
		collectionNameDesc() {
			const name = this.openSeaLinkUrl || ''
			const parts = name.split('/')
			const slug = parts[parts.length - 1]
			return this.isTestnet
				? `https://testnets.opensea.io/collection/${slug}`
				: `https://opensea.io/collection/${slug}`
		},
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
		async onLinkOpenSea() {
			this.setBusy({ isBusy: true })

			try {
				const payload = {
					smartContractId: this.sc.id,
					url: this.openSeaLinkUrl,
				}

				await this.linkOpenSea(payload)
				this.$bvModal.hide(`OpenSea${this.sc.id}`)
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
				this.setBusy({ isBusy: false })
			}
		},
		async onCloneContract() {
			this.$v.cloneContractTitle.$touch()
			if (this.$v.cloneContractTitle.$invalid) return

			try {
				this.setBusy({ isBusy: true })
				await this.cloneDashboardCard({
					id: this.sc.id,
					name: this.cloneContractTitle,
				})
				this.$bvModal.hide(`Clone${this.sc.id}`)
				this.cloneContractTitle = null
			} catch (err) {
				this.$bvToast.toast('Clone failed', {
					title: 'Smart Contract',
					variant: 'danger',
				})
			} finally {
				this.setBusy({ isBusy: false })
			}
		},
		async onRemoveCard() {
			try {
				this.setBusy({ isBusy: true })
				await this.removeDashboardCard(this.sc.id)
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
				this.setBusy({ isBusy: false })
			}
		},
		async getContractStats() {
			try {
				const { address, abi, status, chainId } = this.sc
				if (status < SMARTCONTRACT_STATUS.Testnet) {
					return
				}

				const provider = getProvider(chainId)
				const contract = new ethers.Contract(address, abi, provider)
				const contractBalance = await provider.getBalance(this.sc.address)

				this.balance = +ethers.utils.formatEther(contractBalance)
				this.minted = +(await contract.totalSupply())
			} catch (err) {
				console.error({ err })
			}
		},
		async getOpenSeaStats() {
			if (!this.isOpenSea || !this.isDeployed) return

			let openseaApiUrl
			let retryCount = 0
			const fetchParams = {}

			const name = this.sc.marketplaceCollection?.formattedName

			if (this.isTestnet) {
				openseaApiUrl = `https://testnets-api.opensea.io/api/v1/collection/${name}/stats`
				fetchParams.headers = {
					'X-API-KEY': '',
				}
			} else {
				openseaApiUrl = `https://api.opensea.io/api/v1/collection/${name}/stats`
				fetchParams.headers = {
					'X-API-KEY': this.$config.OPENSEA_API_KEY,
				}
			}

			const getData = () => {
				fetch(openseaApiUrl, fetchParams)
					.then((response) => {
						if (response.status == 429 && retryCount < 3) {
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
							data.stats.total_volume > 0
								? data.stats.total_volume.toFixed(2)
								: 0
					})
					.catch(console.error)
			}

			return getData()
		},
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
	top: 51%;
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
