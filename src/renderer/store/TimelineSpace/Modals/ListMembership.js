import Mastodon from 'megalodon'
import _ from 'lodash'

const ListMembership = {
  namespaced: true,
  state: {
    modalOpen: false,
    account: null,
    lists: [],
    belongToLists: []
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    changeAccount (state, account) {
      state.account = account
    },
    changeBelongToLists (state, lists) {
      state.belongToLists = lists
    },
    changeLists (state, lists) {
      state.lists = lists
    }
  },
  actions: {
    changeModal ({ commit }, value) {
      commit('changeModal', value)
    },
    setAccount ({ commit }, account) {
      commit('changeAccount', account)
    },
    fetchListMembership ({ commit, rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get(`/accounts/${account.id}/lists`)
        .then(data => {
          commit('changeBelongToLists', data.map(l => l.id))
          return data
        })
    },
    fetchLists ({ commit, rootState }) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/lists')
        .then(data => {
          commit('changeLists', data)
          return data
        })
    },
    async changeBelongToLists ({ rootState, commit, state }, belongToLists) {
      // Calcurate diff
      const removedLists = _.difference(state.belongToLists, belongToLists)
      const addedLists = _.difference(belongToLists, state.belongToLists)
      commit('changeBelongToLists', belongToLists)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      const removedPromise = removedLists.map(id => {
        return client.del(`/lists/${id}/accounts`, {
          account_ids: [state.account.id]
        })
      })
      const addedPromise = addedLists.map(id => {
        return client.post(`/lists/${id}/accounts`, {
          account_ids: [state.account.id]
        })
      })
      const res = await Promise.all(removedPromise.concat(addedPromise))
      return res
    }
  }
}

export default ListMembership
