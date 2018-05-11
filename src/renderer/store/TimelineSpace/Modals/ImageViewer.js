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
    showLeft (state) {
      const notFirst = (state.currentIndex > 0)
      const isManyItem = (state.mediaList.length > 1)
      return (notFirst && isManyItem)
    },
    showRight (state) {
      const notLast = (state.currentIndex < (state.mediaList.length - 1))
      const isManyItem = (state.mediaList.length > 1)
      return (notLast && isManyItem)
    }
  }
}

export default ImageViewer
