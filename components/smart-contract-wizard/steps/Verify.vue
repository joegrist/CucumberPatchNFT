<template>
  <b-container>
    <b-row v-for='item in summary' :key='item.key'>
      <b-col><strong>{{ item.key | startCase }}</strong>: {{ item.val | yesNo | blockchainName }}</b-col>
    </b-row>
  </b-container>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'

export default {
  mixins: [smartContractBuilderMixin],
  computed: {
    summary() {
      return Object.entries(this.smartContractBuilder)
        .filter(([k, _]) => !['id', 'abi', 'bytecode', 'chainId'].includes(k))
        .map(([key, val]) => {
          return {
            key, val
          }
        })
        .sort((a,b) => a.key.localeCompare(b.key))
    }
  },
  validations: {
    smartContractBuilder: {}
  }
}
</script>
