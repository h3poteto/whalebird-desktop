import General from './Preferences/General'
import Account from './Preferences/Account'
import Language from './Preferences/Language'
import Notification from './Preferences/Notification'
import Appearance from './Preferences/Appearance'
import { Module } from 'vuex'

export interface PreferencesState {}

const state = (): PreferencesState => ({})

// TODO: use type of rootState
const Preferences: Module<PreferencesState, any> = {
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
