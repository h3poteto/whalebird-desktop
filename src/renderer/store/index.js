import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import shortkey from 'vue-shortkey'

import App from './App'
import GlobalHeader from './GlobalHeader'
import Login from './Login'
import Authorize from './Authorize'
import TimelineSpace from './TimelineSpace'
import Preferences from './Preferences'

Vue.use(Vuex)
Vue.use(shortkey)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: process.env.NODE_ENV !== 'production'
    ? [createLogger()]
    : [],
  modules: {
    App,
    GlobalHeader,
    Login,
    Authorize,
    TimelineSpace,
    Preferences
  }
})
