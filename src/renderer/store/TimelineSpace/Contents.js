import SideBar from './Contents/SideBar'
import Home from './Contents/Home'
import Notifications from './Contents/Notifications'
import Favourites from './Contents/Favourites'
import Local from './Contents/Local'
import Public from './Contents/Public'
import Search from './Contents/Search'
import Lists from './Contents/Lists'
import Hashtag from './Contents/Hashtag'
import DirectMessages from './Contents/DirectMessages'
import Mentions from './Contents/Mentions'

const Contents = {
  namespaced: true,
  modules: {
    SideBar,
    Home,
    Notifications,
    Favourites,
    Local,
    DirectMessages,
    Mentions,
    Public,
    Search,
    Lists,
    Hashtag
  }
}

export default Contents
