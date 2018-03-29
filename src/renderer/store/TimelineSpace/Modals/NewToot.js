import Mastodon from 'mastodon-api'

const NewToot = {
  namespaced: true,
  state: {
    modalOpen: false,
    status: '',
    replyToMessage: null
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    setReplyTo (state, message) {
      state.replyToMessage = message
    },
    updateStatus (state, status) {
      state.status = status
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
          resolve(res)
        })
      })
    },
    openReply ({ commit }, message) {
      commit('setReplyTo', message)
      commit('updateStatus', `@${message.account.acct} `)
      commit('changeModal', true)
    },
    changeModal ({ commit }, value) {
      if (!value) {
        commit('updateStatus', '')
        commit('setReplyTo', null)
      }
      commit('changeModal', value)
    }
  }
}

export default NewToot

class AuthenticationError {}
