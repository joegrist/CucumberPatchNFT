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
          <b-button v-if="FAUCETS[smartContractBuilder.chainId]" class="mb-2" variant="link" v-b-toggle.faucetList>
            Faucet list to get FREE test tokens (click to expand)
          </b-button>
          <b-collapse id="faucetList">
            <ul class="my-1 list-unstyled">
              <li v-for="faucetUrl in FAUCETS[smartContractBuilder.chainId]" :key="faucetUrl">
                <ExternalLink :href="faucetUrl" :text="faucetUrl" />
              </li>
            </ul>
          </b-collapse>
          <div v-if="$wallet.account" class="mb-3">
            <span class="font-weight-bold">Your wallet address: </span>
            <span class="break-word">{{ $wallet.account }}</span>
            <Copy :value="$wallet.account" />
          </div>
          <b-alert :show="lowBalance" variant="danger">Your {{ getCurrency(smartContractBuilder.chainId)}} balance too low. Get some funds from the faucet first or select a different wallet.</b-alert>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="d-flex justify-content-center">
            <template v-if="isLoggedIn">
              <b-button variant="outline-success" :disabled='!canSaveDraft' @click="saveDraft" class="mr-3">Save Draft</b-button>
              <b-button variant='primary' :disabled='!canDeploy' @click='deploy'>Deploy to Testnet</b-button>
            </template>
            <LoginButton v-else variant="primary" caption="Login to Deploy" />
          </div>
        </b-col>
      </b-row>
    <b-modal id='deployed' title='Congratulations 🎉' centered ok-only ok-title="Continue" @ok="$router.push('/')">
      <div class='text-center'>
        <p>You've successfully deployed smart contract in <b>{{duration}}!</b></p>
        <p>Now what ?</p>
        <b-list-group>
          <b-list-group-item button @click="() => $refs.twitterShare.$el.click()">
          <ShareNetwork
              ref="twitterShare"
              network="twitter"
              :url="twitterUrl"
              :title="`I've just deployed my NFT smart contract with ZERO code in ${duration}!`"
              hashtags="zerocodenft,nocode,nft,launchpad"
            >
              <b-icon icon="twitter"></b-icon> Tweet
            </ShareNetwork>
          </b-list-group-item>
          <b-list-group-item :href="explorerUrl" target="_blank">View on block explorer</b-list-group-item>
          <b-list-group-item :href="`https://mint.zerocodenft.com?siteId=${smartContractBuilder.siteId}`" target="_blank">Mint your first NFT</b-list-group-item>
          <b-list-group-item>
            Tell us how we did ?!
            <b-form-rating variant="warning" size="sm" inline no-border @change="goToSurvey"></b-form-rating>
          </b-list-group-item>
        </b-list-group>
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
import { FAUCETS, getExplorerUrl, getCurrency } from '@/constants/metamask'
import { mapState, mapGetters, mapMutations } from 'vuex'
import Summary from '@/components/smart-contract-wizard/Summary'
import LoginButton from '@/components/login/LoginButton'
import { getMetamaskError } from '@/utils'
import dayjs from 'dayjs'

export default {
  mixins: [smartContractBuilderMixin],
  components: {
    Summary,
    LoginButton
  },
  data() {
    return {
      FAUCETS,
      showConnectWalletModal: false,
      duration: null
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
    ...mapGetters(['isLoggedIn', 'referral']),
    explorerUrl() {
      return `${getExplorerUrl(this.smartContractBuilder.chainId)}/address/${this.smartContractBuilder.address}`
    },
    lowBalance() {
      return this.$wallet.chainId === +this.smartContractBuilder.chainId && this.$wallet.balance === 0
    },
    canSaveDraft() {
      return this.isLoggedIn && !this.smartContractBuilder.isDeployed
    },
    canDeploy() {
      return this.isLoggedIn && !this.lowBalance && !this.smartContractBuilder.isDeployed
    },
    twitterUrl() {
      return this.referral
        ? `https://app.zerocodenft.com?ref=${this.referral.code}`
        : 'https://app.zerocodenft.com'
    }
  },
  methods: {
    ...mapMutations(['setBusy']),
    getCurrency,
    goToSurvey() {
      window.open('https://forms.gle/nJrJRzh98FHhqmN4A', '_blank')
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
        if(!this.$wallet.isConnected) {
          this.showConnectWalletModal = true
          return
        }

        this.setBusy({isBusy: true, message: 'Wait for the Metamask popup to deploy'})

        if(this.smartContractBuilder.chainId !== this.$wallet.chainId) {
          await this.$wallet.switchNetwork(this.smartContractBuilder.chainId)
        }

        const id = await this.saveDraft()

        const { data: compilationResult } = await this.$axios.post(`/smartcontracts/${id}/compile`)

        const { abi, bytecode } = compilationResult

        const signer = this.$wallet.provider.getSigner()

        const contractFactory = new ethers.ContractFactory(abi, `0x${bytecode}`, signer)

        // const deploymentData = contractFactory.interface.encodeDeploy([])
        // const estimatedGas = await signer.estimateGas({ data: deploymentData })
        // console.log('gas estimate', estimatedGas.toNumber(), ethers.utils.formatUnits(estimatedGas, 'gwei'))

        const gasPrice = await this.$wallet.provider.getGasPrice()
				console.info(
					`GAS PRICE: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`
				)

        const contract = await contractFactory.deploy({
          gasPrice
        })

        const { data: contractResponse } = await this.$axios.patch(`/smartcontracts/${id}/deploy-testnet`, {
          ownerAddress: this.$wallet.account,
          address: contract.address,
        })

        this.updateSmartContractBuilder({
            isDeployed: true,
            address: contract.address,
            siteId: contractResponse.siteId
        })

        // console.log({ contract })
        this.duration = `${dayjs().diff(this.smartContractBuilder.startTimestamp, 'minute')} minutes`

        this.$bvModal.show('deployed')
      } catch (err) {
        this.$bvToast.toast(getMetamaskError(err, 'Deployment failed'), {
          title: 'Deployment',
          variant: 'danger',
        })
      } finally {
        this.setBusy({isBusy: false})
      }
    }
  }
}
</script>

<style lang="scss">
  .share-network-twitter {
    color: #1DA1F2;
    &:hover {
      text-decoration: none
    }
  }
</style>
