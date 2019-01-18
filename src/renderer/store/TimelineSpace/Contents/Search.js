import Account from './Search/Account'
import Tag from './Search/Tag'
import Toots from './Search/Toots'

const Search = {
  namespaced: true,
  modules: { Account, Tag, Toots },
  state: {
    loading: false
  },
  mutations: {
    changeLoading (state, loading) {
      state.loading = loading
    }
  },
  actions: {}
}

export default Search
