import AccountProfile from './SideBar/AccountProfile'

const SideBar = {
  namespaced: true,
  modules: {
    AccountProfile
  },
  state: {
    openSideBar: false,
    // 0: blank
    // 1: account-profile
    component: 0
  },
  mutations: {
    changeOpenSideBar (state, value) {
      state.openSideBar = value
    },
    changeComponent (state, value) {
      state.component = value
    }
  },
  actions: {
    close ({ commit }) {
      commit('changeOpenSideBar', false)
      commit('changeComponent', 0)
    },
    openAccountComponent ({ commit }) {
      commit('changeComponent', 1)
    }
  }
}

export default SideBar
