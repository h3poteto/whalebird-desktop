import { createStore, createLogger, Store, useStore as baseUseStore } from 'vuex'
import { RouteLocationNormalized } from 'vue-router'
import { InjectionKey } from 'vue'

import App, { AppState } from './App'
import GlobalHeader, { GlobalHeaderState } from './GlobalHeader'
import Login, { LoginState } from './Login'
import Authorize, { AuthorizeState } from './Authorize'
import TimelineSpace, { TimelineSpaceModuleState } from './TimelineSpace'
import Preferences, { PreferencesModuleState } from './Preferences'
import Settings, { SettingsModuleState } from './Settings'
import organisms, { OrganismsModuleState } from './organisms'
import { MyWindow } from '~/src/types/global'

const win = window as any as MyWindow

export interface RootState {
  App: AppState
  GlobalHeader: GlobalHeaderState
  Login: LoginState
  Authorize: AuthorizeState
  TimelineSpace: TimelineSpaceModuleState
  Preferences: PreferencesModuleState
  Settings: SettingsModuleState
  molecules: OrganismsModuleState
  route: RouteLocationNormalized
}

export const key: InjectionKey<Store<RootState>> = Symbol('store')

export function useStore() {
  return baseUseStore(key)
}

export default createStore({
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
