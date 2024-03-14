import emojify from '@/utils/emojify'
import { Entity, MegalodonInterface } from 'megalodon'
import { MouseEventHandler, useEffect, useState } from 'react'
import { FaEllipsisVertical } from 'react-icons/fa6'
import { FormattedMessage, useIntl } from 'react-intl'
import Timeline from './profile/Timeline'
import Followings from './profile/Followings'
import Followers from './profile/Followers'
import { findLink } from '@/utils/statusParser'
import { Account } from '@/db'
import {
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  Popover,
  PopoverContent,
  PopoverHandler,
  Tab,
  TabPanel,
  Tabs,
  TabsBody,
  TabsHeader
} from '@material-tailwind/react'
import { domainFromAcct } from '@/utils/domain'
import { invoke } from '@/utils/invoke'

type Props = {
  client: MegalodonInterface
  account: Account
  user_id: string
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function Profile(props: Props) {
  const [user, setUser] = useState<Entity.Account | null>(null)
  const [relationship, setRelationship] = useState<Entity.Relationship | null>(null)
  const [popoverDetail, setPopoverDetail] = useState(false)
  const [domain, setDomain] = useState<string | null>(null)
  const { formatMessage } = useIntl()

  useEffect(() => {
    const f = async () => {
      if (props.user_id) {
        const res = await props.client.getAccount(props.user_id)
        setUser(res.data)
        setDomain(domainFromAcct(res.data.acct))
        await refresh()
      }
    }
    f()
  }, [props.user_id, props.client])

  const refresh = async () => {
    const rel = await props.client.getRelationship(props.user_id)
    setRelationship(rel.data)
  }

  const follow = async (id: string) => {
    const rel = await props.client.followAccount(id)
    setRelationship(rel.data)
  }

  const unfollow = async (id: string) => {
    const rel = await props.client.unfollowAccount(id)
    setRelationship(rel.data)
  }

  const openOriginal = async (url: string) => {
    invoke('open-browser', url)
  }

  const block = async () => {
    if (user) {
      await props.client.blockAccount(user.id)
      await refresh()
    }
  }

  const unblock = async () => {
    if (user) {
      await props.client.unblockAccount(user.id)
      await refresh()
    }
  }

  const mute = async () => {
    if (user) {
      await props.client.muteAccount(user.id, false)
      await refresh()
    }
  }

  const unmute = async () => {
    if (user) {
      await props.client.unmuteAccount(user.id)
      await refresh()
    }
  }

  const blockDomain = async () => {
    if (user && domain) {
      await props.client.blockDomain(domain)
      await refresh()
    }
  }

  const unblockDomain = async () => {
    if (user && domain) {
      await props.client.unblockDomain(domain)
      await refresh()
    }
  }

  const profileClicked: MouseEventHandler<HTMLDivElement> = async e => {
    const url = findLink(e.target as HTMLElement, 'profile')
    if (url) {
      invoke('open-browser', url)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div style={{ height: 'calc(100% - 50px)' }} className="overflow-y-auto timeline-scrollable">
      {user && relationship && (
        <>
          <div className="header-image w-full bg-gray-100">
            <img
              src={user.header}
              className="w-full object-cover h-40"
              alt={formatMessage({ id: 'profile.header' }, { user: user.username })}
            />
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between" style={{ marginTop: '-50px' }}>
              <Avatar
                src={user.avatar}
                size="xl"
                variant="rounded"
                alt={formatMessage({ id: 'profile.avatar' }, { user: user.username })}
              />
              <div className="flex gap-2">
                {relationship.following ? (
                  <Button color="red" onClick={() => unfollow(user.id)}>
                    <FormattedMessage id="profile.unfollow" />
                  </Button>
                ) : (
                  <Button color="blue" onClick={() => follow(user.id)}>
                    <FormattedMessage id="profile.follow" />
                  </Button>
                )}
                <Popover open={popoverDetail} handler={setPopoverDetail}>
                  <PopoverHandler>
                    <IconButton variant="outlined" color="teal" title={formatMessage({ id: 'profile.detail' })}>
                      <FaEllipsisVertical />
                    </IconButton>
                  </PopoverHandler>
                  <PopoverContent>
                    <List>
                      <ListItem
                        onClick={() => {
                          openOriginal(user.url)
                          setPopoverDetail(false)
                        }}
                      >
                        <FormattedMessage id="profile.open_original" />
                      </ListItem>
                      {relationship.blocking ? (
                        <ListItem
                          onClick={() => {
                            unblock()
                            setPopoverDetail(false)
                          }}
                        >
                          <FormattedMessage id="profile.unblock" />
                        </ListItem>
                      ) : (
                        <ListItem
                          onClick={() => {
                            block()
                            setPopoverDetail(false)
                          }}
                        >
                          <FormattedMessage id="profile.block" />
                        </ListItem>
                      )}
                      {relationship.muting ? (
                        <ListItem
                          onClick={() => {
                            unmute()
                            setPopoverDetail(false)
                          }}
                        >
                          <FormattedMessage id="profile.unmute" />
                        </ListItem>
                      ) : (
                        <ListItem
                          onClick={() => {
                            mute()
                            setPopoverDetail(false)
                          }}
                        >
                          <FormattedMessage id="profile.mute" />
                        </ListItem>
                      )}
                      {relationship.domain_blocking ? (
                        <ListItem
                          onClick={() => {
                            blockDomain()
                            setPopoverDetail(false)
                          }}
                        >
                          <FormattedMessage id="profile.unblock_domain" values={{ server: domain }} />
                        </ListItem>
                      ) : (
                        <ListItem
                          onClick={() => {
                            unblockDomain()
                            setPopoverDetail(false)
                          }}
                        >
                          <FormattedMessage id="profile.block_domain" values={{ server: domain }} />
                        </ListItem>
                      )}
                    </List>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="pt-4">
              <div
                className="font-bold text-gray-950 dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: emojify(user.display_name, user.emojis) }}
              />
              <div className="text-gray-600 dark:text-gray-500">@{user.acct}</div>
              <div className="mt-4 raw-html profile" onClick={profileClicked}>
                <span
                  dangerouslySetInnerHTML={{ __html: emojify(user.note, user.emojis) }}
                  className="overflow-hidden break-all text-gray-800 dark:text-gray-400"
                />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 overflow-hidden break-all raw-html mt-2 profile" onClick={profileClicked}>
                {user.fields.map((data, index) => (
                  <dl key={index} className="px-4 py-2 border-gray-200 dark:border-gray-600 border-b">
                    <dt className="text-gray-500 dark:text-gray-500">{data.name}</dt>
                    <dd
                      className="text-gray-700 dark:text-gray-400"
                      dangerouslySetInnerHTML={{ __html: emojify(data.value, user.emojis) }}
                    />
                  </dl>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Tabs value="timeline">
              <TabsHeader>
                <Tab value="timeline">
                  <FormattedMessage id="profile.timeline" />
                </Tab>
                <Tab value="followings">
                  <FormattedMessage id="profile.followings" />
                </Tab>
                <Tab value="followers">
                  <FormattedMessage id="profile.followers" />
                </Tab>
              </TabsHeader>
              <TabsBody>
                <TabPanel value="timeline">
                  <Timeline client={props.client} account={props.account} user_id={props.user_id} openMedia={props.openMedia} />
                </TabPanel>
                <TabPanel value="followings">
                  <Followings client={props.client} user_id={props.user_id} />
                </TabPanel>
                <TabPanel value="followers">
                  <Followers client={props.client} user_id={props.user_id} />
                </TabPanel>
              </TabsBody>
            </Tabs>
          </div>
        </>
      )}
    </div>
  )
}
