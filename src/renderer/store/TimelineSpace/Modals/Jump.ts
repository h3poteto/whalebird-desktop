import router from '@/router'
import i18n from '~/src/config/i18n'
import { Module, MutationTree, ActionTree } from 'vuex'
import { List } from 'megalodon'
import Hashtag from '~/src/types/hashtag'

export interface Channel {
  name: string,
  path: string
}

export interface JumpState {
  modalOpen: boolean,
  channel: string,
  defaultChannelList: Array<Channel>,
  listChannelList: Array<Channel>,
  tagChannelList: Array<Channel>,
  selectedChannel: Channel
}

const state = (): JumpState => ({
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
      name: i18n.t('side_menu.mention'),
      path: 'mentions'
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
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  UPDATE_CHANNEL: 'updateChannel',
  CHANGE_SELECTED: 'changeSelected',
  UPDATE_LIST_CHANNEL: 'updateListChannel',
  UPDATE_TAG_CHANNEL: 'updateTagChannel'
}

const mutations: MutationTree<JumpState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.UPDATE_CHANNEL]: (state, channel: string) => {
    state.channel = channel
  },
  [MUTATION_TYPES.CHANGE_SELECTED]: (state, channel: Channel) => {
    state.selectedChannel = channel
  },
  [MUTATION_TYPES.UPDATE_LIST_CHANNEL]: (state, lists: Array<List>) => {
    state.listChannelList = lists.map((l) => {
      const channel: Channel = {
        name: `#${l.title}`,
        path: `lists/${l.id}`
      }
      return channel
    })
  },
  [MUTATION_TYPES.UPDATE_TAG_CHANNEL]: (state, tags: Array<Hashtag>) => {
    state.tagChannelList = tags.map(t => {
      const channel: Channel = {
        name: `#${t.tagName}`,
        path: `hashtag/${t.tagName}`
      }
      return channel
    })
  }
}

// TODO: use type of rootState
const actions: ActionTree<JumpState, any> = {
  jumpCurrentSelected: ({ state, commit, rootState }) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, false)
    router.push({ path: `/${rootState.TimelineSpace.account._id}/${state.selectedChannel.path}` })
  },
  jump: ({ commit, rootState }, channel: Channel) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, false)
    router.push({ path: `/${rootState.TimelineSpace.account._id}/${channel.path}` })
  },
  syncListChannel: ({ commit, rootState }) => {
    commit(MUTATION_TYPES.UPDATE_LIST_CHANNEL, rootState.TimelineSpace.SideMenu.lists)
  },
  syncTagChannel: ({ commit, rootState }) => {
    commit(MUTATION_TYPES.UPDATE_TAG_CHANNEL, rootState.TimelineSpace.SideMenu.tags)
  }
}

const Jump: Module<JumpState, any> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Jump
