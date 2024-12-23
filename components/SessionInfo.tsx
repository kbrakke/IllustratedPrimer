import { auth } from "@/auth"
import SignIn from '@/components/SignIn'
import Image from 'next/image'

const SessionInfo = async () => {
  const session = await auth()

  if (!session) {
    return (
      <div className="p-2">
        <SignIn />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2 p-2">
      {session.user?.image && (
        <Image
          src={session.user.image}
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      )}
      <span className="text-sm">{session.user?.name}</span>
    </div>
  )
}

export default SessionInfo 