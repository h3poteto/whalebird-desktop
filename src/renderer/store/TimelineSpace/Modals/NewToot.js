import Mastodon from 'mastodon-api'
import { ipcRenderer } from 'electron'
import fs from 'fs'

const NewToot = {
  namespaced: true,
  state: {
    modalOpen: false,
    status: '',
    replyToMessage: null,
    blockSubmit: false,
    attachedMedias: [],
    visibility: 'public'
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
    },
    changeBlockSubmit (state, value) {
      state.blockSubmit = value
    },
    appendAttachedMedias (state, media) {
      state.attachedMedias = state.attachedMedias.concat([media])
    },
    clearAttachedMedias (state) {
      state.attachedMedias = []
    },
    removeMedia (state, media) {
      state.attachedMedias = state.attachedMedias.filter(m => m.id !== media.id)
    },
    changeVisibility (state, value) {
      state.visibility = value
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
          ipcRenderer.send('toot-action-sound')
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
      commit('changeModal', value)
      if (!value) {
        commit('updateStatus', '')
        commit('setReplyTo', null)
        commit('changeBlockSubmit', false)
        commit('clearAttachedMedias')
      }
    },
    uploadImage ({ state, commit, rootState }, image) {
      return new Promise((resolve, reject) => {
        commit('changeBlockSubmit', true)
        if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
          return reject(new AuthenticationError())
        }
        const client = new Mastodon(
          {
            access_token: rootState.TimelineSpace.account.accessToken,
            api_url: rootState.TimelineSpace.account.baseURL + '/api/v1'
          }
        )
        client.post('/media', { file: fs.createReadStream(image.path) }, (err, data, res) => {
          commit('changeBlockSubmit', false)
          if (err) return reject(err)
          if (data.type !== 'image') reject(new UnknownTypeError())
          commit('appendAttachedMedias', data)
          resolve(res)
        })
      })
    }
  }
}

export default NewToot

class AuthenticationError {}
class UnknownTypeError {}
