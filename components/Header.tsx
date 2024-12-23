import SessionInfo from '@/components/SessionInfo'

const Header = () => {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 bg-primer-dark/90 backdrop-blur-sm border-b border-primer-lightest/20 shadow-lg text-primer-lightest">
          <div className="flex flex-row items-center space-x-4">
            <span>{"PLACEHOLDER"}</span>
          </div>

          <div className="flex items-center">
            <SessionInfo />
          </div>
        </div>
      </header>
      {/* Spacer div to prevent content from going under header */}
      <div className="h-16 w-full" />
    </>
  )
}

export default Header 