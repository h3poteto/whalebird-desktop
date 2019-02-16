import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import i18n from '~/src/config/i18n'
import router from '@/router'
import Jump from '~/src/renderer/store/TimelineSpace/Modals/Jump'

const state = {
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

const initState = {
  namespaced: true,
  state: state,
  actions: Jump.actions,
  mutations: Jump.mutations
}

const timelineState = {
  namespaced: true,
  state: {
    account: {
      _id: '0'
    }
  }
}

describe('Jump', () => {
  let store
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {
        Jump: initState,
        TimelineSpace: timelineState
      }
    })
  })

  describe('jumpCurrentSelected', () => {
    it('should be changed', () => {
      store.dispatch('Jump/jumpCurrentSelected')
      expect(store.state.Jump.modalOpen).toEqual(false)
      expect(router.push).toHaveBeenCalledWith({ path: '/0/home' })
    })
  })

  describe('jump', () => {
    it('should be changed', () => {
      store.dispatch('Jump/jump', {
        name: 'public',
        path: 'public'
      })
      expect(store.state.Jump.modalOpen).toEqual(false)
      expect(router.push).toHaveBeenCalledWith({ path: '/0/public' })
    })
  })
})
