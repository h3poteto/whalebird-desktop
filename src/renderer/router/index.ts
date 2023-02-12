import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/components/Login.vue'
import LoginForm from '@/components/Login/LoginForm.vue'
import Authorize from '@/components/Login/Authorize.vue'
import Preferences from '@/components/Preferences.vue'
import PreferencesGeneral from '@/components/Preferences/General.vue'
import PreferencesAppearance from '@/components/Preferences/Appearance.vue'
import PreferencesNotification from '@/components/Preferences/Notification.vue'
import PreferencesAccount from '@/components/Preferences/Account.vue'
import PreferencesLanguage from '@/components/Preferences/Language.vue'
import PreferencesNetwork from '@/components/Preferences/Network.vue'
import GlobalHeader from '@/components/GlobalHeader.vue'
import Settings from '@/components/Settings.vue'
import SettingsGeneral from '@/components/Settings/General.vue'
import SettingsTimeline from '@/components/Settings/Timeline.vue'
import SettingsFilters from '@/components/Settings/Filters.vue'
import SettingsFiltersEdit from '@/components/Settings/Filters/Edit.vue'
import SettingsFiltersNew from '@/components/Settings/Filters/New.vue'
import TimelineSpace from '@/components/TimelineSpace.vue'
import TimelineSpaceContentsHome from '@/components/TimelineSpace/Contents/Home.vue'
import TimelineSpaceContentsNotifications from '@/components/TimelineSpace/Contents/Notifications.vue'
import TimelineSpaceContentsFavourites from '@/components/TimelineSpace/Contents/Favourites.vue'
import TimelineSpaceContentsLocal from '@/components/TimelineSpace/Contents/Local.vue'
import TimelineSpaceContentsPublic from '@/components/TimelineSpace/Contents/Public.vue'
import TimelineSpaceContentsHashtag from '@/components/TimelineSpace/Contents/Hashtag.vue'
import TimelineSpaceContentsHashtagList from '@/components/TimelineSpace/Contents/Hashtag/List.vue'
import TimelineSpaceContentsHashtagTag from '@/components/TimelineSpace/Contents/Hashtag/Tag.vue'
import TimelineSpaceContentsSearch from '@/components/TimelineSpace/Contents/Search.vue'
import TimelineSpaceContentsDirectMessages from '@/components/TimelineSpace/Contents/DirectMessages.vue'
import TimelineSpaceContentsListsIndex from '@/components/TimelineSpace/Contents/Lists/Index.vue'
import TimelineSpaceContentsListsEdit from '@/components/TimelineSpace/Contents/Lists/Edit.vue'
import TimelineSpaceContentsListsShow from '@/components/TimelineSpace/Contents/Lists/Show.vue'
import TimelineSpaceContentsFollowRequests from '@/components/TimelineSpace/Contents/FollowRequests.vue'
import TimelineSpaceContentsBookmarks from '@/components/TimelineSpace/Contents/Bookmarks.vue'

const routes = [
  {
    path: '/login/',
    name: 'login',
    component: Login,
    children: [
      {
        path: 'form',
        name: 'login-form',
        component: LoginForm
      },
      {
        path: 'authorize',
        name: 'authorize',
        component: Authorize
      }
    ]
  },
  {
    path: '/preferences/',
    name: 'preferences',
    component: Preferences,
    children: [
      {
        path: 'general',
        name: 'general',
        component: PreferencesGeneral
      },
      {
        path: 'appearance',
        name: 'appearance',
        component: PreferencesAppearance
      },
      {
        path: 'notification',
        name: 'notification',
        component: PreferencesNotification
      },
      {
        path: 'account',
        name: 'account',
        component: PreferencesAccount
      },
      {
        path: 'network',
        name: 'network',
        component: PreferencesNetwork
      },
      {
        path: 'language',
        name: 'language',
        component: PreferencesLanguage
      }
    ]
  },
  {
    path: '/',
    name: 'global-header',
    component: GlobalHeader,
    children: [
      {
        path: ':id/settings/',
        component: Settings,
        children: [
          {
            path: 'general',
            component: SettingsGeneral
          },
          {
            path: 'timeline',
            component: SettingsTimeline
          },
          {
            path: 'filters',
            component: SettingsFilters
          },
          {
            path: 'filters/new',
            component: SettingsFiltersNew
          },
          {
            path: 'filters/:filter_id/edit',
            component: SettingsFiltersEdit,
            props: true
          }
        ]
      },
      {
        path: ':id/',
        name: 'timeline-space',
        component: TimelineSpace,
        children: [
          {
            path: 'home',
            name: 'home',
            component: TimelineSpaceContentsHome
          },
          {
            path: 'notifications',
            name: 'notifications',
            component: TimelineSpaceContentsNotifications
          },
          {
            path: 'follow-requests',
            name: 'follow-requests',
            component: TimelineSpaceContentsFollowRequests
          },
          {
            path: 'favourites',
            name: 'favourites',
            component: TimelineSpaceContentsFavourites
          },
          {
            path: 'bookmarks',
            name: 'bookmarks',
            component: TimelineSpaceContentsBookmarks
          },
          {
            path: 'local',
            name: 'local',
            component: TimelineSpaceContentsLocal
          },
          {
            path: 'public',
            name: 'public',
            component: TimelineSpaceContentsPublic
          },
          {
            path: 'hashtag/',
            component: TimelineSpaceContentsHashtag,
            children: [
              {
                path: '',
                name: 'hashtag-list',
                component: TimelineSpaceContentsHashtagList
              },
              {
                path: ':tag',
                name: 'tag',
                component: TimelineSpaceContentsHashtagTag,
                props: true
              }
            ]
          },
          {
            path: 'search',
            name: 'search',
            component: TimelineSpaceContentsSearch
          },
          {
            path: 'direct-messages',
            name: 'direct-messages',
            component: TimelineSpaceContentsDirectMessages
          },
          {
            path: 'lists',
            name: 'lists',
            component: TimelineSpaceContentsListsIndex
          },
          {
            path: 'lists/:list_id/edit',
            name: 'edit-list',
            component: TimelineSpaceContentsListsEdit,
            props: true
          },
          {
            path: 'lists/:list_id',
            name: 'list',
            component: TimelineSpaceContentsListsShow,
            props: true
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router
