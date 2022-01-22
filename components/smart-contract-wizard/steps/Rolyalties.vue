<template>
	<b-form>
		<b-container>
      <b-row>
				<b-col>
					<b-form-group
            label-class="required"
            label="Marketplace"
            label-for="marketplace"
            description="OpenSea or other">
            <b-form-select
              id="marketplace"
              name="marketplace"
              :value="smartContractBuilder.marketplace"
              @change="(val) => updateSmartContractBuilder({ marketplace: val })"
              @input="$v.smartContractBuilder.marketplace.$touch()"
              :class="{ 'is-invalid': $v.smartContractBuilder.marketplace.$error }"
              :options="marketplaces"
              required></b-form-select>
          </b-form-group>
				</b-col>
			</b-row>
      <b-row v-if="smartContractBuilder.marketplace === MARKETPLACE.OpenSea">
				<b-col>
					<b-form-group>
						<b-form-checkbox
							id="openSeaRoyalties"
							name="openSeaRoyalties"
							:checked="true"
							:disabled="true">
							Open Sea royalties are enabled by default and the actual % can
							be specified on Open Sea's colllection settings page
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row>
			<!-- <b-row>
				<b-col>
					<b-form-group>
						<b-form-checkbox
							id="raribleRoyltiesFeature"
							name="raribleRoyltiesFeature"
							:checked="smartContractBuilder.raribleRoyltiesFeature"
							:disabled="true"
							@change="
								(val) => updateSmartContractBuilder({ raribleRoyltiesFeature: val })">
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
							@change="
								(val) => updateSmartContractBuilder({ mintableRoylatiesFeature: val })">
							Add Mintable royalties feature (coming soon) ?
						</b-form-checkbox>
					</b-form-group>
				</b-col>
			</b-row> -->
		</b-container>
	</b-form>
</template>

<script>
import smartContractBuilderMixin from '@/mixins/smartContractBuilder'
import { MARKETPLACE } from '@/constants'
import { required } from 'vuelidate/lib/validators'


export default {
	mixins: [smartContractBuilderMixin],
  data() {
    return {
      MARKETPLACE,
      marketplaces: [
        {
          text: 'OpenSea',
          value: 1
        },
        {
          text: 'Other',
          value: 0
        }
      ]
    }
  },
	validations: {
		smartContractBuilder: {
			marketplace: { required },
		},
	},
}
</script>
