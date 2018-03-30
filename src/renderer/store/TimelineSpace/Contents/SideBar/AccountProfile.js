import Mastodon from 'mastodon-api'

const AccountProfile = {
  namespaced: true,
  state: {
    account: null,
    relationship: null
  },
  mutations: {
    changeAccount (state, account) {
      state.account = account
    },
    changeRelationship (state, relationship) {
      state.relationship = relationship
    }
  },
  actions: {
    changeAccount ({ commit, dispatch }, account) {
      dispatch('fetchRelationship', account)
      commit('changeAccount', account)
    },
    fetchRelationship ({ state, commit, rootState }, account) {
      return new Promise((resolve, reject) => {
        commit('changeRelationship', null)
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          })
        client.get('/accounts/relationships', { id: [account.id] }, (err, data, res) => {
          if (err) return reject(err)
          commit('changeRelationship', data[0])
          resolve(res)
        })
      })
    }
  }
}

export default AccountProfile
