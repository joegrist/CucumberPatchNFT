<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4>Delayed Reveal</h4>
			</b-col>
			<b-col sm="12" md="3">
				<b-overlay :show="isBusy">
					<b-button variant="primary" block @click="save">Save</b-button>
				</b-overlay>
			</b-col>
		</b-row>
		<p v-show="url">
			Current Metadata URL: <b>{{ url }}</b>
		</p>
		<!-- <b-row>
			<b-col>
				<b-form-group label="Existing metadata URL">
					<b-input v-model="url" />
				</b-form-group>
			</b-col>
		</b-row>
		<b-row>
			<b-col class="text-center">
				<h3>No Metadata? Create New!</h3>
			</b-col>
		</b-row> -->
		<b-row>
			<b-col>
				<b-form novalidate>
					<b-form-group label="Name">
						<b-form-input
							v-model="metadata.name"
							placeholder="e.g. Hidden Monkey"
							:class="{
								'is-invalid': $v.metadata.name.$error,
							}"
							@blur.native="$v.metadata.name.$touch()"
						/>
						<b-form-invalid-feedback :state="validation.name">
							Please provide name for the metadata.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group label="Description">
						<b-form-textarea
							v-model="metadata.description"
							placeholder="e.g. Hidden Monkey is still hidden"
							:class="{
								'is-invalid': $v.metadata.description.$error,
							}"
							@blur.native="$v.metadata.description.$touch()"
						/>
						<b-form-invalid-feedback :state="validation.description">
							Please provide description for the metadata.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group label="Image">
						<b-form-file
							v-model="metadata.image"
							accept="image/*"
							:class="{
								'is-invalid': $v.metadata.image.$error,
							}"
							@blur.native="$v.metadata.image.$touch()"
						/>
						<b-form-invalid-feedback :state="validation.image">
							Please select the delayed reveal image.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group>
						<template #label>
							<div class="d-flex">
								<ExternalLink
									text="nft.storage API key"
									href="https://nft.storage/docs/#get-an-api-token"
								></ExternalLink>
								<!-- <b-form-checkbox switch>Remember</b-form-checkbox> -->
							</div>
						</template>
						<b-form-input
							v-model="apiKey"
							:class="{
								'is-invalid': $v.apiKey.$error,
							}"
							@blur.native="$v.apiKey.$touch()"
							placeholder="Enter nft.storage api key."
						/>
						<b-form-invalid-feedback :state="validation.apiKey">
							Please provide the nft.storage api key.
						</b-form-invalid-feedback>
					</b-form-group>
				</b-form>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { ethers } from 'ethers'
import { CHAINID_CONFIG_MAP } from '@/constants/metamask'
import { required } from 'vuelidate/lib/validators'
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'
import fs from 'fs-extra'
export default {
	props: {
		smartContract: Object,
	},
	data() {
		return {
			isBusy: false,
			contract: null,
			url: null,
			apiKey: null,
			metadata: {
				name: "test",
				description: "test",
				image: [],
			},
		}
	},
	computed: {
		validation() {
			return {
				name: !this.$v.metadata.name.$error,
				description: !this.$v.metadata.description.$error,
				image: !this.$v.metadata.image.$error,
				apiKey: !this.$v.apiKey.$error,
			}
		},
	},
	validations: {
		metadata: {
			name: { required },
			description: { required },
			image: { required },
		},
		apiKey: { required },
	},
	async created() {
			this.apiKey =	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQ0OGUwMjhjYWE3NDdhNjI5YjcwYjkwNGE3YzFlODU1QjZiMkFGY0EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NjE0MjI0MDUyNSwibmFtZSI6Inplcm9jb2RlRFJtZXRhZGF0YXVwZGF0ZVRlc3QifQ.Of9ahM9PFcpz-YpmtzjAtAPXv3zYhJotczkjENavMhs'
		const { abi, address, chainId } = this.smartContract
		const providerUrl = CHAINID_CONFIG_MAP[chainId.toString()].rpcUrls[0]
		const jsonRpcProvider = new ethers.providers.StaticJsonRpcProvider(
			providerUrl
		)
		this.contract = new ethers.Contract(address, abi, jsonRpcProvider)
		console.log('this.contract: ', this.contract)
		// this.url = await this.contract?.preRevealURL()
	},
	methods: {
		async save() {
			try {
				this.$v.metadata.$touch();
				if (this.$v.metadata.$invalid || this.$v.$invalid) {
					console.log("form invalid")
					return;
				}
				console.log({ image: this.metadata.image })
				this.isBusy = true;
				const { ipnft: imageCID } = await this.handleImageUpload(this.metadata.image)
				console.log('imageCID: ', imageCID)
				const metadataJSON = {
					image: 'ipfs://' + imageCID,
					name: this.metadata.name,
					description: this.metadata.description,
				}
				console.log('metadataJSON: ', metadataJSON);
				const { ipnft : metadataHash } = await this.handleMetadataUpload(metadataJSON)
				console.log('metadataHash: ', metadataHash)
				// TODO: perform basic validation, upload image, then generate and upload json. get resulting hash, assign to this.url and commit()
				//..............
				//................
				this.url = `ipfs://${metadataHash}`
				await this.commit()
			} catch (err) {
				console.log('err: ', err);
				this.$bvToast.toast(err.message || 'Failed to update', {
					title: 'Delayed Reveal Config',
					variant: 'danger',
				})
			} finally {
				this.isBusy = false
			}
		},
		async handleImageUpload(image) {
			console.log('image: ', image);
			console.log('type of image: ', typeof image);
			const nftStorage = new NFTStorage({ token: this.apiKey })
			console.log('nftStorage: ', nftStorage);
			return await nftStorage.store({ image, name:this.metadata.name,description:this.metadata.description })
		},
		async handleMetadataUpload(metadata) {
			const nftStorage = new NFTStorage({ token: this.apiKey })
		const file =	fs.writeFileSync(`/apikeys/test.json`, JSON.stringify(metadata, null, 2));
			console.log('file: ', file);
			return await nftStorage.storeDirectory(file)
		
			/* fs.writeFile(`/apikeys/${metadata.name}.json`, JSON.stringify(metadata, null, 2), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});  */
			return;
			// const file = fs.readFileSync(`/apikeys/${metadata.name}.json`)
		},
		async commit() {
			try {
				if (this.$wallet.isConnected) {
					await this.$wallet.connect()
				}

				if (this.$wallet.chainId !== +this.smartContract.chainId) {
					await this.$wallet.switchNetwork(this.rawContract.chainId)
				}

				this.isBusy = true

				const signedContract = this.contract.connect(
					this.$wallet.provider.getSigner()
				)
				const gasPrice = await this.$wallet.provider.getGasPrice()
				console.info(
					`GAS PRICE: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`
				)

				const tx = await signedContract.setPreRevealUrl(this.url, {
					gasPrice,
				})

				this.$bvToast.toast('Update transaction accepted', {
					title: 'Delayed Reveal URL',
					variant: 'success',
				})

				await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
					delayedRevealURL: this.url,
				})

				tx.wait().then((_) => {
					this.$bvToast.toast('Update transaction complete', {
						title: 'Delayed Reveal URL',
						variant: 'success',
					})
				})
			} catch (err) {
				this.$bvToast.toast(err.message || 'Failed to update', {
					title: 'Delayed Reveal URL',
					variant: 'danger',
				})
			} finally {
				this.isBusy = false
			}
		},
	},
}
</script>
