import i18n from '~/src/config/i18n'
import Jump, { JumpState, MUTATION_TYPES, Channel } from '@/store/TimelineSpace/Modals/Jump'
import { LocalTag } from '~/src/types/localTag'
import { Entity } from 'megalodon'

describe('TimelineSpace/Modals/Jump', () => {
  describe('mutations', () => {
    let state: JumpState
    beforeEach(() => {
      state = {
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
    })

    describe('updateListChannel', () => {
      it('should be updated', () => {
        const admin: Entity.List = {
          id: '0',
          title: 'admin'
        }
        const engineer: Entity.List = {
          id: '1',
          title: 'engineer'
        }
        const designer: Entity.List = {
          id: '2',
          title: 'designer'
        }
        const channelList = [admin, engineer, designer]
        Jump.mutations![MUTATION_TYPES.UPDATE_LIST_CHANNEL](state, channelList)
        const adminChannel: Channel = {
          path: 'lists/0',
          name: '#admin'
        }
        const engineerChannel: Channel = {
          path: 'lists/1',
          name: '#engineer'
        }
        const designerChannel: Channel = {
          path: 'lists/2',
          name: '#designer'
        }
        expect(state.listChannelList).toEqual([adminChannel, engineerChannel, designerChannel])
      })
    })

    describe('updateTagChannel', () => {
      it('should be updated', () => {
        const whalebird: LocalTag = {
          tagName: 'whalebird'
        }
        const tqrk: LocalTag = {
          tagName: 'tqrk'
        }
        const channelList = [whalebird, tqrk]
        Jump.mutations![MUTATION_TYPES.UPDATE_TAG_CHANNEL](state, channelList)
        const whalebirdChannel: Channel = {
          name: '#whalebird',
          path: 'hashtag/whalebird'
        }
        const tqrkChannel: Channel = {
          name: '#tqrk',
          path: 'hashtag/tqrk'
        }
        expect(state.tagChannelList).toEqual([whalebirdChannel, tqrkChannel])
      })
    })
  })
})
