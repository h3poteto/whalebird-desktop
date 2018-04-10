// import Mastodon from 'mastodon-api'

const TootDetail = {
  namespaced: true,
  state: {
    message: null,
    loading: false
  },
  mutations: {
    changeToot (state, message) {
      state.message = message
    },
    changeLoading (state, value) {
      state.loading = value
    }
  },
  actions: {
    changeToot ({ commit, dispatch }, message) {
      commit('changeToot', message)
    }
  }
}

export default TootDetail
