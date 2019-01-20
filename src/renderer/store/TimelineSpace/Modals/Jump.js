import router from '@/router'
import i18n from '~/src/config/i18n'

const Jump = {
  namespaced: true,
  state: {
    modalOpen: false,
    channel: '',
    defaultChannelList: [
      {
        name: i18n.t('side_menu.home'),
        path: 'home'
      },
      {
        name: i18n.t('side_menu.notification'),
        path: 'notifications'
      },
      {
        name: i18n.t('side_menu.favourite'),
        path: 'favourites'
      },
      {
        name: i18n.t('side_menu.local'),
        path: 'local'
      },
      {
        name: i18n.t('side_menu.public'),
        path: 'public'
      },
      {
        name: i18n.t('side_menu.hashtag'),
        path: 'hashtag'
      },
      {
        name: i18n.t('side_menu.search'),
        path: 'search'
      },
      {
        name: i18n.t('side_menu.direct'),
        path: 'direct-messages'
      }
    ],
    listChannelList: [],
    tagChannelList: [],
    selectedChannel: {
      name: i18n.t('side_menu.home'),
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
    },
    updateTagChannel (state, tags) {
      state.tagChannelList = tags.map(t => {
        return {
          name: `#${t.tagName}`,
          path: `hashtag/${t.tagName}`
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
    },
    syncTagChannel ({ commit, rootState }) {
      commit('updateTagChannel', rootState.TimelineSpace.SideMenu.tags)
    }
  }
}

export default Jump
