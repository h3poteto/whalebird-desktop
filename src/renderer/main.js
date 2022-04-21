import { createApp } from 'vue'
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
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
  faHashtag,
  faListUl,
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
  faSliders,
  faUserXmark,
  faHourglass,
  faCheck,
  faQuoteRight,
  faThumbTack,
  faChevronLeft,
  faEllipsisVertical,
  faCircleXmark,
  faMagnifyingGlass,
  faCircleUser,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faLink
} from '@fortawesome/free-solid-svg-icons'
import {
  faFaceSmile as farFaceSmile,
  faPenToSquare as farPenToSquare,
  faTrashCan as farTrashCan,
  faBell as farBell
} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { sync } from 'vuex-router-sync'
// import shortkey from 'vue-shortkey'
import { createI18n } from 'vue3-i18next'
import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'
import VueVirtualScroller from '@h3poteto/vue-virtual-scroller'
import '@h3poteto/vue-virtual-scroller/dist/vue-virtual-scroller.css'

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
  faMagnifyingGlass,
  faHashtag,
  faListUl,
  faCircleXmark,
  faCamera,
  faUnlock,
  faLock,
  faEyeSlash,
  faEye,
  faPlus,
  farFaceSmile,
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
  farPenToSquare,
  faRotate,
  faSliders,
  faXmark,
  faUserXmark,
  faHourglass,
  faUserPlus,
  faCheck,
  faQuoteRight,
  faThumbTack,
  farTrashCan,
  farBell,
  faChevronLeft,
  faEllipsisVertical,
  faCircleUser,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faLink
)

const i18n = createI18n(i18next)

const app = createApp(App)
app.use(store)
app.use(router)
app.use(ElementPlus)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(VueVirtualScroller)
app.use(VueResize)
app.use(i18n)
// Vue.use(shortkey)

sync(store, router)

app.mount('#app')
