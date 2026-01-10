import { auth } from "@/auth"
import SignIn from '@/components/SignIn'
import Image from 'next/image'

// Server Component to fetch session
async function SessionInfo() {
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
      <div
        className="text-sm group relative"
        title={`User ID: ${session.user?.id || 'Not available'}`}
      >
        <span>{session.user?.name}</span>
        <div className="absolute hidden group-hover:block bg-primer-lightest border border-primer-dark p-2 rounded-lg shadow-lg -bottom-12 left-0 whitespace-nowrap">
          ID: {session.user?.id || 'Not available'}
        </div>
      </div>
    </div>
  )
}

export default SessionInfo 