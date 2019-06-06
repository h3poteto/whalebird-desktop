import General, { GeneralState } from './Preferences/General'
import Account, { AccountState } from './Preferences/Account'
import Language, { LanguageState } from './Preferences/Language'
import Appearance, { AppearanceState } from './Preferences/Appearance'
import Notification, { NotificationState } from './Preferences/Notification'
import { Module } from 'vuex'
import { RootState } from '@/store'

export type PreferencesState = {}

const state = (): PreferencesState => ({})

type PreferencesModule = {
  General: GeneralState
  Account: AccountState
  Language: LanguageState
  Notification: NotificationState
  Appearance: AppearanceState
}

export type PreferencesModuleState = PreferencesState & PreferencesModule

const Preferences: Module<PreferencesState, RootState> = {
  namespaced: true,
  modules: {
    General,
    Account,
    Language,
    Notification,
    Appearance
  },
  state: state
}

export default Preferences
