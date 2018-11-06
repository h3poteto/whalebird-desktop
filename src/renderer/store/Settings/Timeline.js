export default {
  namespaced: true,
  state: {
    unread_notification: {
      home: false,
      direct: false,
      favourite: false,
      local: false,
      public: false
    }
  },
  mutations: {
    changeHome (state, value) {
      state.unread_notification.home = value
    },
    changeDirect (state, value) {
      state.unread_notification.direct = value
    },
    changeFavourite (state, value) {
      state.unread_notification.favourite = value
    },
    changeLocal (state, value) {
      state.unread_notification.local = value
    },
    changePublic (state, value) {
      state.unread_notification.public = value
    }
  },
  actions: {}
}
