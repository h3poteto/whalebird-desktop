import { createStore, Store } from 'vuex'
import i18n from '~/src/config/i18n'
import router from '@/router'
import Jump, { JumpState, Channel } from '~/src/renderer/store/TimelineSpace/Modals/Jump'
import { RootState } from '@/store'

const state = (): JumpState => {
  return {
    modalOpen: true,
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
  }
}
const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: Jump.actions,
    mutations: Jump.mutations
  }
}

const modalsStore = () => ({
  namespaced: true,
  modules: {
    Jump: initStore()
  }
})

const timelineStore = () => ({
  namespaced: true,
  state: {
    account: {
      _id: '0'
    }
  },
  modules: {
    Modals: modalsStore()
  }
})

describe('Jump', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore()
      }
    })
  })

  describe('jumpCurrentSelected', () => {
    it('should be changed', () => {
      store.dispatch('TimelineSpace/Modals/Jump/jumpCurrentSelected')
      expect(store.state.TimelineSpace.Modals.Jump.modalOpen).toEqual(false)
      expect(router.push).toHaveBeenCalledWith({ path: '/0/home' })
    })
  })

  describe('jump', () => {
    it('should be changed', () => {
      const channel: Channel = {
        name: 'public',
        path: 'public'
      }
      store.dispatch('TimelineSpace/Modals/Jump/jump', channel)
      expect(store.state.TimelineSpace.Modals.Jump.modalOpen).toEqual(false)
      expect(router.push).toHaveBeenCalledWith({ path: '/0/public' })
    })
  })
})
