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

import './assets/fonts/fonts.css'
import App from './App'
import router from './router'
import store from './store'

Vue.use(ElementUI)
Vue.use(shortkey)
Vue.component('icon', Icon)
Vue.component('popper', Popper)

sync(store, router)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
