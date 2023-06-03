import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDown,
  faAngleUp,
  faAngleRight,
  faAngleLeft,
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
import I18NextVue from 'i18next-vue'
import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import './assets/fonts/fonts.css'
import App from './App.vue'
import router from '@/router'
import store, { key } from './store'
import i18next from '~/src/config/i18n'

library.add(
  faAngleDown,
  faAngleUp,
  faAngleRight,
  faAngleLeft,
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

const app = createApp(App)
app.use(store, key)
app.use(router)
app.use(ElementPlus)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(VueVirtualScroller)
app.use(VueResize)
app.use(I18NextVue, { i18next })

app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

sync(store, router)

app.mount('#app')
