import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'

const Toot = {
  namespaced: true,
  state: {},
  mutations: {},
  actions: {
    reblog ({ state, commit, rootState }, message) {
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
    unreblog ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/unreblog`)
    },
    addFavourite ({ state, commit, rootState }, message) {
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
    removeFavourite ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post(`/statuses/${message.id}/unfavourite`)
    },
    deleteToot ({ state, commit, rootState }, message) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.del(`/statuses/${message.id}`)
        .then(() => {
          return message
        })
    }
  }
}

export default Toot
