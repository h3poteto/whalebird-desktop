import General, { GeneralState } from './Preferences/General'
import Account, { AccountState } from './Preferences/Account'
import Language, { LanguageState } from './Preferences/Language'
import Appearance, { AppearanceState } from './Preferences/Appearance'
import Notification, { NotificationState } from './Preferences/Notification'
import { Module } from 'vuex'
import { RootState } from '@/store'

export interface PreferencesState {}

const state = (): PreferencesState => ({})

export interface PreferencesModuleState extends PreferencesState {
  General: GeneralState,
  Account: AccountState,
  Language: LanguageState,
  Notification: NotificationState,
  Appearance: AppearanceState
}

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
