import Mastodon from 'megalodon'

const HeaderMenu = {
  namespaced: true,
  state: {
    title: 'Home'
  },
  mutations: {
    updateTitle (state, title) {
      state.title = title
    }
  },
  actions: {
    fetchList ({ state, commit, rootState }, listID) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/lists/${listID}`)
        .then(data => {
          commit('updateTitle', `#${data.title}`)
          return data
        })
    }
  }
}

export default HeaderMenu
