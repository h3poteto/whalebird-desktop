import Mastodon from 'mastodon-api'

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
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.get(`/lists/${listID}`, {}, (err, data, res) => {
          if (err) return reject(err)
          commit('updateTitle', `#${data.title}`)
          resolve(res)
        })
      })
    }
  }
}

export default HeaderMenu
