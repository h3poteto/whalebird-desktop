import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Popper from 'vue-popperjs'
import 'vue-popperjs/dist/css/vue-popper.css'
import { sync } from 'vuex-router-sync'
import shortkey from 'vue-shortkey'
import VueI18Next from '@panter/vue-i18next'

import './assets/fonts/fonts.css'
import App from './App'
import router from './router'
import store from './store'
import i18next from '../config/i18n'

Vue.use(ElementUI)
Vue.use(shortkey)
Vue.use(VueI18Next)
Vue.component('icon', Icon)
Vue.component('popper', Popper)

sync(store, router)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const i18n = new VueI18Next(i18next)

/* eslint-disable no-new */
new Vue({
  components: { App },
  i18n: i18n,
  router,
  store,
  template: '<App/>'
}).$mount('#app')
