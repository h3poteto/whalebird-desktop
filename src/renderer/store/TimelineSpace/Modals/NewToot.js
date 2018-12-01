import Mastodon from 'megalodon'
import { ipcRenderer } from 'electron'
import Visibility from '~/src/constants/visibility'
import Status from './NewToot/Status'

const NewToot = {
  namespaced: true,
  modules: {
    Status
  },
  state: {
    modalOpen: false,
    initialStatus: '',
    initialSpoiler: '',
    replyToMessage: null,
    blockSubmit: false,
    attachedMedias: [],
    visibility: Visibility.Public.value,
    sensitive: false,
    attachedMediaId: 0,
    pinedHashtag: false,
    hashtags: []
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    setReplyTo (state, message) {
      state.replyToMessage = message
    },
    updateInitialStatus (state, status) {
      state.initialStatus = status
    },
    updateInitialSpoiler (state, cw) {
      state.initialSpoiler = cw
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
     * changeVisibilityValue
     * Update visibility using direct value
     * @param state vuex state object
     * @param value visibility value
     */
    changeVisibilityValue (state, value) {
      state.visibility = value
    },
    changeSensitive (state, value) {
      state.sensitive = value
    },
    updateMediaId (state, value) {
      state.attachedMediaId = value
    },
    changePinedHashtag (state, value) {
      state.pinedHashtag = value
    },
    updateHashtags (state, tags) {
      state.hashtags = tags
    }
  },
  getters: {
    hashtagInserting (state) {
      return !state.replyToMessage && state.pinedHashtag
    }
  },
  actions: {
    async updateMedia ({ state, commit, rootState }, media) {
      if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
        throw new AuthenticationError()
      }
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return Promise.all(
        Object.keys(media).map(async (id, index) => {
          return client.put(`/media/${id}`, { description: media[id] })
        }
        )).catch(err => {
        console.error(err)
        throw err
      })
    },
    async postToot ({ state, commit, rootState }, form) {
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
      commit('updateInitialStatus', `${mentionAccounts.map(m => `@${m}`).join(' ')} `)
      commit('updateInitialSpoiler', message.spoiler_text)
      commit('changeModal', true)
      let value = Visibility.Public.value
      Object.keys(Visibility).map((key, index) => {
        const target = Visibility[key]
        if (target.key === message.visibility) {
          value = target.value
        }
      })
      commit('changeVisibilityValue', value)
    },
    openModal ({ dispatch, commit, state, rootState }) {
      if (!state.replyToMessage && state.pinedHashtag) {
        commit('updateInitialStatus', state.hashtags.map(t => ` #${t.name}`).join())
      }
      commit('changeModal', true)
      dispatch('fetchVisibility')
    },
    closeModal ({ commit }) {
      commit('changeModal', false)
      commit('updateInitialStatus', '')
      commit('updateInitialSpoiler', '')
      commit('setReplyTo', null)
      commit('changeBlockSubmit', false)
      commit('clearAttachedMedias')
      commit('changeSensitive', false)
      commit('changeVisibilityValue', Visibility.Public.value)
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
    updateHashtags ({ commit, state }, tags) {
      if (state.pinedHashtag) {
        commit('updateHashtags', tags)
      }
    },
    fetchVisibility ({ commit, rootState }) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/accounts/verify_credentials')
        .then(res => {
          const visibility = Object.values(Visibility).find((v) => {
            return v.key === res.data.source.privacy
          })
          commit('changeVisibilityValue', visibility.value)
          return res.data
        })
    }
  }
}

export default NewToot

class AuthenticationError {}
class UnknownTypeError {}
