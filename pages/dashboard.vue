<template>
    <b-tabs content-class="mt-3" justified active-nav-item-class="font-weight-bold text-uppercase">
        <b-tab title="Smart Contracts" active>
            <SmartContractsTab />
        </b-tab>
        <b-tab title="Websites (coming soon!)" disabled><p>I'm a disabled tab!</p></b-tab>
    </b-tabs>
</template>

<style lang="scss" scoped src="@/assets/styles/dashboard.scss"></style>
