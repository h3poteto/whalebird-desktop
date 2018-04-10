// import Mastodon from 'mastodon-api'
// import { ipcRenderer } from 'electron'
// import fs from 'fs'

const Toot = {
  namespaced: true,
  state: {
    modalOpen: false
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    }
  },
  actions: {
    openToot ({ commit }, message) {
      commit('changeModal', true)
    },
    changeModal ({ commit }, value) {
      commit('changeModal', value)
    }
  }
}

export default Toot

// class AuthenticationError {}
// class UnknownTypeError {}
