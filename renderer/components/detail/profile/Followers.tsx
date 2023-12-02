import { Entity, MegalodonInterface } from 'megalodon'
import { useEffect, useState } from 'react'
import User from './User'

type Props = {
  client: MegalodonInterface
  user_id: string
}

export default function Followers(props: Props) {
  const [users, setUsers] = useState<Array<Entity.Account>>([])

  useEffect(() => {
    if (props.user_id) {
      const f = async () => {
        const res = await props.client.getAccountFollowers(props.user_id)
        setUsers(res.data)
      }
      f()
    }
  }, [props.client, props.user_id])

  return (
    <>
      {users.map((user, index) => (
        <User user={user} key={index} />
      ))}
    </>
  )
}
