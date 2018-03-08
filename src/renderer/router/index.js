import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/login',
      name: 'login',
      component: require('@/components/Login').default
    },
    {
      path: '/authorize',
      name: 'authorize',
      component: require('@/components/Authorize').default
    },
    {
      path: '/timelinespace',
      name: 'timeline-space',
      component: require('@/components/TimelineSpace').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
