import Mastodon, { Account, Relationship, Response, Status, Context } from 'megalodon'
import Timeline, { TimelineState } from './AccountProfile/Timeline'
import Follows, { FollowsState } from './AccountProfile/Follows'
import Followers, { FollowersState } from './AccountProfile/Followers'
import { Module, MutationTree, ActionTree, GetterTree } from 'vuex'
import { RootState } from '@/store'

type ParsedAccount = {
  username: string
  acct: string
  url: string
}

type SearchAccount = {
  parsedAccount: ParsedAccount
  status: Status
}

export type AccountProfileState = {
  account: Account | null
  relationship: Relationship | null
  loading: boolean
}

type AccountProfileModule = {
  Followers: FollowersState
  Follows: FollowsState
  Timeline: TimelineState
}

export type AccountProfileModuleState = AccountProfileModule & AccountProfileState

const state = (): AccountProfileState => ({
  account: null,
  relationship: null,
  loading: false
})

export const MUTATION_TYPES = {
  CHANGE_ACCOUNT: 'changeAccount',
  CHANGE_RELATIONSHIP: 'changeRelationship',
  CHANGE_LOADING: 'changeLoading'
}

const mutations: MutationTree<AccountProfileState> = {
  [MUTATION_TYPES.CHANGE_ACCOUNT]: (state, account: Account | null) => {
    state.account = account
  },
  [MUTATION_TYPES.CHANGE_RELATIONSHIP]: (state, relationship: Relationship | null) => {
    state.relationship = relationship
  },
  [MUTATION_TYPES.CHANGE_LOADING]: (state, value: boolean) => {
    state.loading = value
  }
}

const actions: ActionTree<AccountProfileState, RootState> = {
  fetchAccount: async ({ rootState }, accountID: string): Promise<Account> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Account> = await client.get<Account>(`/accounts/${accountID}`)
    return res.data
  },
  searchAccount: async ({ rootState }, searchAccount: SearchAccount): Promise<Account> => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )

    // Find account in toot
    if (searchAccount.status.in_reply_to_account_id) {
      const res: Response<Account> = await client.get<Account>(`/accounts/${searchAccount.status.in_reply_to_account_id}`)
      if (res.status === 200) {
        const user = accountMatch([res.data], searchAccount.parsedAccount, rootState.TimelineSpace.account.domain)
        if (user) return user
      }
    }

    // Find account in context
    if (searchAccount.status.in_reply_to_id) {
      const res: Response<Context> = await client.get<Context>(`/statuses/${searchAccount.status.id}/context`)
      if (res.status === 200) {
        const accounts: Array<Account> = res.data.ancestors.map(s => s.account).concat(res.data.descendants.map(s => s.account))
        const user = accountMatch(accounts, searchAccount.parsedAccount, rootState.TimelineSpace.account.domain)
        if (user) return user
      }
    }

    // Search account name
    const res: Response<Array<Account>> = await client.get<Array<Account>>('/accounts/search', {
      q: searchAccount.parsedAccount.url,
      resolve: true
    })
    if (res.data.length <= 0) throw new AccountNotFound('empty result')
    const user = accountMatch(res.data, searchAccount.parsedAccount, rootState.TimelineSpace.account.domain)
    if (!user) throw new AccountNotFound('not found')
    return user
  },
  changeAccount: ({ commit, dispatch }, account: Account) => {
    dispatch('fetchRelationship', account)
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, account)
  },
  fetchRelationship: async ({ commit, rootState }, account: Account): Promise<Relationship> => {
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, null)
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Relationship> = await client.get<Relationship>('/accounts/relationships', { id: [account.id] })
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, res.data[0])
    return res.data
  },
  reload: async ({ dispatch, state, commit }) => {
    commit(MUTATION_TYPES.CHANGE_LOADING, true)
    Promise.all([
      dispatch('fetchRelationship', state.account),
      dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Timeline/fetchTimeline', state.account, { root: true }),
      dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchFollowers', state.account, { root: true }),
      dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchFollows', state.account, { root: true })
    ]).finally(() => {
      commit(MUTATION_TYPES.CHANGE_LOADING, false)
    })
  },
  follow: async ({ commit, rootState, dispatch }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Relationship> = await client.post<Relationship>(`/accounts/${account.id}/follow`)
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, res.data)
    dispatch('fetchRelationship', account)
    return res.data
  },
  unfollow: async ({ commit, rootState, dispatch }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Relationship> = await client.post<Relationship>(`/accounts/${account.id}/unfollow`)
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, res.data)
    dispatch('fetchRelationship', account)
    return res.data
  },
  close: ({ commit }) => {
    commit(MUTATION_TYPES.CHANGE_ACCOUNT, null)
  },
  unmute: async ({ rootState, commit, dispatch }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Relationship> = await client.post<Relationship>(`/accounts/${account.id}/unmute`)
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, res.data)
    dispatch('fetchRelationship', account)
    return res.data
  },
  block: async ({ rootState, commit, dispatch }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Relationship> = await client.post<Relationship>(`/accounts/${account.id}/block`)
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, res.data)
    dispatch('fetchRelationship', account)
    return res.data
  },
  unblock: async ({ rootState, commit, dispatch }, account: Account) => {
    const client = new Mastodon(
      rootState.TimelineSpace.account.accessToken!,
      rootState.TimelineSpace.account.baseURL + '/api/v1',
      rootState.App.userAgent,
      rootState.App.proxyConfiguration
    )
    const res: Response<Relationship> = await client.post<Relationship>(`/accounts/${account.id}/unblock`)
    commit(MUTATION_TYPES.CHANGE_RELATIONSHIP, res.data)
    dispatch('fetchRelationship', account)
    return res.data
  }
}

const getters: GetterTree<AccountProfileState, RootState> = {
  isOwnProfile: (state, _getters, rootState) => {
    if (!state.account) {
      return false
    }
    const own = rootState.TimelineSpace.account
    // For Mastodon
    if (`${own.baseURL}/@${own.username}` === state.account.url) {
      return true
    }
    // For Pleroma
    return `${own.baseURL}/users/${own.username}` === state.account.url
  }
}

const AccountProfile: Module<AccountProfileState, RootState> = {
  namespaced: true,
  modules: {
    Timeline,
    Follows,
    Followers
  },
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}

class AccountNotFound extends Error {}

export default AccountProfile

const accountMatch = (findAccounts: Array<Account>, parsedAccount: ParsedAccount, domain: string): Account | false => {
  const account = findAccounts.find(a => `@${a.acct}` === parsedAccount.acct)
  if (account) return account
  const pleromaUser = findAccounts.find(a => a.acct === parsedAccount.acct)
  if (pleromaUser) return pleromaUser
  const localUser = findAccounts.find(a => `@${a.username}@${domain}` === parsedAccount.acct)
  if (localUser) return localUser
  const user = findAccounts.find(a => a.url === parsedAccount.url)
  if (!user) return false
  return user
}
