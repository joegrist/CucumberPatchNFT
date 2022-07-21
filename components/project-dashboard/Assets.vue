<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4 class="m-0">NFT Assets Upload</h4>
				<span class="text-muted"
					>Upload your NFT collection images and metadata |</span
				>
				<ExternalLink
					href="https://youtu.be/1f7GvvOIe6Y"
					icon="youtube"
					text="How does metadata work ?!"
				/>
			</b-col>
			<b-col sm="12" md="3">
				<!-- <b-overlay :show="isBusy">
					<b-button variant="primary" block @click="save">Upload</b-button>
				</b-overlay> -->
			</b-col>
		</b-row>
		<b-row v-show="newBaseURL || smartContract.baseURL">
			<b-col>
				<p class="break-word">
					Current Base URL: <b>{{ newBaseURL || smartContract.baseURL }}</b>
				</p>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<b-form novalidate>
					<NftStorageApiKeyFormGroup
						v-model="apiKey"
					></NftStorageApiKeyFormGroup>
					<b-form-group
						class="mb-1"
						label="Step 1: Upload images folder"
						description="Name files in a sequential order e.g. 1.png, 2.png, etc. for best results"
					>
						<div class="d-flex w-100">
							<b-form-file
								:disabled="!apiKey"
								:value="imageFiles"
								@input="(val) => (imageFiles = val.sort(sortFilesFn))"
								directory
								no-traverse
								multiple
								placeholder="No folder chosen"
								accept="image/*"
							/>
							<b-overlay :show="isUploading" rounded>
								<b-button
									variant="primary"
									class="ml-2"
									:disabled="!imageFiles.length"
									@click="uploadImages"
									>Upload
								</b-button>
							</b-overlay>
						</div>
					</b-form-group>
					<p v-show="imageFiles.length">
						Files: {{ imageFiles.length }} | Size: {{ calcSize(imageFiles) }} |
						CID: {{ imagesCID || 'Not yet generated' }} |
						<span v-show="imagesCID">Status: {{ imagesStatus }} | </span>
						<!-- 	<b-button v-show="imagesCID" size="sm" variant="success" @click="refreshImagesStatus">
								Refresh</b-button> -->
					</p>
					<b-form-group
						class="mb-1"
						label="Step 2: Upload metadata folder (files with .json extension)"
					>
						<div class="d-flex w-100">
							<b-form-file
								:disabled="!apiKey"
								:value="jsonFiles"
								@input="(val) => (jsonFiles = val.sort(sortFilesFn))"
								directory
								no-traverse
								multiple
								placeholder="No folder chosen"
								accept=".json"
							/>
							<b-overlay :show="isUploading" rounded>
								<b-button
									variant="primary"
									class="ml-2"
									:disabled="!jsonFiles.length"
									@click="uploadMetadata"
									>Upload
								</b-button>
							</b-overlay>
						</div>
					</b-form-group>
					<p v-show="jsonFiles.length">
						Files: {{ jsonFiles.length }} | Size: {{ calcSize(jsonFiles) }} |
						CID:
						{{ metadataCID || 'Not yet generated...' }}
					</p>
				</b-form>
			</b-col>
		</b-row>
		<b-row v-if="newBaseURL">
			<b-col>
				<h6 class="text-success">
					Success! Here's your metadata url:
					<br />{{ newBaseURL }}
					<Copy :value="newBaseURL"></Copy>
				</h6>
			</b-col>
		</b-row>
		<b-row> </b-row>
	</b-container>
</template>

<script>
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'
import NftStorageApiKeyFormGroup from '../forms/NftStorageApiKeyFormGroup.vue'
export default {
	props: {
		smartContract: Object,
	},
	components: { NftStorageApiKeyFormGroup },
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
			} catch (err) {
				this.$bvToast.toast(err.message || 'Upload failed', {
					title: 'Image Upload',
					variant: 'danger',
				})
				await this.refreshImagesStatus()
			} finally {
				this.isUploading = false
			}
		},
		async refreshImagesStatus() {
			this.imagesStatus = (
				await this.nftStorageClient.check(this.imagesCID)
			)?.pin.status
		},
		async uploadMetadata() {
			try {
				if (this.imageFiles.length != this.jsonFiles.length) {
					throw new Error(
						"Number of images doesn't match number of netadata files"
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
	},
}
</script>
