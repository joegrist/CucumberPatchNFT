<template>
<div></div>
    <!-- <b-modal
			id="siteModal"
			title="Add Minting Page"
			size="lg"
			centered
			@hidden="newWebsite = {}"
			@ok="onDeploySite"
			ok-title="Create"
			ok-variant="primary"
			no-close-on-backdrop
			:busy="isBusy">
			<b-form>
				<b-form-group
					label="Title"
					label-class="required"
				>
					<b-form-input
						id="title"
						name="title"
						v-model="newWebsite.title"
						type="text"
						placeholder="Bored Apes Yacht Club"
						required></b-form-input>
				</b-form-group>
				<div class="d-flex">
					<b-form-group
						label="Drop Date"
						description="Sets the countdown timer. Can be updated later"
						class="pr-1 w-50">
						<b-form-input
							id="dropDateInput"
							name="dropDateInput"
							v-model="newWebsite.dropDateInput"
							type="date"
							:min="new Date().toISOString().split('T')[0]"></b-form-input>
					</b-form-group>
					<b-form-group
						label="Drop Time"
						description="Sets the countdown timer. Can be updated later"
						class="pl-1 w-50">
						<b-form-input
							id="dropTimeInput"
							name="dropTimeInput"
							v-model="newWebsite.dropTimeInput"
							type="time"></b-form-input>
					</b-form-group>
				</div>
			</b-form>
		</b-modal> -->
</template>

<script>
export default {
	methods:{
				async onDeploySite(e) {
			e.preventDefault()

			if(this.newWebsite.backgroundImage?.size / (1024*1024) > 1){
				alert("Background image is too big. Max supported size is 1 mb.")
				return
			}

			if(this.newWebsite.icon?.size / (1024*1024) > 1){
				alert("Icon is too big. Max supported size is 1 mb.")
				return
			}

			this.setBusy({isBusy: true})

			try {
				const { dropDateInput, dropTimeInput } = this.newWebsite
				this.newWebsite.dropDate = dropDateInput
				if (dropDateInput && dropTimeInput) {
					this.newWebsite.dropDate += `T${dropTimeInput}:00`
				}

				const payload = Object.keys(this.newWebsite).reduce((formData, key) => {
					if (this.newWebsite[key]) formData.append(key, this.newWebsite[key])
					return formData
				}, new FormData())

				const { data: createdSite } = await this.$axios.post(
					'/websites/widget',
					payload
				)

				this.$bvToast.toast(
					'Website submission successful! Please allow ~10 minutes for the website to get deployed.',
					{
						title: 'Website',
						variant: 'success',
					}
				)
				
				this.$router.push(`/websites/${createdSite.id}`)
			} catch (err) {
				console.error({ err })
				this.$bvToast.toast(err.message || 'Failed to deploy the website', {
					title: 'Website',
					variant: 'danger',
				})
			} finally {
				this.setBusy({isBusy: false})
			}
		},
	}
}
</script>