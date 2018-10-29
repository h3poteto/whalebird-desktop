import Mastodon from 'megalodon'
import Visibility from '~/src/constants/visibility'

export default {
  namespaced: true,
  state: {
    visibility: Visibility.Public.value
  },
  mutations: {
    changeVisibility (state, value) {
      state.visibility = value
    }
  },
  actions: {
    fetchVisibility ({ state, commit, rootState }) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      return client.get('/accounts/verify_credentials')
        .then(res => {
          const visibility = Object.values(Visibility).find((v) => {
            return v.key === res.data.source.privacy
          })
          commit('changeVisibility', visibility.value)
          return res.data
        })
    },
    setVisibility ({ state, commit, rootState }, value) {
      const client = new Mastodon(
        rootState.TimelineSpace.account.accessToken,
        rootState.TimelineSpace.account.baseURL + '/api/v1'
      )
      const visibility = Object.values(Visibility).find((v) => {
        return v.value === value
      })
      return client.patch('/accounts/update_credentials', {
        source: {
          privacy: visibility.key
        }
      })
        .then(res => {
          commit('changeVisibility', visibility.value)
          return res.data
        })
    }
  }
}
