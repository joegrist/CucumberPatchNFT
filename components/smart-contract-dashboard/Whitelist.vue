<template>
	<b-container fluid>
		<b-row>
			<b-col class="mb-3">
				<b-row class="mb-2">
					<b-col>
						<h4 class="m-0">Whitelist</h4>
						<b-link href="/whitelist-csv-example.csv" download
							>Download example</b-link
						>
					</b-col>
				</b-row>
				<b-row no-gutters>
					<b-col>
						<b-form-file
							accept=".csv"
							@input="onImportCsv"
							placeholder="Choose or drop .csv file"
							drop-placeholder="Drop file here...">
						</b-form-file>
						<div v-if="invalidAddresses.length > 0">
							<h5 class="text-danger">Invalid addresses</h5>
							<ul class="p-0">
								<li
									class="d-flex"
									v-for="(addr, idx) in invalidAddresses"
									:key="idx">
									{{ addr }}
									<b-icon
										class="my-auto"
										icon="trash"
										variant="danger"
										@click="onRemoveInvalidAddress(addr)"></b-icon>
								</li>
							</ul>
						</div>
					</b-col>
				</b-row>
				<b-row class="my-2">
					<b-col cols="6">
						<b-button
							block
							variant="warning"
							:disabled="isProcessingWhitelistCommit"
							@click="onWhitelistCommit"
							>Commit List</b-button
						>
					</b-col>
					<b-col cols="6">
						<b-button
							block
							variant="danger"
							:disabled="isProcessingWhitelistCommit"
							@click="onClearWhitelist"
							>Clear</b-button
						>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-tags
							v-model="whitelist"
							invalid-tag-text="Address is invalid"
							:tag-validator="whitelistValidator"
							placeholder="Enter Wallet Address">
						</b-form-tags>
					</b-col>
				</b-row>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { ethers } from 'ethers'
import { getMerkleRoot } from '@/utils'
import { mapMutations, mapState } from 'vuex'
import {
	getExplorerUrl,
} from '@/constants/metamask'

export default {
	props: {
		smartContract: Object,
	},
	data() {
		return {
			whitelist: this.smartContract.whitelist,
			invalidAddresses: [],
			isProcessingWhitelistCommit: false,
		}
	},
	mounted() {
		this.whitelist = this.whitelist.filter(
			(a) => a !== ethers.utils.AddressZero
		)
	},
	computed: {
		...mapState(['isBusy']),
	},
	methods: {
		...mapMutations(['setBusy']),
		whitelistValidator(tag) {
			return ethers.utils.isAddress(tag)
		},
		onRemoveInvalidAddress(a) {
			this.invalidAddresses = this.invalidAddresses.filter((x) => x !== a)
			this.whitelist = this.whitelist.filter((x) => x !== a)
		},
		async onWhitelistCommit() {
			this.setBusy({ isBusy: true })
			try {
				this.whitelist.forEach((a) => {
					if (!ethers.utils.isAddress(a)) {
						this.invalidAddresses.push(a)
					}
				})

				if (this.invalidAddresses.length > 0) {
					this.$bvToast.toast(
						'Whitelist contains invalid addresses. Please remove and resubmit',
						{
							title: 'Whitelist',
							variant: 'danger',
						}
					)
					return
				}

				if (this.whitelist.length === 0) {
					this.whitelist = [ethers.constants.AddressZero]
				}
				const merkleRoot = getMerkleRoot(this.whitelist)

				const { address, abi } = this.smartContract
				const contract = new ethers.Contract(
					address,
					abi,
					this.$wallet.provider.getSigner()
				)

				const txResponse = await contract.setMerkleRoot(merkleRoot)
				this.isProcessingWhitelistCommit = true

				await this.$axios.patch(
					`/smartcontracts/${this.smartContract.id}/whitelist`,
					{
						whitelist: this.whitelist,
					}
				)

				const msg = [this.createToastMessage(txResponse.hash)]
				this.$bvToast.toast(msg, {
					title: `Processing 'Commit List'`,
					variant: 'success',
				})
				txResponse.wait().then(async (res) => {
					this.isProcessingWhitelistCommit = false
					this.$bvToast.toast(msg, {
						title: 'Commit List',
						variant: 'success',
					})
				})
			} catch (err) {
				console.log({ err })
				this.$bvToast.toast('Whitelist commit failed', {
					title: 'Whitelist',
					variant: 'danger',
				})
			} finally {
				this.isProcessingWhitelistCommit = false
				this.setBusy({ isBusy: false })
			}
		},
		async onClearWhitelist() {
			this.invalidAddresses = []
			this.whitelist = []
		},
		async onImportCsv(file) {
			if (file === null) return

			try {
				const form = new FormData()
				form.append('file', file)

				const { data } = await this.$axios.post(
					`/smartcontracts/${this.smartContract.id}/whitelist`,
					form
				)

				this.whitelist = data

				this.$bvToast.toast(
					'You MUST commit the list to save it into the smart contract for it to take effect!',
					{
						title: 'Whitelist',
						variant: 'warning',
					}
				)
				this.$bvToast.toast('File successfully uploaded', {
					title: 'Whitelist',
					variant: 'success',
				})
				this.invalidAddresses = []
			} catch (err) {
				console.log({ err })
				if (err.response.data.errors?.invalidAddresses) {
					this.invalidAddresses = err.response.data.errors?.invalidAddresses
				}
				this.$bvToast.toast('File upload failed', {
					title: 'Whitelist',
					variant: 'danger',
				})
			}
		},
		createToastMessage(hash) {
			const h = this.$createElement
			return h('span', [
				'Transaction accepted! ',
				h(
					'b-link',
					{
						props: {
							target: '_blank',
							href: `${getExplorerUrl(
								this.smartContract.chainId
							)}/tx/${hash}`,
						},
					},
					['View on block explorer >']
				),
			])
		},
	},
}
</script>
