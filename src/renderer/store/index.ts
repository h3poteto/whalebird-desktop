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
import molecules, { MoleculesModuleState } from './molecules'
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
  molecules: MoleculesModuleState
  route: Route
}

export default new Vuex.Store({
  strict: win.process.env.NODE_ENV !== 'production',
  plugins: win.process.env.NODE_ENV !== 'production' ? [createLogger({})] : [],
  modules: {
    App,
    GlobalHeader,
    Login,
    Authorize,
    TimelineSpace,
    Preferences,
    Settings,
    molecules
  }
})
