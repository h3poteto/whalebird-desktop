import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import { Route } from 'vue-router'

import App, { AppState } from './App'
import GlobalHeader, { GlobalHeaderState } from './GlobalHeader'
import Login, { LoginState } from './Login'
import Authorize, { AuthorizeState } from './Authorize'
import TimelineSpace, { TimelineSpaceModuleState } from './TimelineSpace'
import Preferences, { PreferencesModuleState } from './Preferences'
import Settings, { SettingsModuleState } from './Settings'
import organisms, { OrganismsModuleState } from './organisms'
import { MyWindow } from '~/src/types/global'

Vue.use(Vuex)

const win = window as MyWindow

export interface RootState {
  App: AppState
  GlobalHeader: GlobalHeaderState
  Login: LoginState
  Authorize: AuthorizeState
  TimelineSpace: TimelineSpaceModuleState
  Preferences: PreferencesModuleState
  Settings: SettingsModuleState
  molecules: OrganismsModuleState
  route: Route
}

export default new Vuex.Store({
  strict: win.node_env !== 'production',
  plugins: win.node_env !== 'production' ? [createLogger({})] : [],
  modules: {
    App,
    GlobalHeader,
    Login,
    Authorize,
    TimelineSpace,
    Preferences,
    Settings,
    organisms
  }
})
