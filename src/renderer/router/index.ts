import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: require('@/components/Login').default
    },
    {
      path: '/authorize',
      name: 'authorize',
      component: require('@/components/Authorize').default,
      props: route => ({ url: route.query.url })
    },
    {
      path: '/preferences/',
      name: 'preferences',
      component: require('@/components/Preferences').default,
      children: [
        {
          path: 'general',
          name: 'general',
          component: require('@/components/Preferences/General').default
        },
        {
          path: 'appearance',
          name: 'appearance',
          component: require('@/components/Preferences/Appearance').default
        },
        {
          path: 'notification',
          name: 'notification',
          component: require('@/components/Preferences/Notification').default
        },
        {
          path: 'account',
          name: 'account',
          component: require('@/components/Preferences/Account').default
        },
        {
          path: 'language',
          name: 'language',
          component: require('@/components/Preferences/Language').default
        }
      ]
    },
    {
      path: '/',
      name: 'global-header',
      component: require('@/components/GlobalHeader').default,
      children: [
        {
          path: ':id/settings/',
          component: require('@/components/Settings').default,
          children: [
            {
              path: 'general',
              component: require('@/components/Settings/General').default
            },
            {
              path: 'timeline',
              component: require('@/components/Settings/Timeline').default
            }
          ]
        },
        {
          path: ':id/',
          name: 'timeline-space',
          component: require('@/components/TimelineSpace').default,
          children: [
            {
              path: 'home',
              name: 'home',
              component: require('@/components/TimelineSpace/Contents/Home').default
            },
            {
              path: 'notifications',
              name: 'notifications',
              component: require('@/components/TimelineSpace/Contents/Notifications').default
            },
            {
              path: 'mentions',
              name: 'mentions',
              component: require('@/components/TimelineSpace/Contents/Mentions').default
            },
            {
              path: 'follow-requests',
              name: 'follow-requests',
              component: require('@/components/TimelineSpace/Contents/FollowRequests').default
            },
            {
              path: 'favourites',
              name: 'favourites',
              component: require('@/components/TimelineSpace/Contents/Favourites').default
            },
            {
              path: 'local',
              name: 'local',
              component: require('@/components/TimelineSpace/Contents/Local').default
            },
            {
              path: 'public',
              name: 'public',
              component: require('@/components/TimelineSpace/Contents/Public').default
            },
            {
              path: 'hashtag/',
              component: require('@/components/TimelineSpace/Contents/Hashtag').default,
              children: [
                {
                  path: '',
                  name: 'hashtag-list',
                  component: require('@/components/TimelineSpace/Contents/Hashtag/List').default
                },
                {
                  path: ':tag',
                  name: 'tag',
                  component: require('@/components/TimelineSpace/Contents/Hashtag/Tag').default,
                  props: true
                }
              ]
            },
            {
              path: 'search',
              name: 'search',
              component: require('@/components/TimelineSpace/Contents/Search').default
            },
            {
              path: 'direct-messages',
              name: 'direct-messages',
              component: require('@/components/TimelineSpace/Contents/DirectMessages').default
            },
            {
              path: 'lists',
              name: 'lists',
              component: require('@/components/TimelineSpace/Contents/Lists/Index').default
            },
            {
              path: 'lists/:list_id/edit',
              name: 'edit-list',
              component: require('@/components/TimelineSpace/Contents/Lists/Edit').default,
              props: true
            },
            {
              path: 'lists/:list_id',
              name: 'list',
              component: require('@/components/TimelineSpace/Contents/Lists/Show').default,
              props: true
            }
          ]
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

export default router
