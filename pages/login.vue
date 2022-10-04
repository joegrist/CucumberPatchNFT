<i18n>
{
    "en": {
        "title1": "Start your own NFT",
        "title2": "for FREE",
        "subtitle1": "Seamless solution to create a smart contract &",
        "subtitle2": "facilitate the launch of your NFT collection",
        "loginWithMetamask": "Login with Metamask",
        "joinDiscord": "Join Discord",
        "skipForNow": "Skip for now >>"
    },
    "es": {
        "title1": "Crea tu propio NFT",
        "title2": "GRATIS",
        "subtitle1": "Herramientas perfectas para crear un contrato inteligente y",
        "subtitle2": "facilitar el lanzamiento de tu colección NFT",
        "loginWithMetamask": "Inicia sesión con Metamask",
        "joinDiscord": "Únete Discord",
        "skipForNow": "Saltar"
    },
    "ua": {
        "title1": "Розпочни свою НФТ коллекцію",
        "title2": "БЕЗПЛАТНО",
        "subtitle1": "Легке рішення для створення смарт-контракту та",
        "subtitle2": "швидкого запуску твоєї НФТ коллекції",
        "loginWithMetamask": "Ввійти з Metamask",
        "joinDiscord": "Долучитись до Discord",
        "skipForNow": "Пропустити >>"
    }
}
</i18n>

<template>
    <section class="d-flex flex-column justify-content-center p-5">
        <h1>
            {{ $t('title1') }} <br/> {{ $t('title2') }}
        </h1>
        <h6 class="py-3">
            {{ $t('subtitle1')}} <br> {{ $t('subtitle2') }}
        </h6>
        <div class="d-flex">
            <LoginButton variant="primary" :caption="$t('loginWithMetamask')" redirect="/" />
            <b-button variant="link" :href="$config.DISCORD_INVITE_URL" target="_blank">{{ $t('joinDiscord') }}</b-button>
        </div>
        <div class="mt-1">
            <b-link class="text-muted" :to="localePath('/wizard')">
                <small>
                    {{ $t('skipForNow' )}}
                </small>
            </b-link>
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
</style>