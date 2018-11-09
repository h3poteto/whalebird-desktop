import General from './Settings/General'
import Timeline from './Settings/Timeline'

export default {
  namespaced: true,
  modules: {
    General,
    Timeline
  },
  state: {
    accountID: null
  },
  mutations: {
    changeAccountID (state, id) {
      state.accountID = id
    }
  }
}
