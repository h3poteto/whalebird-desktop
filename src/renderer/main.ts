import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAnglesRight,
  faAnglesLeft,
  faHome,
  faBell,
  faAt,
  faEnvelope,
  faUsers,
  faStar,
  faBookmark,
  faGlobe,
  faSearch,
  faHashtag,
  faListUl,
  faTimesCircle,
  faCamera,
  faUnlock,
  faLock,
  faEyeSlash,
  faEye,
  faPlus,
  faXmark,
  faSquarePollHorizontal,
  faRetweet,
  faUserPlus,
  faReply,
  faEllipsis,
  faGear,
  faPalette,
  faUser,
  faNetworkWired,
  faLanguage,
  faAlignLeft,
  faFilter,
  faRotate,
  faSliders
} from '@fortawesome/free-solid-svg-icons'
import { faFaceSmile, faPenToSquare } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import Popper from 'vue-popperjs'
import 'vue-popperjs/dist/vue-popper.css'
import { sync } from 'vuex-router-sync'
import shortkey from 'vue-shortkey'
import VueI18Next from '@panter/vue-i18next'
import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import './assets/fonts/fonts.css'
import App from './App.vue'
import router from '@/router'
import store from './store'
import i18next from '~/src/config/i18n'

library.add(
  faAnglesRight,
  faAnglesLeft,
  faHome,
  faBell,
  faAt,
  faEnvelope,
  faUsers,
  faStar,
  faBookmark,
  faGlobe,
  faSearch,
  faHashtag,
  faListUl,
  faTimesCircle,
  faCamera,
  faUnlock,
  faLock,
  faEyeSlash,
  faEye,
  faPlus,
  faFaceSmile,
  faXmark,
  faSquarePollHorizontal,
  faRetweet,
  faUserPlus,
  faReply,
  faEllipsis,
  faGear,
  faPalette,
  faUser,
  faNetworkWired,
  faLanguage,
  faAlignLeft,
  faFilter,
  faPenToSquare,
  faRotate,
  faSliders
)

Vue.use(ElementUI, { locale })
Vue.use(shortkey)
Vue.use(VueI18Next)
Vue.use(VueResize)
Vue.use(VueVirtualScroller)
Vue.component('popper', Popper)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('icon', Icon)

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
