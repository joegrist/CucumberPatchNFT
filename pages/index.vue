<template>
  <div class='p-0 p-lg-4 wizard'>
    <horizontal-stepper
      class='p-1 p-lg-4 shadow'
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
			title="Wallet connect"
			centered
			no-close-on-backdrop
			no-close-on-esc
			hide-footer
			hide-header-close>
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
import Rolyalties from '~/components/smart-contract-wizard/steps/Rolyalties.vue'
import Verify from '~/components/smart-contract-wizard/steps/Verify.vue'
import Deploy from '~/components/smart-contract-wizard/steps/Deploy.vue'
import getSiteMeta from "@/scripts/siteMeta";
import { mapState, mapMutations } from 'vuex'

export default {
    head() {
      return {
        title: 'Smart contract wizard',
        meta: [
          ...getSiteMeta({
            type: 'website',
            title: 'Smart Contract Wizard',
            description: 'Create and deploy custom smart contract for your NFTs with ZERO code!',
            url: '/smart-contract-wizard',
            mainImage: '/smart-contract-wizard.png'
          })
        ],
        link: [
          {
            hid: "canonical",
            rel: "canonical",
            href: '/smart-contract-wizard',
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
          subtitle: 'Smart contract name, symbol etc.',
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
          name: 'royalties',
          title: 'Royalties',
          subtitle: 'Get paid from secondary market sales',
          component: Rolyalties,
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
        this.updateSmartContractBuilder({})
        this.$router.push('/dashboard')
      }
    }
  }
}
</script>

<style lang='scss' src='@/assets/styles/wizard.scss'></style>
