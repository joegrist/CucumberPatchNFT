<template>
  <b-form v-if='showForm' @reset.prevent='onFormReset(reset)' novalidate>
    <b-container fluid>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            label='IPFS Metadata URL'
            label-class='required'
            description='URL to the endpoint (folder) that contains metadata .json files. IMPORTANT: has to end with a slash "/"'
          >
            <b-form-input
              id='baseURL'
              name='baseURL'
              :value='smartContractBuilder.baseURL'
              @change='(val) => updateSmartContractBuilder({ baseURL: val })'
              @blur="$v.smartContractBuilder.baseURL.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.baseURL.$error}"
              type='text'
              placeholder='ipfs://*************************/'
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.baseURL">
              Please correct IPFS Metadata URL"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Collection Size'
            label-class='required'
            description='Maximum number of tokens that can be ever minted'
          >
            <b-form-input
              id='collectionSize'
              name='collectionSize'
              :value='smartContractBuilder.collectionSize'
              @change='(val) => updateSmartContractBuilder({ collectionSize: val ? +val:null })'
              @blur="$v.smartContractBuilder.collectionSize.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.collectionSize.$error}"
              type='number'
              min='1'
              placeholder='5000'
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.collectionSize">
              Please correct "Collection Size"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Name'
            label-class='required'
            description='Purely presentational'
          >
            <b-form-input
              id='contractName'
              name='contractName'
              :value='smartContractBuilder.name'
              @change='(val) => updateSmartContractBuilder({ name: val })'
              @blur="$v.smartContractBuilder.name.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.name.$error}"
              type='text'
              placeholder='Bored Apes Yacht Club'
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.name">
              Please correct "Name"
            </b-form-invalid-feedback>
          </b-form-group>

        </b-col>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Token Symbol'
            label-class='required'
            description='Purely presentational, no spaces, max 10 characters'
          >
            <b-form-input
              id='symbol'
              name='symbol'
              :value='smartContractBuilder.symbol'
              @change='(val) => updateSmartContractBuilder({ symbol: val })'
              @blur="$v.smartContractBuilder.symbol.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.symbol.$error}"
              type='text'
              maxlength='10'
              placeholder='BAYC'
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.symbol">
              Please corrent "Token Symbol"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            :label="`Mint Price (${getCurrency(smartContractBuilder.chainId)})`"
            label-class='required'
            description='Price per NFT'
          >
            <b-form-input
              id='mintPrice'
              name='mintPrice'
              :value='smartContractBuilder.mintPrice'
              @change='(val) => updateSmartContractBuilder({ mintPrice: val ? +val:null })'
              @blur="$v.smartContractBuilder.mintPrice.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.mintPrice.$error}"
              type='number'
              step='any'
              placeholder='0.05'
              required
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.mintPrice">
              Please correct "Mint Price"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Max NFTs Per Person'
            description='Maximum number of tokens per wallet address'
          >
            <b-form-input
              id='maxTokensPerPerson'
              name='maxTokensPerPerson'
              :value='smartContractBuilder.maxTokensPerPerson'
              @change='(val) => updateSmartContractBuilder({ maxTokensPerPerson: val ? +val:null })'
              @blur="$v.smartContractBuilder.maxTokensPerPerson.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.maxTokensPerPerson.$error}"
              type='number'
              min='0'
              placeholder='20'
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.maxTokensPerPerson">
              Please correct "Max NFTs Per Person". Enter 0 or leave empty.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Set Aside NFTs'
            description='How many tokens starting from 1st one onwards to set aside for the team, marketing etc. Minted to your wallet upon contract deployment and incurs gas fees so the higher this number the higher smart contract deployment fee will be'
          >
            <b-form-input
              id='setAsideTokenCount'
              name='setAsideTokenCount'
              :value='smartContractBuilder.setAsideTokenCount'
              @change='(val) => updateSmartContractBuilder({ setAsideTokenCount: val ? +val:null })'
              @blur="$v.smartContractBuilder.setAsideTokenCount.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.setAsideTokenCount.$error}"
              type='number'
              step='1'
              min='0'
              placeholder='25'
            ></b-form-input>
            <b-form-invalid-feedback :state="validation.setAsideTokenCount">
              Please correct "Set aside NFTs". Enter 0 or leave empty.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>

        <b-col sm='12' md='6'>
          <b-form-group
            label='Max NFTs Per Transaction'
            description='How many tokens can one person mint at a time. For example BAYC allowed 20'
          >
            <b-form-input
              id='maxTokensPerTransaction'
              name='maxTokensPerTransaction'
              :value='smartContractBuilder.maxTokensPerTransaction'
              @change='(val) => updateSmartContractBuilder({ maxTokensPerTransaction: val ? +val:null })'
              @blur="$v.smartContractBuilder.maxTokensPerTransaction.$touch()"
              :class="{'is-invalid': $v.smartContractBuilder.maxTokensPerTransaction.$error}"
              type='number'
              step='1'
              min='0'
              placeholder='20'
            />
          </b-form-group>
          <b-form-invalid-feedback :state="validation.maxTokensPerTransaction">
            Please correct "Max Tokens Per Transaction". Enter 0 or leave empty.
          </b-form-invalid-feedback>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button class='float-right' type='reset' variant='danger'>Reset</b-button>
        </b-col>
      </b-row>
    </b-container>
  </b-form>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { required, maxLength, numeric, minValue, decimal } from 'vuelidate/lib/validators'
import { getCurrency } from '@/constants/metamask'

export default {
  mixins: [smartContractBuilderMixin],
  data() {
    return {
      reset: {
        baseURL: null,
        collectionSize: null,
        name: null,
        symbol: null,
        mintPrice: null,
        setAsideTokenCount: null,
        maxTokensPerTransaction: null,
        maxTokensPerPerson: null
      }
    }
  },
    validations: {
      smartContractBuilder: {
        baseURL: { required },
        collectionSize: { required, numeric},
        name: { required, maxLength: maxLength(30) },
        symbol: { required, maxLength: maxLength(6) },
        mintPrice: { required, decimal, minValue:minValue(0) },
        setAsideTokenCount: { numeric, minValue:minValue(0)},
        maxTokensPerTransaction: { numeric, minValue:minValue(0) },
        maxTokensPerPerson: { numeric, minValue:minValue(0) }
      }
  },
  computed: {
    validation() {
      return {
        baseURL: !this.$v.smartContractBuilder.baseURL.$error,
        name: !this.$v.smartContractBuilder.name.$error,
        symbol: !this.$v.smartContractBuilder.symbol.$error,
        collectionSize: !this.$v.smartContractBuilder.collectionSize.$error,
        mintPrice: !this.$v.smartContractBuilder.mintPrice.$error,
        setAsideTokenCount: !this.$v.smartContractBuilder.setAsideTokenCount.$error,
        maxTokensPerPerson: !this.$v.smartContractBuilder.maxTokensPerPerson.$error,
        maxTokensPerTransaction: !this.$v.smartContractBuilder.maxTokensPerTransaction.$error,
      }
    }
  },
  methods: {
    getCurrency
  }

}
</script>
