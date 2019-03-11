import General from '@/store/Preferences/General'

describe('Preferences/General', () => {
  let state
  beforeEach(() => {
    state = {
      general: {
        sound: {
          fav_rb: true,
          toot: true
        }
      },
      loading: false
    }
  })

  describe('mutations', () => {
    it('updateGeneral', () => {
      General.mutations.updateGeneral(state, {
        sound: {
          fav_rb: false,
          toot: false
        }
      })
      expect(state.general.sound.fav_rb).toEqual(false)
      expect(state.general.sound.toot).toEqual(false)
    })
  })
})
