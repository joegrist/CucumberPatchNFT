<template>
  <b-form>
    <b-container fluid>
      <b-row>
        <b-col>
          <h1 class="text-center"> Attention! </h1>
          <p> You will be using your own metamask wallet to pay the deployment fees and this wallet will thus be the owner of the smart contract. </p>
          <p> This is only a testnet deployment meaning you won't be spending "real" currency but you should still have it to cover the deployment fees.</p>
          <p class="mt-3">Your wallet address: {{this.$wallet.account}} </p>
          <b-button v-if="getFaucetList($wallet.network.chainId)" class="mb-2" variant="link" v-b-toggle.faucetList>
            Faucet list to get free tokens 
          </b-button>
          <b-collapse id="faucetList">
            <ul class="pt-1">
              <li v-for="faucetUrl in getFaucetList($wallet.network.chainId)" :key="faucetUrl">
                <b-link :href="faucetUrl" target="_blank">
                  {{ faucetUrl }} <b-icon icon="box-arrow-up-right" />
                </b-link>
              </li>
            </ul>
          </b-collapse>
        </b-col>
      </b-row>
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
            <b-button @click="saveDraft()" :disabled='smartContractBuilder.isDeployed || deploymentInProgress'>Save Draft</b-button>
          </div>
        </b-col>
      </b-row>
      <b-row v-if="smartContractBuilder.address">
        <b-col>
          Deployed contract address: {{ smartContractBuilder.address }}
        </b-col>
      </b-row>
    </b-container>
    <b-modal id='deployment' title='Deployed' size='md' centered ok-only>
      <div class='text-center'>
        <h3>Success!!</h3>
        <p>Contract has been deployed! Address: {{ smartContractBuilder.address }}</p>
      </div>
    </b-modal>
  </b-form>
</template>

<script>
import { ethers } from 'ethers'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { getFaucetList } from '@/constants/metamask'

export default {
  mixins: [smartContractBuilderMixin],
  data() {
    return {
      deploymentInProgress: false,
    }
  },
  validations: {
    smartContractBuilder: {}
  },
  computed: {
    canDeploy() {
      return !this.smartContractBuilder.isDeployed && this.smartContractBuilder.email && !this.deploymentInProgress
    }
  },
  methods: {
    getFaucetList,
    onHidden() {
      // Return focus to the button once hidden
      this.$refs.deployBtn.focus()
    },
    async saveDraft() {
      try {
        const res = await this.$axios.post('/smartcontracts/save-draft', {
          ...this.smartContractBuilder,
          ownerAddress: this.$wallet.account
        })

        const { id } = res.data
        this.updateSmartContractBuilder({
            id
        })

        this.$bvToast.toast('Draft saved', {
            title: 'Draft',
            variant: 'info',
            autoHideDelay: 4000,
        })

        return id

      } catch (err) {
        this.$bvToast.toast('Failed to save the draft', {
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 4000,
        })
      }
    },
    async deploy() {
      try {

        this.deploymentInProgress = true

        const id = await this.saveDraft()

        const compilationResult = await this.$axios.post(`/smartcontracts/${id}/compile`)

        const { abi, bytecode } = compilationResult.data

        // console.log(bytecode, abi)

        this.provider = new ethers.providers.Web3Provider(window.ethereum)
        this.signer = this.provider.getSigner()

        const contractFactory = new ethers.ContractFactory(abi, `0x${bytecode}`, this.signer)

        const deploymentData = contractFactory.interface.encodeDeploy([])
        const estimatedGas = await this.provider.estimateGas({ data: deploymentData })
        console.log('gas estimate', estimatedGas.toString())

        const contract = await contractFactory.deploy()

        await this.$axios.patch(`/smartcontracts/${id}/deploy-testnet`, {
          ownerAddress: this.$wallet.account,
          address: contract.address,
        })

        this.updateSmartContractBuilder({
            isDeployed: true,
            address: contract.address
        })

        console.log({ contract })

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
