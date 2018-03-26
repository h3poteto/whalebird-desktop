const SideMenu = {
  namespaced: true,
  state: {
    unreadHomeTimeline: false,
    unreadNotifications: false
  },
  mutations: {
    changeUnreadHomeTimeline (state, value) {
      state.unreadHomeTimeline = value
    },
    changeUnreadNotifications (state, value) {
      state.unreadNotifications = value
    }
  },
  actions: {}
}

export default SideMenu
