import Mastodon, { Status, Attachment, Tag, Response, Account } from 'megalodon'
import Visibility, { VisibilityType } from '~/src/constants/visibility'
import TootStatus, { StatusState } from './NewToot/Status'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'
import AxiosLoading from '@/utils/axiosLoading'
import {
  NewTootModalOpen,
  NewTootBlockSubmit,
  NewTootTootLength,
  NewTootAttachLength,
  NewTootMediaDescription,
  NewTootPollInvalid,
  NewTootUnknownType,
  AuthenticationError
} from '@/errors/validations'
import { MyWindow } from '~/src/types/global'

const win = window as MyWindow

type MediaDescription = {
  id: string
  description: string
}

type TootForm = {
  status: string
  spoiler: string
  polls: Array<string>
  pollExpireSeconds: number
}

export type NewTootState = {
  modalOpen: boolean
  initialStatus: string
  initialSpoiler: string
  replyToMessage: Status | null
  blockSubmit: boolean
  attachedMedias: Array<Attachment>
  mediaDescriptions: { [key: string]: string | null }
  visibility: number
  sensitive: boolean
  attachedMediaCount: number
  pinedHashtag: boolean
  hashtags: Array<Tag>
  loading: boolean
}

type NewTootModule = {
  Status: StatusState
}

export type NewTootModuleState = NewTootModule & NewTootState

const state = (): NewTootState => ({
  modalOpen: false,
  initialStatus: '',
  initialSpoiler: '',
  replyToMessage: null,
  blockSubmit: false,
  attachedMedias: [],
  mediaDescriptions: {},
  visibility: Visibility.Public.value,
  sensitive: false,
  attachedMediaCount: 0,
  pinedHashtag: false,
  hashtags: [],
  loading: false
})

