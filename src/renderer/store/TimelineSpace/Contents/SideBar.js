
const SideBar = {
  namespaced: true,
  state: {
    openSideBar: false
  },
  mutations: {
    changeOpenSideBar (state, value) {
      state.openSideBar = value
    }
  },
  actions: {
    close ({ commit }) {
      commit('changeOpenSideBar', false)
    }
  }
}

export default SideBar
