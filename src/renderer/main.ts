import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon.vue'
import Popper from 'vue-popperjs'
import 'vue-popperjs/dist/css/vue-popper.css'
import { sync } from 'vuex-router-sync'
import shortkey from 'vue-shortkey'
import VueI18Next from '@panter/vue-i18next'

import './assets/fonts/fonts.css'
import App from './App.vue'
import router from '@/router'
import store from './store'
import i18next from '~/src/config/i18n'

Vue.use(ElementUI, { locale })
Vue.use(shortkey)
Vue.use(VueI18Next)
Vue.component('icon', Icon)
Vue.component('popper', Popper)

sync(store, router)

Vue.config.productionTip = false

const i18n: VueI18Next = new VueI18Next(i18next)

/* eslint-disable no-new */
new Vue({
  components: { App },
  i18n: i18n,
  router,
  store,
  template: '<App/>'
}).$mount('#app')