export const MUTATION_TYPES = {
  CHANGE_MODAL: 'changeModal',
  SET_REPLY_TO: 'setReplyTo',
  UPDATE_INITIAL_STATUS: 'updateInitialStatus',
  UPDATE_INITIAL_SPOILER: 'updateInitialSpoiler',
  CHANGE_BLOCK_SUBMIT: 'changeBlockSubmit',
  APPEND_ATTACHED_MEDIAS: 'appendAttachedMedias',
  CLEAR_ATTACHED_MEDIAS: 'clearAttachedMedias',
  REMOVE_MEDIA: 'removeMedia',
  UPDATE_MEDIA_DESCRIPTION: 'updateMediaDescription',
  CLEAR_MEDIA_DESCRIPTIONS: 'clearMediaDescriptions',
  REMOVE_MEDIA_DESCRIPTION: 'removeMediaDescription',
  CHANGE_VISIBILITY_VALUE: 'changeVisibilityValue',
  CHANGE_SENSITIVE: 'changeSensitive',
  UPDATE_MEDIA_COUNT: 'updateMediaCount',
  CHANGE_PINED_HASHTAG: 'changePinedHashtag',
  UPDATE_HASHTAGS: 'updateHashtags',
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<NewTootState> = {
  [MUTATION_TYPES.CHANGE_MODAL]: (state, value: boolean) => {
    state.modalOpen = value
  },
  [MUTATION_TYPES.SET_REPLY_TO]: (state, message: Status) => {
    state.replyToMessage = message
  },
  [MUTATION_TYPES.UPDATE_INITIAL_STATUS]: (state, status: string) => {
    state.initialStatus = status
  },
  [MUTATION_TYPES.UPDATE_INITIAL_SPOILER]: (state, cw: string) => {
    state.initialSpoiler = cw
  },
  [MUTATION_TYPES.CHANGE_BLOCK_SUBMIT]: (state, value: boolean) => {
    state.blockSubmit = value
  },
  [MUTATION_TYPES.APPEND_ATTACHED_MEDIAS]: (state, media: Attachment) => {
    state.attachedMedias = state.attachedMedias.concat([media])
  },
  [MUTATION_TYPES.CLEAR_ATTACHED_MEDIAS]: state => {
    state.attachedMedias = []
  },
  [MUTATION_TYPES.REMOVE_MEDIA]: (state, media: Attachment) => {
    state.attachedMedias = state.attachedMedias.filter(m => m.id !== media.id)
  },
  [MUTATION_TYPES.UPDATE_MEDIA_DESCRIPTION]: (state, value: MediaDescription) => {
    state.mediaDescriptions[value.id] = value.description
  },
  [MUTATION_TYPES.CLEAR_MEDIA_DESCRIPTIONS]: state => {
    state.mediaDescriptions = {}
  },
  [MUTATION_TYPES.REMOVE_MEDIA_DESCRIPTION]: (state, id: string) => {
    const descriptions = state.mediaDescriptions
    delete descriptions[id]
    state.mediaDescriptions = descriptions
  },
  /**
   * changeVisibilityValue
   * Update visibility using direct value
   * @param state vuex state object
   * @param value visibility value
   */
  [MUTATION_TYPES.CHANGE_VISIBILITY_VALUE]: (state, value: number) => {
    state.visibility = value
  },
  [MUTATION_TYPES.CHANGE_SENSITIVE]: (state, value: boolean) => {
    state.sensitive = value
  },
  [MUTATION_TYPES.UPDATE_MEDIA_COUNT]: (state, count: number) => {
    state.attachedMediaCount = count
  },
  [MUTATION_TYPES.CHANGE_PINED_HASHTAG]: (state, value: boolean) => {
    state.pinedHashtag = value
  },
  [MUTATION_TYPES.UPDATE_HASHTAGS]: (state, tags: Array<Tag>) => {
    state.hashtags = tags
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  }
}

const actions: ActionTree<NewTootState, RootState> = {
  setupLoading: ({ dispatch }) => {
    const axiosLoading = new AxiosLoading()
    axiosLoading.on('start', (_: number) => {
      dispatch('startLoading')
    })
    axiosLoading.on('done', () => {
      dispatch('stopLoading')
    })
  },
  startLoading: ({ commit, state }) => {
    if (state.modalOpen && !state.loading) {
      commit(MUTATION_TYPES.CHANGE_LOADING, true)
    }
  },
  stopLoading: ({ commit, state }) => {
    if (state.modalOpen && state.loading) {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    }
  },
  updateMedia: async ({ rootState }, mediaDescription: MediaDescription) => {
    if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
      throw new AuthenticationError()
    }
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const attachments = Object.keys(mediaDescription).map(async id => {
      if (mediaDescription[id] !== null) {
        return client.put<Attachment>(`/media/${id}`, { description: mediaDescription[id] })
      } else {
        return Promise.resolve({})
      }
    })
    return Promise.all(attachments).catch(err => {
      console.error(err)
      throw err
    })
  },
  postToot: async ({ state, commit, rootState, dispatch }, params: TootForm): Promise<Status> => {
    if (!state.modalOpen) {
      throw new NewTootModalOpen()
    }

    if (params.status.length < 1 || params.status.length > rootState.TimelineSpace.tootMax) {
      throw new NewTootTootLength()
    }

    const visibilityKey: string | undefined = Object.keys(Visibility).find(key => {
      return Visibility[key].value === state.visibility
    })
    let specifiedVisibility: string = Visibility.Public.key
    if (visibilityKey !== undefined) {
      specifiedVisibility = Visibility[visibilityKey].key
    }

    let form = {
      status: params.status,
      visibility: specifiedVisibility,
      sensitive: state.sensitive,
      spoiler_text: params.spoiler
    }

    if (state.replyToMessage !== null) {
      form = Object.assign(form, {
        in_reply_to_id: state.replyToMessage.id
      })
    }

    if (params.polls.length > 1) {
      params.polls.map(poll => {
        if (poll.length < 1) {
          throw new NewTootPollInvalid()
        }
      })
      form = Object.assign(form, {
        poll: {
          expires_in: params.pollExpireSeconds,
          multiple: false,
          options: params.polls
        }
      })
    }

    if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
      throw new AuthenticationError()
    }
    if (state.blockSubmit) {
      throw new NewTootBlockSubmit()
    }

    if (state.attachedMedias.length > 0) {
      if (state.attachedMedias.length > 4) {
        throw new NewTootAttachLength()
      }
      form = Object.assign(form, {
        media_ids: state.attachedMedias.map(m => {
          return m.id
        })
      })
      // Update media descriptions
      await dispatch('updateMedia', state.mediaDescriptions).catch(_ => {
        throw new NewTootMediaDescription()
      })
    }

    commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, true)
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    return client
      .post<Status>('/statuses', form)
      .then((res: Response<Status>) => {
        win.ipcRenderer.send('toot-action-sound')
        return res.data
      })
      .finally(() => {
        commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
      })
  },
  openReply: ({ commit, rootState }, message: Status) => {
    commit(MUTATION_TYPES.SET_REPLY_TO, message)
    const mentionAccounts = [message.account.acct]
      .concat(message.mentions.map(a => a.acct))
      .filter((a, i, self) => self.indexOf(a) === i)
      .filter(a => a !== rootState.TimelineSpace.account.username)
    commit(MUTATION_TYPES.UPDATE_INITIAL_STATUS, `${mentionAccounts.map(m => `@${m}`).join(' ')} `)
    commit(MUTATION_TYPES.UPDATE_INITIAL_SPOILER, message.spoiler_text)
    commit(MUTATION_TYPES.CHANGE_MODAL, true)
    let value: number = Visibility.Public.value
    Object.keys(Visibility).map(key => {
      const target = Visibility[key]
      if (target.key === message.visibility) {
        value = target.value
      }
    })
    commit(MUTATION_TYPES.CHANGE_VISIBILITY_VALUE, value)
  },
  openModal: ({ dispatch, commit, state }) => {
    if (!state.replyToMessage && state.pinedHashtag) {
      commit(MUTATION_TYPES.UPDATE_INITIAL_STATUS, state.hashtags.map(t => `#${t.name}`).join(' '))
    }
    commit(MUTATION_TYPES.CHANGE_MODAL, true)
    dispatch('fetchVisibility')
  },
  closeModal: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_MODAL, false)
    commit(MUTATION_TYPES.UPDATE_INITIAL_STATUS, '')
    commit(MUTATION_TYPES.UPDATE_INITIAL_SPOILER, '')
    commit(MUTATION_TYPES.SET_REPLY_TO, null)
    commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
    commit(MUTATION_TYPES.CLEAR_ATTACHED_MEDIAS)
    commit(MUTATION_TYPES.CLEAR_MEDIA_DESCRIPTIONS)
    commit(MUTATION_TYPES.CHANGE_SENSITIVE, false)
    commit(MUTATION_TYPES.CHANGE_VISIBILITY_VALUE, Visibility.Public.value)
  },
  uploadImage: async ({ commit, rootState }, image: any) => {
    commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, true)
    if (rootState.TimelineSpace.account.accessToken === undefined || rootState.TimelineSpace.account.accessToken === null) {
      throw new AuthenticationError()
    }
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const formData = new FormData()
    formData.append('file', image)
    return client
      .post<Attachment>('/media', formData)
      .then(res => {
        commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
        if (res.data.type === 'unknown') throw new NewTootUnknownType()
        commit(MUTATION_TYPES.APPEND_ATTACHED_MEDIAS, res.data)
        return res.data
      })
      .catch(err => {
        commit(MUTATION_TYPES.CHANGE_BLOCK_SUBMIT, false)
        console.error(err)
        throw err
      })
  },
  incrementMediaCount: ({ commit, state }) => {
    commit(MUTATION_TYPES.UPDATE_MEDIA_COUNT, state.attachedMediaCount + 1)
  },
  decrementMediaCount: ({ commit, state }) => {
    commit(MUTATION_TYPES.UPDATE_MEDIA_COUNT, state.attachedMediaCount - 1)
  },
  resetMediaCount: ({ commit }) => {
    commit(MUTATION_TYPES.UPDATE_MEDIA_COUNT, 0)
  },
  removeMedia: ({ commit, dispatch }, media: Attachment) => {
    commit(MUTATION_TYPES.REMOVE_MEDIA, media)
    commit(MUTATION_TYPES.REMOVE_MEDIA_DESCRIPTION, media.id)
    dispatch('decrementMediaCount')
  },
  updateHashtags: ({ commit, state }, tags: Array<Tag>) => {
    if (state.pinedHashtag && tags.length > 0) {
      commit(MUTATION_TYPES.UPDATE_HASHTAGS, tags)
    }
  },
  fetchVisibility: async ({ commit, rootState }) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Account> = await client.get<Account>('/accounts/verify_credentials')
    const visibility: VisibilityType | undefined = (Object.values(Visibility) as Array<VisibilityType>).find(v => {
      return v.key === res.data.source!.privacy
    })
    if (visibility === undefined) {
      throw new Error('Visibility value is invalid')
    }
    commit(MUTATION_TYPES.CHANGE_VISIBILITY_VALUE, visibility.value)
    return res.data
  }
}

const getters: GetterTree<NewTootState, RootState> = {
  hashtagInserting: state => {
    return !state.replyToMessage && state.pinedHashtag
  }
}

const NewToot: Module<NewTootState, RootState> = {
  namespaced: true,
  modules: {
    Status: TootStatus
  },
  state: state,
  mutations: mutations,
  getters: getters,
  actions: actions
}

export default NewToot
