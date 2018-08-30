import General from './Preferences/General'
import Account from './Preferences/Account'
import Language from './Preferences/Language'
import Notification from './Preferences/Notification'

const Preferences = {
  namespaced: true,
  modules: {
    General,
    Account,
    Language,
    Notification
  },
  state: {
    defaultActive: '1'
  },
  mutations: {
    changeActive (state, value) {
      state.defaultActive = value
    }
  }
}

export default Preferences
