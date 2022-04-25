import { RootState } from '@/store'
import { createStore, Store } from 'vuex'
import ImageViewer, { ImageViewerState } from '~/src/renderer/store/TimelineSpace/Modals/ImageViewer'

const state = (): ImageViewerState => {
  return {
    modalOpen: false,
    currentIndex: -1,
    mediaList: [],
    loading: false
  }
}

const initStore = () => {
  return {
    namespaced: true,
    state: state(),
    actions: ImageViewer.actions,
    mutations: ImageViewer.mutations,
    getters: ImageViewer.getters
  }
}

const modalsStore = () => ({
  namespaced: true,
  modules: {
    ImageViewer: initStore()
  }
})

const timelineStore = () => ({
  namespaced: true,
  modules: {
    Modals: modalsStore()
  }
})

describe('ImageViewer', () => {
  let store: Store<RootState>

  beforeEach(() => {
    store = createStore({
      modules: {
        TimelineSpace: timelineStore()
      }
    })
  })

  // Actions
  describe('openModal', () => {
    it('should be changed', () => {
      store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
        currentIndex: 1,
        mediaList: ['media1', 'media2']
      })
      expect(store.state.TimelineSpace.Modals.ImageViewer.modalOpen).toEqual(true)
      expect(store.state.TimelineSpace.Modals.ImageViewer.currentIndex).toEqual(1)
      expect(store.state.TimelineSpace.Modals.ImageViewer.mediaList).toEqual(['media1', 'media2'])
      expect(store.state.TimelineSpace.Modals.ImageViewer.loading).toEqual(true)
    })
  })

  describe('closeModal', () => {
    beforeEach(() => {
      store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
        currentIndex: 1,
        mediaList: ['media1', 'media2']
      })
    })
    it('should be changed', () => {
      store.dispatch('TimelineSpace/Modals/ImageViewer/closeModal')
      expect(store.state.TimelineSpace.Modals.ImageViewer.modalOpen).toEqual(false)
      expect(store.state.TimelineSpace.Modals.ImageViewer.currentIndex).toEqual(-1)
      expect(store.state.TimelineSpace.Modals.ImageViewer.mediaList).toEqual([])
      expect(store.state.TimelineSpace.Modals.ImageViewer.loading).toEqual(false)
    })
  })

  describe('incrementIndex', () => {
    it('should be changed', () => {
      store.dispatch('TimelineSpace/Modals/ImageViewer/incrementIndex')
      expect(store.state.TimelineSpace.Modals.ImageViewer.currentIndex).toEqual(0)
      expect(store.state.TimelineSpace.Modals.ImageViewer.loading).toEqual(true)
    })
  })

  describe('decrementIndex', () => {
    it('should be changed', () => {
      store.dispatch('TimelineSpace/Modals/ImageViewer/decrementIndex')
      expect(store.state.TimelineSpace.Modals.ImageViewer.currentIndex).toEqual(-2)
      expect(store.state.TimelineSpace.Modals.ImageViewer.loading).toEqual(true)
    })
  })

  // Getters
  describe('imageURL', () => {
    describe('currentIndex exists', () => {
      beforeEach(() => {
        store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
          currentIndex: 0,
          mediaList: [
            {
              url: 'http://joinmastodon.org'
            },
            {
              url: 'https://docs-develop.pleroma.social'
            }
          ]
        })
      })
      it('should return url', () => {
        const url = store.getters['TimelineSpace/Modals/ImageViewer/imageURL']
        expect(url).toEqual('http://joinmastodon.org')
      })
    })
  })

  describe('imageType', () => {
    describe('currentIndex exists', () => {
      beforeEach(() => {
        store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
          currentIndex: 0,
          mediaList: [
            {
              type: 'image/png'
            },
            {
              type: 'image/jpg'
            }
          ]
        })
      })
      it('should return type', () => {
        const type = store.getters['TimelineSpace/Modals/ImageViewer/imageType']
        expect(type).toEqual('image/png')
      })
    })
  })

  describe('showLeft', () => {
    describe('currentIndex > 0', () => {
      describe('mediaList > 1', () => {
        beforeEach(() => {
          store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
            currentIndex: 1,
            mediaList: [
              {
                type: 'image/png'
              },
              {
                type: 'image/jpg'
              }
            ]
          })
        })
        it('should return true', () => {
          const left = store.getters['TimelineSpace/Modals/ImageViewer/showLeft']
          expect(left).toEqual(true)
        })
      })
      describe('mediaList < 1', () => {
        beforeEach(() => {
          store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
            currentIndex: 0,
            mediaList: [
              {
                type: 'image/png'
              }
            ]
          })
        })
        it('should not return true', () => {
          const left = store.getters['TimelineSpace/Modals/ImageViewer/showLeft']
          expect(left).toEqual(false)
        })
      })
    })
  })

  describe('showRight', () => {
    describe('current index is lower than media list length', () => {
      describe('media list length > 1', () => {
        beforeEach(() => {
          store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
            currentIndex: 0,
            mediaList: [
              {
                type: 'image/png'
              },
              {
                type: 'image/jpeg'
              }
            ]
          })
        })
        it('should return true', () => {
          const right = store.getters['TimelineSpace/Modals/ImageViewer/showRight']
          expect(right).toEqual(true)
        })
      })
      describe('media list length <= 1', () => {
        beforeEach(() => {
          store.dispatch('TimelineSpace/Modals/ImageViewer/openModal', {
            currentIndex: 0,
            mediaList: [
              {
                type: 'image/png'
              }
            ]
          })
        })
        it('should not return true', () => {
          const right = store.getters['TimelineSpace/Modals/ImageViewer/showRight']
          expect(right).toEqual(false)
        })
      })
    })
  })
})
