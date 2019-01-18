import AccountProfile from './SideBar/AccountProfile'
import TootDetail from './SideBar/TootDetail'

const SideBar = {
  namespaced: true,
  modules: {
    AccountProfile,
    TootDetail
  },
  state: {
    openSideBar: false,
    // 0: blank
    // 1: account-profile
    // 2: toot-detail
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
    close ({ dispatch, commit }) {
      dispatch('TimelineSpace/Contents/SideBar/AccountProfile/close', {}, { root: true })
      commit('changeOpenSideBar', false)
      commit('changeComponent', 0)
    },
    openAccountComponent ({ commit }) {
      commit('changeComponent', 1)
    },
    openTootComponent ({ commit }) {
      commit('changeComponent', 2)
    }
  }
}

export default SideBar
