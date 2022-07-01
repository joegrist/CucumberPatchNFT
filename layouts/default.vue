<template>
  <div>
    <Header/>
    <Alerts />
    <Nuxt/>
    <Footer/>
  </div>
</template>

<script>
import HeadTagMixin from '@/mixins/headTag'

export default {
  mixins: [HeadTagMixin]
}
</script>
