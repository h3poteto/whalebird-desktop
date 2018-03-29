const SideBar = {
  namespaced: true,
  state: {
    openSideBar: true
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
