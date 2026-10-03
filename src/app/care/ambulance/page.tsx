import { redirect } from 'next/navigation'

export default function CareAmbulancePage() {
  redirect('/search?q=ambulance')
}
