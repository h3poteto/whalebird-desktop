import Mastodon from 'mastodon-api'

const NewTootModal = {
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
    postToot ({ state, commit, rootState }, form) {
      return new Promise((resolve, reject) => {
        if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
          return reject(new AuthenticationError())
        }
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post('/statuses', form, (err, data, res) => {
          if (err) return reject(err)
          commit('changeModal', false)
          resolve(res)
        })
      })
    }
  }
}

export default NewTootModal

class AuthenticationError {}
