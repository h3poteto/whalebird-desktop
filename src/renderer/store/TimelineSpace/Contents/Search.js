import Account from './Search/Account'

const Search = {
  namespaced: true,
  modules: { Account },
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
