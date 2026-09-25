import Navbar from '@/components/Navbar'
import FenixMessenger from '@/components/messaging/FenixMessenger'

export default function MessagesPage() {
  return (
    <main className="min-h-dvh overflow-x-clip">
      <Navbar />
      <div className="fenix-chat-wallpaper min-h-[calc(100dvh-72px)]">
        <FenixMessenger fullPage />
      </div>
    </main>
  )
}
