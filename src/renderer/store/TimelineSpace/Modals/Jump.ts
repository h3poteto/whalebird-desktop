import router from '@/router'
import i18n from '~/src/config/i18n'
import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'

export type Channel = {
  name: string
  path: string
}

export type JumpState = {
  modalOpen: boolean
  channel: string
  defaultChannelList: Array<Channel>
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
  selectedChannel: {
    name: i18n.t('side_menu.home'),
    path: 'home'
  }
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  UPDATE_CHANNEL: 'updateChannel',
  CHANGE_SELECTED: 'changeSelected'
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
  }
}

export const ACTION_TYPES = {
  JUMP_CURRENT_SELECTED: 'jumpCurrentSelected',
  JUMP: 'jump'
}

const actions: ActionTree<JumpState, RootState> = {
  [ACTION_TYPES.JUMP_CURRENT_SELECTED]: ({ state, commit, rootState }) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, false)
    router.push({ path: `/${rootState.TimelineSpace.account!.id}/${state.selectedChannel.path}` })
  },
  [ACTION_TYPES.JUMP]: ({ commit, rootState }, channel: Channel) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, false)
    router.push({ path: `/${rootState.TimelineSpace.account!.id}/${channel.path}` })
  }
}

const Jump: Module<JumpState, RootState> = {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
}

export default Jump
