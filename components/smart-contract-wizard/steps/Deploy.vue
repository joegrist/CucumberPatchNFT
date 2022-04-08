<template>
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
            This is only a <b>testnet deployment</b> meaning you won't be spending real currency but you should still have test tokens to cover the deployment fees.
            You will still be able to deploy this contract to the mainnet at a later stage.
          </p>
          <b-button v-if="FAUCETS[$wallet.chainId]" class="mb-2" variant="link" v-b-toggle.faucetList>
            Faucet list to get FREE test tokens (click to expand)
          </b-button>
          <b-collapse id="faucetList">
            <ul class="my-1 list-unstyled">
              <li v-for="faucetUrl in FAUCETS[$wallet.chainId]" :key="faucetUrl">
                <ExternalLink :href="faucetUrl" :text="faucetUrl" />
              </li>
            </ul>
          </b-collapse>
          <p v-if="$wallet.account">
            <span class="font-weight-bold">Your wallet address: </span>
            {{ $wallet.account }}
            <Copy :value="$wallet.account" />
          </p>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="d-flex justify-content-center">
            <template v-if="isLoggedIn">
              <b-button variant="outline-info" :disabled='!canDeploy' @click="saveDraft" class="mr-3">Save Draft</b-button>
              <b-button variant='outline-primary' :disabled='!canDeploy' @click='deploy'>Deploy contract</b-button>
            </template>
            <LoginButton v-else variant="primary" caption="Login to Deploy" />
          </div>
        </b-col>
      </b-row>
    <b-modal id='deployed' title='Deployed' size='md' centered ok-only @ok="$router.push('/')">
      <div class='text-center'>
        <h3>Success!!</h3>
        <p>Contract has been deployed!
          <br> 
          <b-link :href="explorerUrl" target="_blank"> View on block explorer </b-link>
        </p>
        <b-link href="https://forms.gle/nJrJRzh98FHhqmN4A" target="_blank"> Take a 2 minute survey! </b-link>
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
  </b-container>
</template>

<script>
import { ethers } from 'ethers'
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { FAUCETS, getExplorerUrl } from '@/constants/metamask'
import { mapState, mapGetters, mapMutations } from 'vuex'
import Summary from '@/components/smart-contract-wizard/Summary'
import LoginButton from '@/components/login/LoginButton'

export default {
  mixins: [smartContractBuilderMixin],
  components: {
    Summary,
    LoginButton
  },
  data() {
    return {
      FAUCETS,
      showConnectWalletModal: false
    }
  },  
  watch: {
    '$wallet.account': function(newVal, oldVal) {
      this.showConnectWalletModal = newVal === null
    }
  },
  validations: {
    smartContractBuilder: {}
  },
  computed: {
    ...mapState(['isBusy']),
    ...mapGetters(['isLoggedIn']),
    explorerUrl() {
      return `${getExplorerUrl(this.smartContractBuilder.chainId)}/address/${this.smartContractBuilder.address}`
    },
    canDeploy() {
      return !this.smartContractBuilder.isDeployed && !this.isBusy && this.isLoggedIn
    },
  },
  methods: {
    ...mapMutations(['setBusy']),
    
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
        })

        return id

      } catch (err) {
        this.$bvToast.toast('Failed to save the draft', {
          title: 'Error',
          variant: 'danger',
        })
      }
    },

    async deploy() {
      try {
        if(!this.$wallet.account) {
          this.showConnectWalletModal = true
          return
        }

        this.setBusy({isBusy: true, message: 'Wait for the Metamask popup to deploy'})

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

        this.$bvModal.show('deployed')
      } catch (err) {
        this.$bvToast.toast(err.message || 'Deployment failed', {
          title: 'Error',
          variant: 'danger',
        })
      } finally {
        this.setBusy({isBusy: false})
      }
    }
  }
}
</script>
