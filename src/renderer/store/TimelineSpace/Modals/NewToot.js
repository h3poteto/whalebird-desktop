import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'

const NewToot = {
  namespaced: true,
  state: {
    modalOpen: false,
    status: '',
    replyToMessage: null,
    blockSubmit: false,
    attachedMedias: [],
    visibility: 'public',
    sensitive: false,
    spoiler: ''
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
    },
    changeSensitive (state, value) {
      state.sensitive = value
    },
    updateSpoiler (state, value) {
      state.spoiler = value
    }
  },
  actions: {
    postToot ({ state, commit, rootState }, form) {
      if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
        throw new AuthenticationError()
      }
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.post('/statuses', form)
        .then(data => {
          ipcRenderer.send('toot-action-sound')
          return data
        })
    },
    openReply ({ commit, rootState }, message) {
      commit('setReplyTo', message)
      const mentionAccounts = [message.account.acct].concat(message.mentions.map(a => a.acct))
        .filter((a, i, self) => self.indexOf(a) === i)
        .filter((a) => a !== rootState.TimelineSpace.account.username)
      commit('updateStatus', `${mentionAccounts.map(m => `@${m}`).join(' ')} `)
      commit('changeModal', true)
    },
    changeModal ({ commit }, value) {
      commit('changeModal', value)
      if (!value) {
        commit('updateStatus', '')
        commit('setReplyTo', null)
        commit('changeBlockSubmit', false)
        commit('clearAttachedMedias')
        commit('changeSensitive', false)
        commit('updateSpoiler', '')
      }
    },
    uploadImage ({ state, commit, rootState }, image) {
      commit('changeBlockSubmit', true)
      if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
        throw new AuthenticationError()
      }
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      const formData = new FormData()
      formData.append('file', image)
      return client.post('/media', formData)
        .then(data => {
          commit('changeBlockSubmit', false)
          if (data.type !== 'image') throw new UnknownTypeError()
          commit('appendAttachedMedias', data)
          return data
        })
        .catch(err => {
          commit('changeBlockSubmit', false)
          console.error(err)
          throw err
        })
    }
  }
}

export default NewToot

class AuthenticationError {}
class UnknownTypeError {}
