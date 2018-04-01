import General from './Preferences/General'
import Account from './Preferences/Account'

const Preferences = {
  namespaced: true,
  modules: {
    General,
    Account
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
