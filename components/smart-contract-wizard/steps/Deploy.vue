<template>
  <b-form>
    <b-container>
      <b-row>
        <b-col class='text-center'>
          <h1 class="text-warning"> Attention! </h1>
          <p> You will be using your own metamask wallet to pay the deployment fees and this wallet will thus be the owner of the smart contract. </p>
          <p> This is only a testnet deployment meaning you won't be spending real currency but you should still have test tokens to cover the deployment fees.</p>
          <b-button v-if="FAUCETS[$wallet.chainId]" class="mb-2" variant="link" v-b-toggle.faucetList>
            Faucet list to get FREE test tokens (click to expand)
          </b-button>
          <b-collapse id="faucetList">
            <ul class="pt-1 list-unstyled">
              <li v-for="faucetUrl in FAUCETS[$wallet.chainId]" :key="faucetUrl">
                <b-link :href="faucetUrl" target="_blank">
                  {{ faucetUrl }} <b-icon icon="box-arrow-up-right" />
                </b-link>
              </li>
            </ul>
          </b-collapse>
          <p class="mt-3"><span class="font-weight-bold">Your wallet address: </span> {{this.$wallet.account}} </p>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label='Your email address'
            label-class='required'
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
          <div class="d-flex justify-content-center">
            <b-button @click="saveDraft()" variant="outline-info" class="mr-3" :disabled='smartContractBuilder.isDeployed || deploymentInProgress'>Save Draft</b-button>
            <b-overlay
              :show='deploymentInProgress'
              rounded
              opacity='0.6'
              spinner-small
              spinner-variant='primary'
              class='d-inline-block'
              @hidden='onHidden'
            >
              <b-button variant='outline-success' ref='deployBtn' :disabled='!canDeploy' @click='deploy'>Deploy contract</b-button>
            </b-overlay>
          </div>
        </b-col>
      </b-row>
    </b-container>
    <b-modal id='deployment' title='Deployed' size='md' centered ok-only @ok="$router.push('/')">
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
import { FAUCETS } from '@/constants/metamask'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [smartContractBuilderMixin],
  data() {
    return {
      FAUCETS,
      deploymentInProgress: false,
    }
  },
  validations: {
    smartContractBuilder: {}
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    canDeploy() {
      return !this.smartContractBuilder.isDeployed && this.smartContractBuilder.email && !this.deploymentInProgress
    }
  },
  mounted() {
    console.log(this.$wallet.chainId, this.FAUCETS[this.$wallet.chainId])
  },
  methods: {
    ...mapActions(['login']),
    onHidden() {
      // Return focus to the button once hidden
      this.$refs.deployBtn.focus()
    },
    
    async saveDraft() {
      try {

        if(!this.isLoggedIn) {
          const user = await this.login({
            email: this.email,
          })
          if(!user) {
            alert("Login failed")
            return
          }
        }

        const res = await this.$axios.post('/smartcontracts/save-draft', {
          ...this.smartContractBuilder,
          ownerAddress: this.$wallet.account
        })

        console.log({res})

        const { id } = res.data
        this.updateSmartContractBuilder({
            id
        })

        this.$bvToast.toast('Draft saved', {
            title: 'Draft',
            variant: 'info',
        })

        return id

      } catch (err) {
        console.error({err})
        this.$bvToast.toast('Failed to save the draft', {
          title: 'Error',
          variant: 'danger',
        })
      }
    },
    async deploy() {
      try {
        if(!this.isLoggedIn) {
          const user = await this.login({
            email: this.email,
          })
          if(!user) {
            alert("Login failed")
            return
          }
        }

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
        })
      } finally {
        this.deploymentInProgress = false
      }
    }
  }
}
</script>
