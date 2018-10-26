import General from './Preferences/General'
import Account from './Preferences/Account'
import Language from './Preferences/Language'
import Notification from './Preferences/Notification'
import Appearance from './Preferences/Appearance'

const Preferences = {
  namespaced: true,
  modules: {
    General,
    Account,
    Language,
    Notification,
    Appearance
  },
  state: {},
  mutations: {}
}

export default Preferences
