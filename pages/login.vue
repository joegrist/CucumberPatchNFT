<template>
    <section class="d-flex flex-column justify-content-center p-5">
        <h1>
            Start your own NFT <br> for FREE
        </h1>
        <h6 class="py-3">
            Seamless solution to create a smart contract & <br>
            facilitate the launch of your NFT collection
        </h6>
        <div class="d-flex">
            <LoginButton variant="primary" caption="Login with Metamask" redirect="/" />
            <b-button variant="link" href="https://discord.gg/ZeroCodeNFT" target="_blank">Join Discord</b-button>
        </div>
        <div class="mt-1">
            <b-link class="text-muted text-skip" to="/wizard">Skip for now >></b-link>
        </div>
    </section>
</template>

<script>
import LoginButton from '@/components/login/LoginButton';

export default {
    name: 'login',
    layout: 'login',
    components: {
        LoginButton
    },
}
</script>

<style lang="scss" scoped>
    section {
        color: white;
        height: calc(100vh - 106px - 200px);
        background-color: #261E35;
    }
    .text-skip {
        font-size: 0.7rem;
    }
</style>