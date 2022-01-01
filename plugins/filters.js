import Vue from 'vue'
import { startCase, isBoolean } from 'lodash'
import { BLOCKCHAIN } from '@/constants'
import dayjs from 'dayjs'


Vue.filter('startCase', val => startCase(val))
Vue.filter('toDate', val => dayjs(val).format('MM/DD/YYYY'))
Vue.filter('blockchainName', val => {
    if(BLOCKCHAIN[val]) {
        return BLOCKCHAIN[val]
    }
    return val
})
Vue.filter('yesNo', val => {
    if(isBoolean(val)) {
        return val ? 'Yes' : 'No'
    }
    return val
})
