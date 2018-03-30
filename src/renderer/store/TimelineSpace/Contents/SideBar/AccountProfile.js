const AccountProfile = {
  namespaced: true,
  state: {
    account: null
  },
  mutations: {
    changeAccount (state, account) {
      state.account = account
    }
  },
  actions: {
    changeAccount ({ commit }, account) {
      commit('changeAccount', account)
    }
  }
}

export default AccountProfile
