<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col class="my-auto">
				<h4 class="m-0">NFT Assets Upload</h4>
				<span class="text-muted"
					>Upload your NFT collection images and metadata |</span
				>
				<ExternalLink
					href="https://youtu.be/1f7GvvOIe6Y"
					icon="youtube"
					text="How does metadata work ?!"
				/> |
				<ExternalLink
					href="https://nft-inator.com/?ref=zerocodenft"
					text="Generate yours FREE"
				/> |
			</b-col>
		</b-row>
		<b-row v-show="newBaseURL || smartContract.baseURL">
			<b-col>
				<p class="break-word">
					Most recent metadata URL: <b>{{ newBaseURL || smartContract.baseURL }}</b>
				</p>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<b-form novalidate>
					<NftStorageApiKeyFormGroup v-model="apiKey" />
					<b-form-group
						label="Step 1: Upload images folder"
						description="Name files in a sequential order e.g. 1.png, 2.png, etc. and up to 5 GB total size for best results"
					>
						<b-row no-gutters class="w-100">
							<b-col sm="12" md="10">
								<b-form-file
								:disabled="!apiKey"
								:value="imageFiles"
								@input="(val) => (imageFiles = onFilesSelected(val))"
								:file-name-formatter="formatNames"
								directory
								no-traverse
								multiple
								placeholder="No folder chosen"
							/>
							</b-col>
							<b-col sm="12" md="2">
							<b-overlay :show="isUploading" rounded>
								<b-button
									block
									variant="primary"
									class="ml-2"
									:disabled="!imageFiles.length"
									@click="uploadImages"
									>Upload <b-icon icon="cloud-arrow-up"></b-icon>
								</b-button>
							</b-overlay>
							</b-col>
						</b-row>
					</b-form-group>
					<h6 v-show="imageFiles.length" class="mb-3">
						<b-icon icon="info-square"></b-icon>
						Files: {{ imageFiles.length }} | Size: {{ calcSize(imageFiles) }} |
						CID: {{ imagesCID || 'Not yet generated' }} |
						<span v-show="imagesCID">Status: {{ imagesStatus }} | </span>
						<!--<b-button v-show="imagesCID" size="sm" variant="success" @click="refreshImagesStatus">
							Refresh</b-button> -->
					</h6>
					<b-form-group
						label="Step 2: Upload metadata folder (files with .json extension)"
						description="We will rename and format these files automatically before uploading"
					>
						<b-row no-gutters class="w-100">
							<b-col sm="12" md="10">
								<b-form-file
									:disabled="!apiKey"
									:value="jsonFiles"
									@input="(val) => (jsonFiles = onFilesSelected(val))"
									:file-name-formatter="formatNames"
									directory
									no-traverse
									multiple
									placeholder="No folder chosen"
								/>
							</b-col>
							<b-col sm="12" md="2">
								<b-overlay :show="isUploading" rounded>
									<b-button
									block
										variant="primary"
										class="ml-2"
										:disabled="!jsonFiles.length"
										@click="uploadMetadata"
										>Upload <b-icon icon="cloud-arrow-up"></b-icon>
									</b-button>
							</b-overlay>
							</b-col>
						</b-row>
							
					</b-form-group>
					<h6 v-show="jsonFiles.length">
						<b-icon icon="info-square"></b-icon>
						Files: {{ jsonFiles.length }} | Size: {{ calcSize(jsonFiles) }} |
						CID:
						{{ metadataCID || 'Not yet generated' }}
					</h6>
				</b-form>
			</b-col>
		</b-row>
		<b-row v-show="newBaseURL">
			<b-col>
				<h6 class="text-success">
					Success! Here's your metadata url {{ smartContract.hasDelayedReveal ? ', use it to reveal your collection when ready': ''}}:
					<br />{{ newBaseURL }}
					<Copy :value="newBaseURL"></Copy>
				</h6>
				<div v-if="!smartContract.hasDelayedReveal" class="d-flex mt-1">
					<b-form-group
							class="mb-1"
							label="Step 3: Update Smart Contract"
						>
						<b-overlay rounded :show="isUploading">
							<b-button variant="primary" @click="onUpdateSmartContract">Update Now</b-button>
						</b-overlay>
					</b-form-group>
				</div>
			</b-col>
		</b-row>
		<b-row> </b-row>
	</b-container>
