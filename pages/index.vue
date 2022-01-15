<template>
    <b-tabs content-class="mt-3" justified active-nav-item-class="font-weight-bold text-uppercase">
        <b-tab title="Smart Contracts (beta)" active>
            <SmartContractsTab />
        </b-tab>
        <b-tab title="Websites (beta)" lazy>
            <WebsitesTab />
        </b-tab>
    </b-tabs>
</template>

<script>
export default {
  middleware: 'authenticated'
}
</script>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss"></style>
