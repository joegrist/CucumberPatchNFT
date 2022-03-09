<template>
  <b-form>
    <b-container>
		<b-row>
			<b-col cols="12" class="pb-3 pb-md-5">
				<Summary :smartContract="smartContractBuilder" />
			</b-col>
		</b-row>
      <b-row>
        <b-col class='text-center'>
          <h2> Attention! </h2>
          <p> You will be using your own metamask wallet to pay the deployment fees and this wallet will thus be the owner of the smart contract.
            This is only a testnet deployment meaning you won't be spending real currency but you should still have test tokens to cover the deployment fees.</p>
          <b-button v-if="FAUCETS[$wallet.chainId]" class="mb-2" variant="link" v-b-toggle.faucetList>
            Faucet list to get FREE test tokens (click to expand)
          </b-button>
          <b-collapse id="faucetList">
            <ul class="my-1 list-unstyled">
              <li v-for="faucetUrl in FAUCETS[$wallet.chainId]" :key="faucetUrl">
                <b-link :href="faucetUrl" target="_blank">
                  {{ faucetUrl }} <b-icon icon="box-arrow-up-right" />
                </b-link>
              </li>
            </ul>
          </b-collapse>
          <p v-if="$wallet.account">
            <span class="font-weight-bold">Your wallet address: </span>
            {{ $wallet.account }}
            <b-icon icon="files" class="pointer" @click="onAccountCopy"></b-icon>
          </p>
        </b-col>
      </b-row>
      <b-row v-if="!hasEmail">
        <b-col>
          <b-form-group
            label='Your email address'
            label-class='required'
          >
            <b-form-input
              id='email'
              name='email'
              type='email'
              placeholder='john.doe@gmail.com'
              :value='smartContractBuilder.email'
              @change='(val) => updateSmartContractBuilder({ email: val })'
              @blur='$v.smartContractBuilder.email.$touch()'
              :class="{
								'is-invalid': $v.smartContractBuilder.email.$anyError,
							}"
              required
            ></b-form-input>
             <b-form-invalid-feedback :state="validation.email">
              Please provide "Email"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="d-flex justify-content-center">
            <b-button @click="saveDraft()" variant="outline-info" class="mr-3" :disabled='!canDeploy'>Save Draft</b-button>
            <b-overlay
              :show='isBusy'
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
    <b-modal id='deployment' title='Deployed' size='md' centered ok-only @ok="goToDashboard">
      <div class='text-center'>
        <h3>Success!!</h3>
        <p>Contract has been deployed!<br> 
          <b-link :href="`${getExplorerUrl(smartContractBuilder.chainId)}/address/${smartContractBuilder.address}`" target="_blank"> View on block explorer </b-link>
        </p>
      </div>
    </b-modal>
    <b-modal
        id="metamaskConnect"
        v-model="showConnectWalletModal"
        title="Connect Wallet"
        centered
        no-close-on-backdrop
        no-close-on-esc
        hide-footer
    >
        <div class="text-center">
            <b-img width="200px" class="pointer" thumbnail src="@/assets/images/metamask-fox-stacked.svg" alt="metamask logo" @click="$wallet.connect"></b-img>
        </div>
    </b-modal>
  </b-form>
</template>

<script>
import { ethers } from 'ethers'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { FAUCETS, getExplorerUrl } from '@/constants/metamask'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
import { requiredIf } from 'vuelidate/lib/validators'
import Summary from '@/components/smart-contract-wizard/Summary'

export default {
  mixins: [smartContractBuilderMixin],
  components: {
    Summary
  },
  data() {
    return {
      FAUCETS,
      showConnectWalletModal: false
    }
  },
  validations: {
    smartContractBuilder: {
      email: {
        required: requiredIf(function () {
					return !this.hasEmail
				}),
      }
    }
  },
  watch: {
    '$wallet.account': function(newVal, oldVal) {
      if(newVal !== null) {
        this.showConnectWalletModal = false
      }
    }
  },
  computed: {
    ...mapState(['isBusy']),
    ...mapGetters(['isLoggedIn']),
    validation() {
      return {
        email: !this.$v.smartContractBuilder.email.$error,
      }
    },
    hasEmail() {
      return this.$store.state.user?.email
    },
    canDeploy() {
      return !this.smartContractBuilder.isDeployed && !this.isBusy && !this.$v.smartContractBuilder.email.$anyError
    },
  },
  methods: {
    ...mapActions(['login']),
    ...mapMutations(['setBusy']),
    getExplorerUrl,
    goToDashboard() {
        this.resetBuilder()
        this.$router.push('/')
    },
    async onAccountCopy() {
      await navigator.clipboard.writeText(this.$wallet.account)
      this.$bvToast.toast('Address copied to clipboard', {
          title: 'Wallet',
          variant: 'info',
      })
    },
    onHidden() {
      // Return focus to the button once hidden
      this.$refs.deployBtn.focus()
    },
    
    async saveDraft() {
      try {

        if(!this.hasEmail && !this.smartContractBuilder.email) {
          this.$v.smartContractBuilder.email.$touch()
          return
        }
        if(!this.isLoggedIn) {
          const user = await this.login({
            email: this.email,
          })
          if(!user) {
            return
          }
        }

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

        if(!this.hasEmail && !this.smartContractBuilder.email) {
          this.$v.smartContractBuilder.email.$touch()
          return
        }
        if(!this.isLoggedIn) {
          const user = await this.login({
            email: this.email,
          })
          if(!user) {
            alert("Login failed. Please try again later or contact us on Discord.")
            return
          }
        }

        if(!this.$wallet.account) {
          this.showConnectWalletModal = true
          return
        }

        this.setBusy(true)

        if(this.smartContractBuilder.chainId !== this.$wallet.chainId) {
          await this.$wallet.switchNetwork(this.smartContractBuilder.chainId)
        }

        const id = await this.saveDraft()

        const compilationResult = await this.$axios.post(`/smartcontracts/${id}/compile`)

        const { abi, bytecode } = compilationResult.data

        const contractFactory = new ethers.ContractFactory(abi, `0x${bytecode}`, this.$wallet.provider.getSigner())

        // const deploymentData = contractFactory.interface.encodeDeploy([])
        // const estimatedGas = await this.$wallet.provider.estimateGas({ data: deploymentData })
        // console.log('gas estimate', estimatedGas.toString())

        const contract = await contractFactory.deploy()

        await this.$axios.patch(`/smartcontracts/${id}/deploy-testnet`, {
          ownerAddress: this.$wallet.account,
          address: contract.address,
        })

        this.updateSmartContractBuilder({
            isDeployed: true,
            address: contract.address
        })

        // console.log({ contract })

        this.$bvModal.show('deployment')
      } catch (e) {
        console.error(e)
        this.$bvToast.toast(e.message || 'Deployment failed', {
          title: 'Error',
          variant: 'danger',
        })
      } finally {
        this.setBusy(false)
      }
    }
  }
}
</script>
