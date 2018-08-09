import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'
import Visibility from '../../../../constants/visibility'
import Status from './NewToot/Status'

const NewToot = {
  namespaced: true,
  modules: {
    Status
  },
  state: {
    modalOpen: false,
    status: '',
    replyToMessage: null,
    blockSubmit: false,
    attachedMedias: [],
    visibility: Visibility.Public.value,
    sensitive: false,
    spoiler: '',
    attachedMediaId: 0
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
    /**
     * changeVisibility
     * Update visibility using Visibility constants
     * @param state vuex state object
     * @param visibility Visibility constants object
     **/
    changeVisibility (state, visibility) {
      state.visibility = visibility.value
    },
    /**
     * changeVisibilityValue
     * Update visibility using direct value
     * @param state vuex state object
     * @param value visibility value
     **/
    changeVisibilityValue (state, value) {
      state.visibility = value
    },
    changeSensitive (state, value) {
      state.sensitive = value
    },
    updateSpoiler (state, value) {
      state.spoiler = value
    },
    updateMediaId (state, value) {
      state.attachedMediaId = value
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
        .then(res => {
          ipcRenderer.send('toot-action-sound')
          return res.data
        })
    },
    openReply ({ dispatch, commit, rootState }, message) {
      commit('setReplyTo', message)
      const mentionAccounts = [message.account.acct].concat(message.mentions.map(a => a.acct))
        .filter((a, i, self) => self.indexOf(a) === i)
        .filter((a) => a !== rootState.TimelineSpace.account.username)
      commit('changeModal', true)
      commit('updateStatus', `${mentionAccounts.map(m => `@${m}`).join(' ')} `)
      dispatch('changeVisibility', message.visibility)
    },
    openModal ({ dispatch, commit }) {
      commit('changeModal', true)
      ipcRenderer.send('get-preferences')
      ipcRenderer.once('response-get-preferences', (event, conf) => {
        commit('changeVisibilityValue', conf.general.tootVisibility)
      })
    },
    closeModal ({ commit }) {
      commit('changeModal', false)
      commit('updateStatus', '')
      commit('setReplyTo', null)
      commit('changeBlockSubmit', false)
      commit('clearAttachedMedias')
      commit('changeSensitive', false)
      commit('updateSpoiler', '')
      commit('changeVisibility', Visibility.Public)
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
        .then(res => {
          commit('changeBlockSubmit', false)
          if (res.data.type === 'unknown') throw new UnknownTypeError()
          commit('appendAttachedMedias', res.data)
          return res.data
        })
        .catch(err => {
          commit('changeBlockSubmit', false)
          console.error(err)
          throw err
        })
    },
    incrementMediaId ({ commit, state }) {
      commit('updateMediaId', state.attachedMediaId + 1)
    },
    resetMediaId ({ commit }) {
      commit('updateMediaId', 0)
    },
    /**
     * changeVisibility
     * @param commit vuex commit object
     * @param level visibility level string object
     **/
    changeVisibility ({ commit }, level) {
      Object.keys(Visibility).map((key, index) => {
        if (Visibility[key].name === level) {
          commit('changeVisibility', Visibility[key])
        }
      })
    }
  }
}

export default NewToot

class AuthenticationError {}
class UnknownTypeError {}
