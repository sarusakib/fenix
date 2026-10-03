import { redirect } from 'next/navigation'

export default function CareBloodPage() {
  redirect('/search?q=blood%20donor')
}
