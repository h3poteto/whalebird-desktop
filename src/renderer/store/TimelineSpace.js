import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'
import SideMenu from './TimelineSpace/SideMenu'

const TimelineSpace = {
  namespaced: true,
  modules: {
    SideMenu
  },
  state: {
    account: {
      domain: '',
      id: ''
    },
    username: ''
  },
  mutations: {
    updateAccount (state, account) {
      state.account = account
    },
    updateUsername (state, username) {
      state.username = username
    }
  },
  actions: {
    fetchAccount ({ commit }, id) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-local-account', id)
        ipcRenderer.once('error-get-local-account', (event, err) => {
          // TODO: handle error
          console.log(err)
          reject(err)
        })
        ipcRenderer.once('response-get-local-account', (event, account) => {
          commit('updateAccount', account)
          resolve(account)
        })
      })
    },
    username ({ commit }, account) {
      return new Promise((resolve, reject) => {
        const client = new Mastodon(
          {
            access_token: account.accessToken,
            api_url: account.baseURL + '/api/v1'

          })
        client.get('/accounts/verify_credentials', {})
          .then((res) => {
            commit('updateUsername', res.data.username)
            resolve(res)
          })
      })
    }
  }
}

export default TimelineSpace
