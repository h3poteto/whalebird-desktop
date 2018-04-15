import router from '../../../router'

const Jump = {
  namespaced: true,
  state: {
    modalOpen: false,
    channel: '',
    defaultChannelList: [
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
        name: 'Local timeline',
        path: 'local'
      },
      {
        name: 'Public timeline',
        path: 'public'
      }
    ],
    listChannelList: [],
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
    },
    updateListChannel (state, list) {
      state.listChannelList = list.map((l) => {
        return {
          name: `#${l.title}`,
          path: `lists/${l.id}`
        }
      })
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
    },
    syncListChannel ({ state, commit, rootState }) {
      commit('updateListChannel', rootState.TimelineSpace.SideMenu.lists)
    }
  }
}

export default Jump
