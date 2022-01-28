<template>
  <div class='wizard'>
    <horizontal-stepper
      class='d-flex flex-column justify-content-between p-1 p-lg-3'
      :keep-alive='false'
      :steps='buildSteps'
      @completed-step='completeStep'
      @active-step='isStepActive'
      @stepper-finished='alert'
    >
    </horizontal-stepper>
    <b-modal
        id="metamaskConnect"
        v-model="showModal"
        title="Connect Wallet"
        centered
        no-close-on-backdrop
        no-close-on-esc
        hide-footer
        hide-header-close
    >
        <div class="text-center">
            <b-img width="200px" class="pointer" thumbnail src="@/assets/images/metamask-fox-stacked.svg" alt="metamask logo" @click="$wallet.connect"></b-img>
        </div>
    </b-modal>
  </div>
</template>

<script>
import HorizontalStepper from 'vue-stepper'
import Blockchain from '~/components/smart-contract-wizard/steps/Blockchain.vue'
import GeneralInfo from '~/components/smart-contract-wizard/steps/GeneralInfo.vue'
import Whitelist from '~/components/smart-contract-wizard/steps/Whitelist.vue'
import DelayedReveal from '~/components/smart-contract-wizard/steps/DelayedReveal.vue'
import Marketplace from '~/components/smart-contract-wizard/steps/Marketplace.vue'
import Verify from '~/components/smart-contract-wizard/steps/Verify.vue'
import Deploy from '~/components/smart-contract-wizard/steps/Deploy.vue'
import getSiteMeta from "@/scripts/siteMeta";
import { mapState, mapMutations } from 'vuex'

export default {
    head() {
      return {
        title: 'Zero Code NFT Wizard',
        meta: [
          ...getSiteMeta({
            title: 'Zero Code NFT Wizard',
            description: 'Create and deploy custom smart contract for your NFT drop with ZERO code!',
            url: '/wizard',
            mainImage: '/smart-contract-wizard.png'
          })
        ],
        link: [
          {
            hid: "canonical",
            rel: "canonical",
            href: '/wizard',
          },
          {
            hid: "img_src",
            rel: "image_src",
            href: '/smart-contract-wizard.png'
          }
        ],
    }
  },
  components: {
    HorizontalStepper
  },
  data() {
    return {
      buildSteps: [
        {
          icon: 'looks_one',
          name: 'blockchain',
          title: 'Blockchain',
          subtitle: 'Blockchain to deploy smart contract to',
          component: Blockchain,
          completed: false
        },
        {
          icon: 'looks_two',
          name: 'generalInfo',
          title: 'General Info',
          subtitle: 'Smart contract name, symbol, etc.',
          component: GeneralInfo,
          completed: false
        },
        {
          icon: 'looks_3',
          name: 'whitelist',
          title: 'Whitelist',
          subtitle: 'Give priority access to selected few',
          component: Whitelist,
          completed: false
        },
        {
          icon: 'looks_4',
          name: 'delayedReveal',
          title: 'Delayed Reveal',
          subtitle: 'Reveal minted items after a period of time',
          component: DelayedReveal,
          completed: false
        },
        {
          icon: 'looks_5',
          name: 'marketplace',
          title: 'Marketplace',
          subtitle: 'Collection name, royalties, etc.',
          component: Marketplace,
          completed: false
        },
        {
          icon: 'looks_6',
          name: 'verify',
          title: 'Verify',
          subtitle: 'Double check entered information',
          component: Verify,
          completed: false
        },
        {
          icon: 'filter_7',
          name: 'deploy',
          title: 'Deploy',
          subtitle: 'Publish the smart contract',
          component: Deploy,
          completed: false
        }
      ]
    }
  },
  computed: {
    ...mapState(['smartContractBuilder']),
    showModal() {
      return this.$wallet.account === null
    }
  },
  methods: {
    ...mapMutations(['updateSmartContractBuilder']),

    // Executed when @completed-step event is triggered
    completeStep(payload) {
      this.buildSteps.forEach((step) => {
        if (step.name === payload.name) {
          step.completed = true
        }
      })
    },

    // Executed when @active-step event is triggered
    isStepActive(payload) {
      this.buildSteps.forEach((step) => {
        if (step.name === payload.name) {
          if (step.completed === true) {
            step.completed = false
          }
        }
      })
    },

    // Executed when @stepper-finished event is triggered
    alert(payload) {
      if(this.smartContractBuilder?.id || confirm("You are about to lose all your changes. Are you sure you want to finish ?")) {
        this.updateSmartContractBuilder({
          marketplaceCollection: {}
        })
        this.$router.push('/')
      }
    }
  }
}
</script>

<style lang='scss' src='@/assets/styles/wizard.scss'></style>
