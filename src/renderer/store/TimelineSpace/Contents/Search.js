import Account from './Search/Account'
import Tag from './Search/Tag'

const Search = {
  namespaced: true,
  modules: { Account, Tag },
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
