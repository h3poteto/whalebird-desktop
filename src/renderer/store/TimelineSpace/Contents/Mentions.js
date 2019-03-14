import Mastodon from 'megalodon'

const Mentions = {
  namespaced: true,
  state: {
    lazyLoading: false,
    heading: true,
    mentions: [],
    unreadMentions: [],
    filter: ''
  },
  mutations: {
    changeLazyLoading (state, value) {
      state.lazyLoading = value
    },
    changeHeading (state, value) {
      state.heading = value
    },
    appendMentions (state, update) {
      if (state.heading) {
        state.mentions = [update].concat(state.mentions)
      } else {
        state.unreadMentions = [update].concat(state.unreadMentions)
      }
    },
    updateMentions (state, messages) {
      state.mentions = messages
    },
    mergeMentions (state) {
      state.mentions = state.unreadMentions.slice(0, 80).concat(state.mentions)
      state.unreadMentions = []
    },
    insertMentions (state, messages) {
      state.mentions = state.mentions.concat(messages)
    },
    archiveMentions (state) {
      state.mentions = state.mentions.slice(0, 40)
    },
    clearMentions (state) {
      state.mentions = []
      state.unreadMentions = []
    },
    updateToot (state, message) {
      console.log(message)
      state.mentions = state.mentions.map((mention) => {
        if (mention.type === 'mention' && mention.status.id === message.id) {
          const status = {
            status: message
          }
          return Object.assign(mention, status)
        } else {
          return mention
        }
      })
    },
    changeFilter (state, filter) {
      state.filter = filter
    }
  },
  actions: {
    fetchMentions ({ state, commit, rootState }) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/notifications', { limit: 30, exclude_types: ['follow', 'favourite', 'reblog'] })
        .then(res => {
          commit('updateMentions', res.data)
          return res.data
        })
    },
    lazyFetchMentions ({ state, commit, rootState }, last) {
      if (last === undefined || last === null) {
        return Promise.resolve(null)
      }
      if (state.lazyLoading) {
        return Promise.resolve(null)
      }
      commit('changeLazyLoading', true)
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/notifications', { max_id: last.id, limit: 30, exclude_types: ['follow', 'favourite', 'reblog'] })
        .then(res => {
          commit('insertMentions', res.data)
          return res.data
        })
        .finally(() => {
          commit('changeLazyLoading', false)
        })
    }
  },
  getters: {
    mentions (state) {
      return state.mentions.filter(mention => mention.type === 'mention')
    }
  }
}

export default Mentions
