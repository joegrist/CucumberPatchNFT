<template>
  <b-form v-if="showForm" @reset.prevent="onFormReset(reset)">
    <b-container>
         <b-row>
        <b-col>
          <b-form-group>
            <b-form-checkbox
              id="delayedRevealFeature"
              name="delayedRevealFeature"
              :checked="smartContractBuilder.hasDelayedReveal"
              @change="(val) => updateSmartContractBuilder({ hasDelayedReveal: val })"
            >
              Add delayed reveal feature ?
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label="Placeholder URL"
            description="URL to the .json file that contains generic metadata"
            :label-class="{ 'required': smartContractBuilder.hasDelayedReveal }"
            :disabled="!smartContractBuilder.hasDelayedReveal"
          >
            <b-form-input
              id="delayedRevealURL"
              name="delayedRevealURL"
              :value="smartContractBuilder.delayedRevealURL"
              @change="(val) => updateSmartContractBuilder({ delayedRevealURL: val })"
              @input='$v.smartContractBuilder.delayedRevealURL.$touch()'
              :class="{'is-invalid': $v.smartContractBuilder.delayedRevealURL.$error}"
              type="text"
              placeholder="ipfs://..."
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.delayedRevealURL">
              Enter the URL
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button class="float-right" type="reset" variant="danger"
            >Reset</b-button
          >
        </b-col>
      </b-row>
    </b-container>
  </b-form>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { requiredIf } from 'vuelidate/lib/validators'

export default {
  data() {
    return {
      reset: {
        delayedRevealURL: null,
      },
    }
  },
  mixins: [smartContractBuilderMixin],
  computed: {
    validation() {
      return {
        delayedRevealURL: !this.$v.smartContractBuilder.delayedRevealURL.$error,
      }
    }
  },
  validations: {
    smartContractBuilder: {
      delayedRevealURL: { required: requiredIf(function() {
          return this.smartContractBuilder.hasDelayedReveal
        })
      },
    },
  },
}
</script>
