<template>
	<b-container fluid>
		<b-row class="mb-2">
			<b-col sm="12" md="9" class="my-auto">
				<h4 class="m-0">Delayed Reveal</h4>
				<span class="text-muted">Upload image and create metadata for your NFT placeholder |
				</span>
				<ExternalLink href="https://youtu.be/It05AkP_Wt4" icon="youtube" text="What's this?" />
			</b-col>
			<b-col sm="12" md="3">
				<b-overlay :show="isBusy">
					<b-button variant="primary" block @click="save">Save</b-button>
				</b-overlay>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<p v-show="url" class="break-word">
					Current Metadata URL: <b>{{ url }}</b>
				</p>
			</b-col>
		</b-row>
		<b-row>
			<b-col>
				<b-form novalidate>
					<NftStorageApiKeyFormGroup v-model="metadata.apiKey">
					</NftStorageApiKeyFormGroup>
					<b-form-group label="Name" label-class="required">
						<b-form-input v-model="metadata.name" placeholder="e.g. Hidden Monkey"
							:state="validateState('metadata.name')" />
						<b-form-invalid-feedback :state="state.name">
							Please provide name for the metadata.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group label="Description" label-class="required">
						<b-form-textarea v-model="metadata.description" placeholder="e.g. Hidden Monkey is still hidden"
							:state="validateState('metadata.description')" />
						<b-form-invalid-feedback :state="state.description">
							Please provide description for the metadata.
						</b-form-invalid-feedback>
					</b-form-group>
					<b-form-group label="Image" description="Can be any image format, including .gif" label-class="required">
						<b-form-file v-model="metadata.image" accept="image/*" :state="validateState('metadata.image')" />
						<b-form-invalid-feedback :state="state.image">
							Please select the image.
						</b-form-invalid-feedback>
					</b-form-group>
				</b-form>
			</b-col>
		</b-row>
	</b-container>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'
import { validateState, getMetamaskError } from '@/utils'
import useSmartContract from '@/hooks/useSmartContract'
import NftStorageApiKeyFormGroup from '../forms/NftStorageApiKeyFormGroup.vue';

export default {
	props: {
		smartContract: Object,
	},
	components: { NftStorageApiKeyFormGroup },
	setup(props) {
		const contract = useSmartContract(props.smartContract)
		return { contract }
	},
	data() {
		return {
			isBusy: false,
			url: null,
			uploadedMetadataUrl: null,
			metadata: {
				name: '',
				description: '',
				image: [],
				apiKey: ''
			},
		}
	},
	computed: {
		state() {
			return {
				name: !this.$v.metadata.name.$error,
				description: !this.$v.metadata.description.$error,
				image: !this.$v.metadata.image.$error,
			}
		},
	},
	validations: {
		metadata: {
			name: { required },
			description: { required },
			image: { required },
		},
	},
	async created() {
		this.url = await this.contract?.preRevealURL()
	},
	methods: {
		validateState,
		async save() {
			this.$v.$touch()
			if (this.$v.metadata.$invalid) {
				return
			}
			try {
				this.isBusy = true
				this.uploadedMetadataUrl = await this.uploadMetadata()
				await this.commit()
			} catch (err) {
				this.$bvToast.toast(getMetamaskError(err, 'Update failed'), {
					title: 'Delayed Reveal URL',
					variant: 'danger',
				})
			} finally {
				this.isBusy = false
			}
		},
		async uploadMetadata() {
			const { apiKey, name, description, image } = this.metadata
			const client = new NFTStorage({ token: apiKey })
			const metadata = await client.store({
				image,
				name,
				description,
			})
			return metadata.url
		},
		async commit() {
			if (this.$wallet.isConnected) {
				await this.$wallet.connect()
			}

			if (this.$wallet.chainId !== +this.smartContract.chainId) {
				await this.$wallet.switchNetwork(this.smartContract.chainId)
			}

			const signedContract = this.contract.connect(
				this.$wallet.provider.getSigner()
			)
			const gasPrice = await this.$wallet.provider.getGasPrice()

			const tx = await signedContract.setPreRevealUrl(this.url, {
				gasPrice,
			})

			this.$bvToast.toast('Update transaction accepted', {
				title: 'Delayed Reveal URL',
				variant: 'success',
			})

			this.url = this.uploadedMetadataUrl

			await this.$axios.patch(`/smartcontracts/${this.smartContract.id}`, {
				delayedRevealURL: this.url,
			})

			tx.wait().then((_) => {
				this.$bvToast.toast('Update transaction complete', {
					title: 'Delayed Reveal URL',
					variant: 'success',
				})
			})
		},
	},
}
</script>
