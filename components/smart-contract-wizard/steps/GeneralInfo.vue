<template>
  <b-form v-if='showForm' @reset.prevent='onFormReset(reset)' novalidate>
    <b-container fluid>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            description='URL to the endpoint (folder) that contains metadata .json files. Can be set later.'
          >
            <template #label>
              Metadata URL (IPFS)
              <ExternalLink href="https://youtu.be/1f7GvvOIe6Y" icon="youtube" text="What's this?" />
            </template>
            <b-form-input
              id='baseURL'
              name='baseURL'
              type='text'
              placeholder='ipfs://*************************/'
              :value='smartContractBuilder.baseURL'
              @change="(baseURL) => updateSmartContractBuilder({ baseURL })"
              @blur="$v.smartContractBuilder.baseURL.$touch()"
              :state="validateState('smartContractBuilder.baseURL')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.baseURL">
              Please correct "Metadata URL"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Overall Collection Size'
            label-class='required'
            description='Maximum number of NFTs that can be ever minted in this collection'
          >
            <b-form-input
              id='collectionSize'
              name='collectionSize'
              type='number'
              min='1'
              :value='smartContractBuilder.collectionSize'
              @change='(val) => updateSmartContractBuilder({ collectionSize: val ? +val:null })'
              @blur="$v.smartContractBuilder.collectionSize.$touch()"
              :state="validateState('smartContractBuilder.collectionSize')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.collectionSize">
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
            description="Purely presentational, no special characters, max 50, start with a letter"
          >
            <b-form-input
              id='contractName'
              name='contractName'
              type='text'
              placeholder='Bored Apes Yacht Club'
              :value='smartContractBuilder.name'
              @change='(val) => updateSmartContractBuilder({ name: val })'
              @blur="$v.smartContractBuilder.name.$touch()"       
              :state="validateState('smartContractBuilder.name')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.name">
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
              type='text'
              maxlength='10'
              placeholder='BAYC'
              :value='smartContractBuilder.symbol'
              @change='(val) => updateSmartContractBuilder({ symbol: val })'
              @blur="$v.smartContractBuilder.symbol.$touch()"
              :state="validateState('smartContractBuilder.symbol')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.symbol">
              Please corrent "Token Symbol"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            :label="`Price per NFT in ${currency}`"
            label-class='required'
            description='Mint price during public sale'
          >
            <b-form-input
              id='mintPrice'
              name='mintPrice'
              type='number'
              step='any'
              :value='smartContractBuilder.mintPrice'
              @change='(val) => updateSmartContractBuilder({ mintPrice: val ? +val:null })'
              @blur="$v.smartContractBuilder.mintPrice.$touch()"
              :state="validateState('smartContractBuilder.mintPrice')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.mintPrice">
              Please correct "Mint Price"
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm='12' md='6'>
          <b-form-group
            label='First X Free Per Person (experimental)'
            description='Maximum number of NFTs someone can mint for free. Subject to Max NFTs Per Person and Max NFTs Per Transaction limits.'
          >
            <b-form-input
              id='firstXFree'
              name='firstXFree'
              type='number'
              step='1'
              min='0'
              :value='smartContractBuilder.firstXFree'
              @change='(val) => updateSmartContractBuilder({ firstXFree: val ? +val:null })'
              @blur="$v.smartContractBuilder.firstXFree.$touch()"
              :state="validateState('smartContractBuilder.firstXFree')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.firstXFree">
              Please correct "First X Free". Enter 0 or leave empty.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Max NFTs Per Transaction'
            description='Maximum number of NFTs someone can mint in one go. Helps prevent botting and give everyone a fair chance to mint.'
          >
            <b-form-input
              id='maxTokensPerTransaction'
              name='maxTokensPerTransaction'
              type='number'
              min='0'
              step='1'
              :value='smartContractBuilder.maxTokensPerTransaction'
              @change='(val) => updateSmartContractBuilder({ maxTokensPerTransaction: val ? +val:null })'
              @blur="$v.smartContractBuilder.maxTokensPerTransaction.$touch()"
              :state="validateState('smartContractBuilder.maxTokensPerTransaction')"
            />
            <b-form-invalid-feedback :state="state.maxTokensPerTransaction">
              Please correct "Max NFTs Per Transaction". Enter 0 or leave empty.
            </b-form-invalid-feedback>
          </b-form-group>
        </b-col>
        <b-col sm='12' md='6'>
          <b-form-group
            label='Max NFTs Per Person'
            description='Total number of NFTs someone can mint during public sale'
          >
            <b-form-input
              id='maxTokensPerPerson'
              name='maxTokensPerPerson'
              type='number'
              step='1'
              min='0'
              :value='smartContractBuilder.maxTokensPerPerson'
              @change='(val) => updateSmartContractBuilder({ maxTokensPerPerson: val ? +val:null })'
              @blur="$v.smartContractBuilder.maxTokensPerPerson.$touch()"
              :state="validateState('smartContractBuilder.maxTokensPerPerson')"
            ></b-form-input>
            <b-form-invalid-feedback :state="state.maxTokensPerPerson">
              Please correct "Max NFTs Per Person". Enter 0 or leave empty.
            </b-form-invalid-feedback>
          </b-form-group>
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
import { required, maxLength, numeric, minValue, decimal, alphaNum } from 'vuelidate/lib/validators'
import { validateState, mustBeURL } from '@/utils'
import { getMainnetConfig } from '@/constants/metamask'
const mustBeName = val => /^[A-Za-z][\w ]{1,50}$/.test(val)

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
        maxTokensPerTransaction: null,
        maxTokensPerPerson: null
      }
    }
  },
  validations: {
      smartContractBuilder: {
        collectionSize: { required, numeric, minValue: minValue(1) },
        name: { required, mustBeName, maxLength: maxLength(50) },
        baseURL: { mustBeURL, maxLength: maxLength(200) },
        symbol: { required, alphaNum, maxLength: maxLength(10) },
        mintPrice: { required, decimal, minValue: minValue(0) },
        firstXFree: { numeric, minValue: minValue(0) },
        maxTokensPerTransaction: { numeric, minValue: minValue(0) },
        maxTokensPerPerson: { numeric, minValue: minValue(0) }
      }
  },
  computed: {
    currency() {
      const chainId = this.smartContractBuilder.chainId
      return this.getMainnetConfig(chainId)?.nativeCurrency.symbol || ''
    },
  },
  methods: {
    getMainnetConfig,
    validateState
  }

}
</script>
