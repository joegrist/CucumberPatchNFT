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
					text="How does metadata work ?!" />
			</b-col>
			<b-col sm="12" md="3">
				<!-- <b-overlay :show="isBusy">
					<b-button variant="primary" block @click="save">Upload</b-button>
				</b-overlay> -->
			</b-col>
		</b-row>
		<b-row v-show="smartContract.baseURL">
			<b-col>
				<p class="break-word">
					Current Base URL: <b>{{ smartContract.baseURL }}</b>
				</p>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<b-form-group
					description="The key is only stored locally in your browser and never on our servers">
					<template #label>
						<div class="d-flex">
							<ExternalLink
								text="Step 1:  get nft.storage API key"
								href="https://nft.storage/docs/#get-an-api-token"></ExternalLink>
							<b-form-checkbox
								class="ml-auto"
								switch
								v-model="rememberApiKey"
								@change="rememberKey"
								>Remember Key</b-form-checkbox
							>
						</div>
					</template>
					<b-form-input
						autofocus
						type="password"
						v-model="apiKey"
						placeholder="Enter nft.storage api key." />
				</b-form-group>
				<b-form-group
					class="mb-1"
					label="Step 2: Upload images folder"
					description="Name files in a sequential order e.g. 1.png, 2.png, etc. for best results">
					<div class="d-flex w-100">
						<b-form-file
							:disabled="!apiKey"
							:value="imageFiles"
							@input="(val) => (imageFiles = val.sort(sortFilesFn))"
							directory
							no-traverse
							multiple
							placeholder="No folder chosen"
							accept="image/*" />
						<b-overlay :show="isUploading" rounded>
							<b-button
								variant="primary"
								class="ml-2"
								:disabled="!imageFiles.length"
								@click="uploadImages"
								>Upload</b-button
							>
						</b-overlay>
					</div>
				</b-form-group>
				<p v-show="imageFiles.length">
					Files: {{ imageFiles.length }} | Size: {{ calcSize(imageFiles) }} |
					CID: {{ imagesCID || 'Not yet generated...' }}
				</p>
				<b-form-group
					class="mb-1"
					label="Step 3: Upload metadata folder (files with .json extension)">
					<div class="d-flex w-100">
						<b-form-file
							:value="jsonFiles"
							@input="(val) => (jsonFiles = val.sort(sortFilesFn))"
							directory
							no-traverse
							multiple
							placeholder="No folder chosen"
							accept=".json" />
						<b-overlay :show="isUploading" rounded>
							<b-button
								variant="primary"
								class="ml-2"
								:disabled="!jsonFiles.length"
								@click="uploadMetadata"
								>Upload</b-button
							>
						</b-overlay>
					</div>
				</b-form-group>
				<p v-show="jsonFiles.length">
					Files: {{ jsonFiles.length }} | Size: {{ calcSize(jsonFiles) }} | CID:
					{{ metadataCID || 'Not yet generated...' }}
				</p>
			</b-col>
		</b-row>
		<b-row v-if="baseUrl">
			<b-col>
				<h6 class="text-success">
					Success! Here's your metadata url:
					<br />{{ baseUrl }}
					<Copy :value="baseUrl"></Copy>
				</h6>
			</b-col>
		</b-row>
		<b-row> </b-row>
	</b-container>
</template>

<script>
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'

export default {
	props: {
		smartContract: Object,
	},
	data() {
		return {
			rememberApiKey: null,
			apiKey: null,
			imagesCID: null,
			metadataCID: null,
			isUploading: false,
			baseUrl: null,
			imageFiles: [],
			jsonFiles: [],
		}
	},
	created() {
		this.apiKey = localStorage.getItem('zcnft_nft_storage_api_key')
		if (this.apiKey) {
			this.rememberApiKey = true
		}
	},
	methods: {
		rememberKey(remember) {
			if (remember) {
				localStorage.setItem('zcnft_nft_storage_api_key', this.apiKey)
			} else {
				localStorage.removeItem('zcnft_nft_storage_api_key')
			}
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
			this.isUploading = true

			const client = new NFTStorage({ token: this.apiKey })
			this.imagesCID = await client.storeDirectory(this.imageFiles)
			console.log(this.imagesCID)

			this.isUploading = false
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
				// console.log(promises)

				const textFiles = await Promise.all(promises)
				// console.log(textFiles)

				const filesToUpload = textFiles.map((x, i) => {
					const meta = JSON.parse(x)
					console.log(meta, `${i + 1}.json`)
					meta.image = `ipfs://${this.imagesCID}/${this.imageFiles[i].name}`
					return new File([JSON.stringify(meta)], `${i + 1}.json`)
				})

				// console.log(filesToUpload)

				const client = new NFTStorage({ token: this.apiKey })
				this.metadataCID = await client.storeDirectory(filesToUpload)
				console.log(this.metadataCID)

				this.updateBaseUrl()

				this.isUploading = false
			} catch (err) {
				this.$bvToast.toast(err.message || 'Upload failed', {
					title: 'Metadata Upload',
					variant: 'danger',
				})
			}
		},
		async updateBaseUrl() {
			this.baseUrl = `ipfs://${this.metadataCID}`

			await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
				baseURL: this.baseUrl,
			})
		},
	},
}
</script>
