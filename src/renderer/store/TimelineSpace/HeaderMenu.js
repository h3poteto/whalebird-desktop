import Mastodon from 'megalodon'

const HeaderMenu = {
  namespaced: true,
  state: {
    title: 'Home',
    reload: false
  },
  mutations: {
    updateTitle (state, title) {
      state.title = title
    },
    changeReload (state, value) {
      state.reload = value
    }
  },
  actions: {
    fetchList ({ state, commit, rootState }, listID) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/lists/${listID}`)
        .then(res => {
          commit('updateTitle', `#${res.data.title}`)
          return res.data
        })
    }
  }
}

export default HeaderMenu
