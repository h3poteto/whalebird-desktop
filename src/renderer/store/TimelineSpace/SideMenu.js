import { ipcRenderer } from 'electron'
import Mastodon from 'mastodon-api'

const SideMenu = {
  namespaced: true,
  state: {
    instance: {
      baseURL: '',
      id: ''
    },
    username: ''
  },
  mutations: {
    updateInstance (state, instance) {
      state.instance = instance
    },
    updateUsername (state, body) {
      state.username = body.username
    }
  },
  actions: {
    fetchInstance ({ commit }, id) {
      ipcRenderer.send('get-instance', id)
      ipcRenderer.on('error-get-instance', (event, err) => {
        // TODO: handle error
        console.log(err)
      })
      ipcRenderer.on('response-get-instance', (event, instance) => {
        commit('updateInstance', instance)
      })
    },
    username ({ commit }, id) {
      return new Promise((resolve, reject) => {
        ipcRenderer.send('get-local-account', id)
        ipcRenderer.on('error-get-local-account', (event, err) => {
          reject(err)
        })
        ipcRenderer.on('response-get-local-account', (event, account) => {
          const client = new Mastodon(
            {
              access_token: account.accessToken,
              api_url: account.baseURL + '/api/v1'

            })
          client.get('/accounts/verify_credentials', {})
            .then((res) => {
              commit('updateUsername', res.data)
              resolve(res)
            })
        })
      })
    }
  }
}

export default SideMenu