</template>

<script>
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'
import NftStorageApiKeyFormGroup from '../forms/NftStorageApiKeyFormGroup.vue'
import useSmartContract from '@/hooks/useSmartContract'
export default {
	props: {
		smartContract: Object,
	},
	components: { NftStorageApiKeyFormGroup },
	setup(props) {
		const scInstance = useSmartContract(props.smartContract)
		return { scInstance }
	},	
	data() {
		return {
			apiKey: null,
			imagesCID: null,
			metadataCID: null,
			isUploading: false,
			newBaseURL: null,
			imagesStatus: 'Fetching...',
			nftStorageClient: null,
			imageFiles: [],
			jsonFiles: [],
		}
	},
	watch: {
		apiKey: {
			handler: function (newVal) {
				this.nftStorageClient = new NFTStorage({ token: newVal })
			},
			immediate: true,
		},
	},
	methods: {
		onFilesSelected(files) {
			return files.filter(f => !f.name.startsWith('.')).sort(this.sortFilesFn)
		},
		formatNames(files) {
			return files
				.filter(f => !f.name.startsWith('.'))
				.sort(this.sortFilesFn)
				.map(f => f.name)
				.join(', ')
		},
		calcSize(files) {
			const size =
				files.reduce((acc, val) => {
					acc += val.size
					return acc
				}, 0) /
				1024 /
				1024
			return `${size.toFixed(2)} MB`
		},
		sortFilesFn(a, b) {
			return a.name.localeCompare(b.name, undefined, {
				numeric: true,
				sensitivity: 'base',
			})
		},
		async uploadImages() {
			try {
				this.isUploading = true
				this.imagesCID = await this.nftStorageClient.storeDirectory(
					this.imageFiles
				)
				await this.refreshImagesStatus()
			} catch (err) {
				console.log(this.imagesCID, err)
				this.$bvToast.toast(err.message || 'Upload failed', {
					title: 'Image Upload',
					variant: 'danger',
				})
			} finally {
				this.isUploading = false
			}
		},
		async refreshImagesStatus() {
			this.imagesStatus = (await this.nftStorageClient.check(this.imagesCID))?.pin.status
		},
		async uploadMetadata() {
			try {
				if (this.imageFiles.length != this.jsonFiles.length) {
					throw new Error(
						"Number of images doesn't match number of metadata files"
					)
				}
				this.isUploading = true
				const promises = this.jsonFiles.map((f) => f.text())

				const textFiles = await Promise.all(promises)

				const filesToUpload = textFiles.map((x, i) => {
					const meta = JSON.parse(x)
					meta.image = `ipfs://${this.imagesCID}/${this.imageFiles[i].name}`
					return new File([JSON.stringify(meta)], `${i + 1}.json`)
				})

				this.metadataCID = await this.nftStorageClient.storeDirectory(
					filesToUpload
				)

				await this.updateBaseUrl()
			} catch (err) {
				this.$bvToast.toast(err.message || 'Upload failed', {
					title: 'Metadata Upload',
					variant: 'danger',
				})
			} finally {
				this.isUploading = false
			}
		},
		async updateBaseUrl() {
			const baseURL = `ipfs://${this.metadataCID}`

			await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
				baseURL,
			})

			this.newBaseURL = baseURL
		},
		async onUpdateSmartContract() {
			try {
				if (!this.$wallet.isConnected) {
					await this.$wallet.connect()
				}
				await this.$wallet.switchNetwork(this.smartContract.chainId)

				this.isUploading = true

				this.scInstance = this.scInstance.connect(this.$wallet.provider.getSigner())
				const gasPrice = await this.$wallet.provider.getGasPrice()

				const tx = await this.scInstance.setBaseURL(this.newBaseURL || 'abc', {
					gasPrice
				})

				this.$bvToast.toast('Transaction accepted, wait for confirmation', {
					title: 'Smart Contract Update',
					variant: 'success',
				})

				tx.wait().then(_ => {
					this.$bvToast.toast('Updated successfully', {
						title: 'Smart Contract Update',
						variant: 'success',
					})
				})

			} catch (err) {
				this.$bvToast.toast(err.message || 'Upload failed', {
					title: 'Metadata Upload',
					variant: 'danger',
				})
			} finally {
				this.isUploading = false
			}
		}
	},
}
</script>
