import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'

import GlobalHeader from './GlobalHeader'
import Login from './Login'
import Authorize from './Authorize'
import TimelineSpace from './TimelineSpace'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: process.env.NODE_ENV !== 'production'
    ? [createLogger()]
    : [],
  modules: {
    GlobalHeader,
    Login,
    Authorize,
    TimelineSpace
  }
})
