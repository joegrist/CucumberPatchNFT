<template>
  <b-form v-if="showForm" @reset.prevent="onFormReset(reset)">
    <b-container>
      <b-row>
        <b-col>
          <b-form-group>
            <b-form-checkbox
              id="whitelistFeature"
              name="whitelistFeature"
              :checked="smartContractBuilder.hasWhitelist"
              @change="(val) => updateSmartContractBuilder({ hasWhitelist: val })"
            >
              Add whitelist feature ?
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label="Presale Price"
            description="Can be the same as public sale price or zero to allow free mint"
            :label-class="{'required': smartContractBuilder.hasWhitelist}"
            :disabled="!smartContractBuilder.hasWhitelist"
          >
            <b-form-input
              id="whitelistPrice"
              name="whitelistPrice"
              :value="smartContractBuilder.whitelistPrice"
              @change="(val) => updateSmartContractBuilder({ whitelistPrice: val ? +val:null })"
              :required="smartContractBuilder.hasWhitelist"
              @input='$v.smartContractBuilder.whitelistPrice.$touch()'
              :class="{'is-invalid': $v.smartContractBuilder.whitelistPrice.$error}"
              type="number"
              step="any"
              min="0"
              placeholder="0.03"
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.whitelistPrice">
              Enter the presale price
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group
            label="List of wallet addresses"
            description="Paste address and press Enter to save. Can be updated later on"
          >
            <b-form-tags 
              id="whitelist"
              name="whitelist"
              :disabled="!smartContractBuilder.hasWhitelist"
              :value="smartContractBuilder.whitelist"
              @input="(val) => updateSmartContractBuilder({ whitelist: val })"
              placeholder="0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199">
            </b-form-tags>
            <!-- <b-form-textarea
              id="whitelist"
              name="whitelist"
              :value="smartContractBuilder.whitelist"
              @change="(val) => updateSmartContractBuilder({ whitelist: val })"
              placeholder="0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199,0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            ></b-form-textarea> -->
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
import { requiredIf, decimal, minValue } from 'vuelidate/lib/validators'

export default {
  data() {
    return {
      reset: {
        whitelistPrice: null,
      },
    }
  },
  mixins: [smartContractBuilderMixin],
  computed: {
    validation() {
      return {
        whitelistPrice: !this.$v.smartContractBuilder.whitelistPrice.$error,
      }
    }
  },
  validations: {
    smartContractBuilder: {
      whitelistPrice: { required: requiredIf(function() {
          return this.smartContractBuilder.hasWhitelist
        }),decimal, minValue:minValue(0)
      },
    },
  },
}
</script>
