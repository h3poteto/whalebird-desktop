import router from '../../router'

const JumpModal = {
  namespaced: true,
  state: {
    modalOpen: false,
    channel: '',
    channelList: [
      {
        name: 'Home',
        path: 'home'
      },
      {
        name: 'Notification',
        path: 'notifications'
      },
      {
        name: 'Favourite',
        path: 'favourites'
      },
      {
        name: 'LocalTimeline',
        path: 'local'
      },
      {
        name: 'PublicTimeline',
        path: 'public'
      }
    ],
    selectedChannel: {
      name: 'Home',
      path: 'home'
    }
  },
  mutations: {
    changeModal (state, value) {
      state.modalOpen = value
    },
    updateChannel (state, value) {
      state.channel = value
    },
    changeSelected (state, value) {
      state.selectedChannel = value
    }
  },
  actions: {
    jumpCurrentSelected ({ state, commit, rootState }) {
      commit('changeModal', false)
      router.push({ path: `/${rootState.TimelineSpace.account._id}/${state.selectedChannel.path}` })
    },
    jump ({ state, commit, rootState }, channel) {
      commit('changeModal', false)
      router.push({ path: `/${rootState.TimelineSpace.account._id}/${channel.path}` })
    }
  }
}

export default JumpModal
