import emojify from '@/utils/emojify'
import { Avatar, Button, CustomFlowbiteTheme, Dropdown, Flowbite, Tabs } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import { MouseEventHandler, useEffect, useState } from 'react'
import { FaEllipsisVertical } from 'react-icons/fa6'
import { FormattedMessage, useIntl } from 'react-intl'
import Timeline from './profile/Timeline'
import Followings from './profile/Followings'
import Followers from './profile/Followers'
import { findLink } from '@/utils/statusParser'
import { Account } from '@/db'

type Props = {
  client: MegalodonInterface
  account: Account
  user_id: string
  openMedia: (media: Entity.Attachment) => void
}

const customTheme: CustomFlowbiteTheme = {
  tabs: {
    tablist: {
      tabitem: {
        base: 'flex items-center justify-center p-4 rounded-t-lg text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500'
      }
    }
  }
}

export default function Profile(props: Props) {
  const [user, setUser] = useState<Entity.Account | null>(null)
  const [relationship, setRelationship] = useState<Entity.Relationship | null>(null)
  const { formatMessage } = useIntl()

  useEffect(() => {
    const f = async () => {
      if (props.user_id) {
        const res = await props.client.getAccount(props.user_id)
        setUser(res.data)
        const rel = await props.client.getRelationship(props.user_id)
        setRelationship(rel.data)
      }
    }
    f()
  }, [props.user_id, props.client])

  const follow = async (id: string) => {
    const rel = await props.client.followAccount(id)
    setRelationship(rel.data)
  }

  const unfollow = async (id: string) => {
    const rel = await props.client.unfollowAccount(id)
    setRelationship(rel.data)
  }

  const openOriginal = async (url: string) => {
    global.ipc.invoke('open-browser', url)
  }

  const profileClicked: MouseEventHandler<HTMLDivElement> = async e => {
    const url = findLink(e.target as HTMLElement, 'profile')
    if (url) {
      global.ipc.invoke('open-browser', url)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  return (
    <div style={{ height: 'calc(100% - 50px)' }} className="overflow-y-auto timeline-scrollable">
      <Flowbite theme={{ theme: customTheme }}>
        {user && relationship && (
          <>
            <div className="header-image w-full bg-gray-100">
              <img src={user.header} alt="header image" className="w-full object-cover h-40" />
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between" style={{ marginTop: '-50px' }}>
                <Avatar img={user.avatar} size="lg" stacked />
                <div className="flex gap-2">
                  {relationship.following ? (
                    <Button color="failure" onClick={() => unfollow(user.id)}>
                      <FormattedMessage id="profile.unfollow" />
                    </Button>
                  ) : (
                    <Button color="blue" onClick={() => follow(user.id)}>
                      <FormattedMessage id="profile.follow" />
                    </Button>
                  )}
                  <Dropdown
                    label=""
                    renderTrigger={() => (
                      <Button color="gray">
                        <FaEllipsisVertical />
                      </Button>
                    )}
                  >
                    <Dropdown.Item onClick={() => openOriginal(user.url)}>
                      <FormattedMessage id="profile.open_original" />
                    </Dropdown.Item>
                  </Dropdown>
                </div>
              </div>
              <div className="pt-4">
                <div className="font-bold" dangerouslySetInnerHTML={{ __html: emojify(user.display_name, user.emojis) }} />
                <div className="text-gray-500">@{user.acct}</div>
                <div className="mt-4 raw-html profile" onClick={profileClicked}>
                  <span
                    dangerouslySetInnerHTML={{ __html: emojify(user.note, user.emojis) }}
                    className="overflow-hidden break-all text-gray-800"
                  />
                </div>
                <div className="bg-gray-100 overflow-hidden break-all raw-html mt-2 profile" onClick={profileClicked}>
                  {user.fields.map((data, index) => (
                    <dl key={index} className="px-4 py-2 border-gray-200 border-b">
                      <dt className="text-gray-500">{data.name}</dt>
                      <dd className="text-gray-700" dangerouslySetInnerHTML={{ __html: emojify(data.value, user.emojis) }} />
                    </dl>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Tabs aria-label="Tabs with icons" style="underline">
                <Tabs.Item active title={formatMessage({ id: 'profile.timeline' })}>
                  <Timeline client={props.client} account={props.account} user_id={props.user_id} openMedia={props.openMedia} />
                </Tabs.Item>
                <Tabs.Item title={formatMessage({ id: 'profile.followings' })}>
                  <Followings client={props.client} user_id={props.user_id} />
                </Tabs.Item>
                <Tabs.Item title={formatMessage({ id: 'profile.followers' })} className="focus:ring-0">
                  <Followers client={props.client} user_id={props.user_id} />
                </Tabs.Item>
              </Tabs>
            </div>
          </>
        )}
      </Flowbite>
    </div>
  )
}
