const ImageViewer = {
  namespaced: true,
  state: {
    modalOpen: false,
    imageURL: ''
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    changeImageURL (state, url) {
      state.imageURL = url
    }
  },
  actions: {
    openModal ({ commit }, url) {
      commit('changeModal', true)
      commit('changeImageURL', url)
    },
    closeModal ({ commit }) {
      commit('changeModal', false)
      commit('changeImageURL', '')
    }
  }
}

export default ImageViewer
