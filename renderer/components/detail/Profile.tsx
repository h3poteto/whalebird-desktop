import emojify from '@/utils/emojify'
import { Avatar, Button, Dropdown } from 'flowbite-react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import { FaEllipsisVertical } from 'react-icons/fa6'
import { FormattedMessage } from 'react-intl'

type Props = {
  client: MegalodonInterface
  user_id: string
}

export default function Profile(props: Props) {
  const [user, setUser] = useState<Entity.Account | null>(null)
  const [relationship, setRelationship] = useState<Entity.Relationship | null>(null)

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

  return (
    <div style={{ height: 'calc(100% - 50px)' }} className="overflow-y-auto">
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
                  <Button onClick={() => unfollow(user.id)}>
                    <FormattedMessage id="profile.unfollow" />
                  </Button>
                ) : (
                  <Button onClick={() => follow(user.id)}>
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
              <div className="font-bold">{user.display_name}</div>
              <div className="text-gray-500">@{user.acct}</div>
              <div className="mt-4">
                <span
                  dangerouslySetInnerHTML={{ __html: emojify(user.note, user.emojis) }}
                  className="overflow-hidden break-all text-gray-800"
                />
              </div>
              <div className="bg-gray-100 overflow-hidden break-all raw-html mt-2">
                {user.fields.map((data, index) => (
                  <dl key={index} className="px-4 py-2 border-gray-200 border-b">
                    <dt className="text-gray-500">{data.name}</dt>
                    <dd className="text-gray-700" dangerouslySetInnerHTML={{ __html: emojify(data.value, user.emojis) }} />
                  </dl>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
