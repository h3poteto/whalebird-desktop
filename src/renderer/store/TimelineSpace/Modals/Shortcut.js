export default {
  namespaced: true,
  state: {
    modalOpen: false
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    }
  }
}
