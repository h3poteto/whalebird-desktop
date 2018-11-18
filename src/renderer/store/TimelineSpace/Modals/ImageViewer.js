const ImageViewer = {
  namespaced: true,
  state: {
    modalOpen: false,
    currentIndex: -1,
    mediaList: [],
    loading: false
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
    },
    loading (state, value) {
      state.loading = value
    }
  },
  actions: {
    openModal ({ commit }, { currentIndex, mediaList }) {
      commit('changeModal', true)
      commit('changeCurrentIndex', currentIndex)
      commit('changeMedliaList', mediaList)
      commit('loading', true)
    },
    closeModal ({ commit }) {
      commit('changeModal', false)
      commit('changeCurrentIndex', -1)
      commit('changeMedliaList', [])
      commit('loading', false)
    },
    incrementIndex ({ commit }) {
      commit('incrementIndex')
      commit('loading', true)
    },
    decrementIndex ({ commit }) {
      commit('decrementIndex')
      commit('loading', true)
    },
    async loaded ({ commit }) {
      commit('loading', false)
    }
  },
  getters: {
    imageURL (state) {
      if (state.currentIndex >= 0) {
        return state.mediaList[state.currentIndex].url
      }
    },
    imageType (state) {
      if (state.currentIndex >= 0) {
        return state.mediaList[state.currentIndex].type
      }
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
    },
    loading (state) {
      return state.loading
    }
  }
}

export default ImageViewer
