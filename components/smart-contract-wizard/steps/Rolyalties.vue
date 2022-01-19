<template>
    <b-form>
        <b-container>
            <b-row>
                <b-col>
                    <b-form-group>
            <b-form-checkbox
              id="openSeaRoyalties"
              name="openSeaRoyalties"
              :checked="true"
              :disabled="true"
            >
              Open Sea royalties are enabled by default and the actual % should be specified on Open Sea's colllection settings page
            </b-form-checkbox>
          </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-form-group>
            <b-form-checkbox
              id="raribleRoyltiesFeature"
              name="raribleRoyltiesFeature"
              :checked="smartContractBuilder.raribleRoyltiesFeature"
              :disabled="true"
              @change="(val) => updateSmartContractBuilder({ raribleRoyltiesFeature: val })"
            >
              Add Rarible royalties feature (coming soon) ?
            </b-form-checkbox>
          </b-form-group>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <b-form-group>
            <b-form-checkbox
              id="mintableRoylatiesFeature"
              name="mintableRoylatiesFeature"
              :checked="smartContractBuilder.mintableRoylatiesFeature"
              :disabled="true"
              @change="(val) => updateSmartContractBuilder({ mintableRoylatiesFeature: val })"
            >
              Add Mintable royalties feature (coming soon) ?
            </b-form-checkbox>
          </b-form-group>
                </b-col>
            </b-row>
        </b-container>
    </b-form>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'

export default {
    mixins: [smartContractBuilderMixin],
    validations: {
      smartContractBuilder: {},
    },
    mounted() {
      this.$emit('can-continue', { value: true })
    }
}
</script>
