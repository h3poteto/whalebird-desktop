const ImageViewer = {
  namespaced: true,
  state: {
    modalOpen: false,
    currentIndex: 0,
    mediaList: []
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    changeCurrentIndex (state, currentIndex) {
      state.currentIndex = currentIndex
    },
    changeMedliaList (state, mediaList) {
      state.mediaList = mediaList
    },
    incrementIndex (state) {
      state.currentIndex++
    },
    decrementIndex (state) {
      state.currentIndex--
    }
  },
  actions: {
    openModal ({ commit }, { currentIndex, mediaList }) {
      commit('changeModal', true)
      commit('changeCurrentIndex', currentIndex)
      commit('changeMedliaList', mediaList)
    },
    closeModal ({ commit }) {
      commit('changeModal', false)
      commit('changeCurrentIndex', 0)
      commit('changeMedliaList', [])
    },
    incrementIndex ({ commit }) {
      commit('incrementIndex')
    },
    decrementIndex ({ commit }) {
      commit('decrementIndex')
    }
  },
  getters: {
    imageURL (state) {
      return state.mediaList[state.currentIndex]
    },
    isFirst (state) {
      return state.currentIndex === 0 && state.mediaList.length > 1
    },
    isLast (state) {
      return state.currentIndex === (state.mediaList.length - 1) && state.mediaList.length > 1
    }
  }
}

export default ImageViewer
