import Mastodon from 'megalodon'

const Status = {
  namespaced: true,
  state: {
    filteredAccounts: [],
    filteredHashtags: []
  },
  mutations: {
    updateFilteredAccounts (state, accounts) {
      state.filteredAccounts = accounts.map((a) => {
        return {
          name: `@${a.acct}`,
          image: null
        }
      })
    },
    clearFilteredAccounts (state) {
      state.filteredAccounts = []
    },
    updateFilteredHashtags (state, tags) {
      state.filteredHashtags = tags.map((t) => {
        return {
          name: `#${t}`,
          image: null
        }
      })
    },
    clearFilteredHashtags (state) {
      state.filteredHashtags = []
    }
  },
  actions: {
    async searchAccount ({ commit, rootState }, word) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      const res = await client.get('/search', { q: word, resolve: false })
      commit('updateFilteredAccounts', res.data.accounts)
      if (res.data.accounts.length === 0) throw new Error('Empty')
      return res.data.accounts
    },
    async searchHashtag ({ commit, rootState }, word) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      const res = await client.get('/search', { q: word })
      commit('updateFilteredHashtags', res.data.hashtags)
      if (res.data.hashtags.length === 0) throw new Error('Empty')
      return res.data.hashtags
    }
  }
}

export default Status
