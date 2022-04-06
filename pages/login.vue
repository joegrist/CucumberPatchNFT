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
            <LoginButton variant="primary" class="text-white" caption="Login with Metamask" />
            <b-button variant="link" href="https://discord.gg/NdEpB6ZYKn" target="_blank">Join Discord</b-button>
        </div>
        <b-button variant="link" size="sm" class="text-left" to="/wizard">Skip for now >></b-button>
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
</style>