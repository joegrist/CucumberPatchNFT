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
  </div>
</template>

<script>
import HorizontalStepper from 'vue-stepper'
import ContractType from '~/components/smart-contract-wizard/steps/ContractType.vue'
import Blockchain from '~/components/smart-contract-wizard/steps/Blockchain.vue'
import GeneralInfo from '~/components/smart-contract-wizard/steps/GeneralInfo.vue'
import Features from '~/components/smart-contract-wizard/steps/Features.vue'
import Marketplace from '~/components/smart-contract-wizard/steps/Marketplace.vue'
import Deploy from '~/components/smart-contract-wizard/steps/Deploy.vue'
import getSiteMeta from "@/scripts/siteMeta";
import { mapState, mapMutations, mapGetters } from 'vuex'

export default {
    head() {
      return {
        title: 'Zero Code NFT Wizard',
        meta: [
          ...getSiteMeta({
            title: 'Zero Code NFT Wizard',
            description: 'Create your NFT collection in minutes with ZERO code!',
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
  created() {
    this.updateSmartContractBuilder({
      startTimestamp: Date.now(),
    })
  }, 
  data() {
    return {
      buildSteps: [
        {
          icon: 'looks_one',
          name: 'generalInfo',
          title: 'General Info',
          subtitle: 'Smart contract name, symbol, etc.',
          component: GeneralInfo,
          completed: false
        },
        {
          icon: 'looks_two',
          name: 'features',
          title: 'Features',
          subtitle: 'Delayed reveal, whitelist, etc.',
          component: Features,
          completed: false
        },
        {
          icon: 'looks_3',
          name: 'marketplace',
          title: 'Marketplace',
          subtitle: 'Collection name, royalties, etc.',
          component: Marketplace,
          completed: false
        },
        {
          icon: 'looks_4',
          name: 'deploy',
          title: 'Deploy',
          subtitle: 'Verify and publish the smart contract',
          component: Deploy,
          completed: false
        }
      ]
    }
  },
  computed: {
    ...mapState(['smartContractBuilder']),
    ...mapGetters(['isLoggedIn'])
  },
  beforeDestroy() {
    this.resetSmartContractBuilder()
  },
  methods: {
    ...mapMutations(['updateSmartContractBuilder', 'resetSmartContractBuilder']),

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
      if(!this.isLoggedIn) {
        alert("Please login to save progress!")
        return
      }
      if(this.smartContractBuilder?.id || confirm("You are about to lose all your changes. Are you sure you want to continue ?")) {
        this.$router.push('/')
      }
    }
  }
}
</script>

<style lang='scss' src='@/assets/styles/wizard.scss'></style>
