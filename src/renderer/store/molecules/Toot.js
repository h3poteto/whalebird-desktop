import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'

const Toot = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    reblog ({ rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/reblog`)
        .then(res => {
          // API returns new status when reblog.
          // Reblog target status is in the data.reblog.
          // So I send data.reblog as status for update local timeline.
          ipcRenderer.send('fav-rt-action-sound')
          return res.data.reblog
        })
    },
    unreblog ({ rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/unreblog`)
        .then(res => {
          return res.data
        })
    },
    addFavourite ({ rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/favourite`)
        .then(res => {
          ipcRenderer.send('fav-rt-action-sound')
          return res.data
        })
    },
    removeFavourite ({ rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/unfavourite`)
        .then(res => {
          return res.data
        })
    },
    deleteToot ({ rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.del(`/statuses/${message.id}`)
        .then(() => {
          return message
        })
    },
    block ({ rootState }, account) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/accounts/${account.id}/block`)
    }
  }
}

export default Toot
