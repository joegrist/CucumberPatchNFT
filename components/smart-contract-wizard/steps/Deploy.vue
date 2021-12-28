<template>
  <b-form>
    <b-container fluid>
      <b-row>
        <b-col>
          <b-form-group
            label='Email address'
            label-class='required'
            description="We'll send further instructions to this email address."
          >
            <b-form-input
              id='email'
              name='email'
              :value='smartContractBuilder.email'
              @change='(val) => updateSmartContractBuilder({ email: val })'
              type='email'
              placeholder='john.doe@gmail.com'
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div>
            <b-overlay
              :show='deploymentInProgress'
              rounded
              opacity='0.6'
              spinner-small
              spinner-variant='primary'
              class='d-inline-block'
              @hidden='onHidden'
            >
              <b-button variant='primary' ref='deployBtn' :disabled='!canDeploy' @click='deploy'>Deploy contract
              </b-button>
            </b-overlay>
            <b-button @click="postOrUpdate" :disabled='deployed || deploymentInProgress'>Save Draft</b-button>
          </div>
        </b-col>
      </b-row>
      <b-row v-if="contractAddress">
        <b-col>
          Deployed contract address: {{ contractAddress }}
        </b-col>
      </b-row>
    </b-container>
    <b-modal id='deployment' title='Deployed' size='md' centered ok-only>
      <div class='text-center'>
        <h3>Success!!</h3>
        <p>Contract has been deployed! Address: {{ contractAddress }}</p>
      </div>
    </b-modal>
  </b-form>
</template>

<script>
import { ethers } from 'ethers'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'

export default {
  mixins: [smartContractBuilderMixin],
  data() {
    return {
      deploymentInProgress: false,
      deployed: false,
      contractAddress: ''
    }
  },
  validations: {
    smartContractBuilder: {}
  },
  computed: {
    canDeploy() {
      return !this.deployed && this.smartContractBuilder.email && !this.deploymentInProgress
    }
  },
  methods: {
    onHidden() {
      // Return focus to the button once hidden
      this.$refs.deployBtn.focus()
    },
    async postOrUpdate() {
      try {
        if(!this.smartContractBuilder.id) {

          const res = await this.$axios.post('/smartcontracts', {
            ...this.smartContractBuilder,
            ownerAddress: this.$wallet.account,
            voucherSigner: this.smartContractBuilder.hasWhitelist 
              ? ethers.Wallet.createRandom().address 
              : null
          })

          const { id, abi, bytecode } = res.data

          this.updateSmartContractBuilder({
            id,
            abi,
            bytecode
          })

        }

        else {
          const payload = {
            ownerAddress: this.$wallet.account,
            ...this.smartContractBuilder
          }

          delete payload.abi
          delete payload.bytecode

          await this.$axios.put(`/smartcontracts/${this.smartContractBuilder.id}`, payload)
        }

        this.$bvToast.toast(`Draft saved!`, {
          title: 'Draft',
          variant: 'info',
          autoHideDelay: 4000,
        })
      } catch (e) {
        this.$bvToast.toast(`Error while updating the contract`, {
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 4000,
        })
      }
    },
    async deploy() {
      if (!window.ethereum) {
        alert('Metamask extension is not isntalled')
        return
      }
      if (!this.$wallet.account) {
        alert('Wallet is not connected')
        return
      }

      try {

        this.deploymentInProgress = true

        await this.postOrUpdate()

        const { id, abi, bytecode } = this.smartContractBuilder

        // console.log(bytecode, abi)

        this.provider = new ethers.providers.Web3Provider(window.ethereum)
        this.signer = this.provider.getSigner()

        const contractFactory = new ethers.ContractFactory(abi, bytecode, this.signer)
        const contract = await contractFactory.deploy()
        this.contractAddress = contract.address

        await this.$axios.put(`/smartcontracts/${id}`, {
          ...this.smartContractBuilder,
          ownerAddress: this.$wallet.account,
          address: contract.address,
          isDeployed: true,
        })

        console.log({ contract })

        this.deployed = true
        this.$bvModal.show('deployment')
      } catch (e) {
        console.error(e)
        this.$bvToast.toast(e.message || 'Deployment failed', {
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 3000
        })
      } finally {
        this.deploymentInProgress = false
      }
    }
  }
}
</script>
