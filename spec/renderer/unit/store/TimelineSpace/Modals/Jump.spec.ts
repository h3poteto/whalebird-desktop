import i18n from '~/src/config/i18n'
import Jump from '@/store/TimelineSpace/Modals/Jump'

describe('TimelineSpace/Modals/Jump', () => {
  describe('mutations', () => {
    let state
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
        const channelList = [
          {
            id: '0',
            title: 'admin'
          },
          {
            id: '1',
            title: 'engineer'
          },
          {
            id: '2',
            title: 'designer'
          }
        ]
        Jump.mutations.updateListChannel(state, channelList)
        expect(state.listChannelList).toEqual([
          {
            path: 'lists/0',
            name: '#admin'
          },
          {
            path: 'lists/1',
            name: '#engineer'
          },
          {
            path: 'lists/2',
            name: '#designer'
          }
        ])
      })
    })

    describe('updateTagChannel', () => {
      it('should be updated', () => {
        const channelList = [
          {
            tagName: 'whalebird'
          },
          {
            tagName: 'tqrk'
          }
        ]
        Jump.mutations.updateTagChannel(state, channelList)
        expect(state.tagChannelList).toEqual([
          {
            name: '#whalebird',
            path: 'hashtag/whalebird'
          },
          {
            name: '#tqrk',
            path: 'hashtag/tqrk'
          }
        ])
      })
    })
  })
})
