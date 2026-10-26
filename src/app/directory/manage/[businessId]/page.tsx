'use client'

import { FormEvent, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  Plus,
  ShieldCheck,
  Trash,
  Storefront,
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import {
  FenixField,
  FenixFormMessage,
  FenixInput,
  FenixSelect,
  FenixSubmitButton,
  FenixTextarea,
} from '@/components/forms/FenixForm'
import { createClient } from '@/utils/supabase/client'

const CATEGORIES = [
  'Retail',
  'Food & Beverage',
  'Services',
  'Manufacturing',
  'Agriculture',
  'Education',
  'Technology',
  'Healthcare',
  'Transport',
  'Online',
  'Other',
]

const TRUST_LABELS: Record<string, { en: string; bn: string }> = {
  unverified: { en: 'Basic listing', bn: 'সাধারণ তালিকা' },
  owner_claimed: { en: 'Owner claim approved', bn: 'মালিকানা দাবি অনুমোদিত' },
  identity_reviewed: { en: 'Identity reviewed', bn: 'পরিচয় পর্যালোচিত' },
  business_reviewed: { en: 'Business reviewed', bn: 'ব্যবসা পর্যালোচিত' },
  fenix_verified: { en: 'FeniX Verified', bn: 'FeniX যাচাইকৃত' },
}

type BusinessRow = {
  id: string
  owner_id: string | null
  name: string
  title_bn: string | null
  title_en: string | null
  category: string | null
  description: string | null
  updated_at: string
}

type ProfileRow = {
  business_id: string
  slug: string | null
  tagline_bn: string | null
  tagline_en: string | null
  about_bn: string | null
  about_en: string | null
  business_type: string | null
  verification_level: string
  listing_status: string
  owner_claimed: boolean
  phone_verified: boolean
  location_verified: boolean
}

type LocationRow = {
  business_id: string
  district: string
  upazila: string | null
  area: string | null
  market: string | null
  address: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  map_label: string | null
  is_public: boolean
}

type ContactRow = {
  business_id: string
  phone: string | null
  whatsapp: string | null
  website_url: string | null
  facebook_url: string | null
  is_phone_public: boolean
  is_whatsapp_public: boolean
  is_website_public: boolean
}

type AliasRow = {
  id: string
  business_id: string
  alias: string
  language_code: 'bn' | 'en' | 'banglish' | 'local' | string
  created_at: string
}

type Feedback = { kind: 'success' | 'error'; text: string }
type SectionKey = 'basic' | 'profile' | 'location' | 'contacts' | 'aliases'

function cleanText(value: string, max: number) {
  return value.trim().slice(0, max)
}

function normalizePublicUrl(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null
  if (raw.length > 1000 || /[\u0000-\u001f\u007f]/.test(raw)) return null
  const candidate = /^https?:\/\//i.test(raw) ? raw : 'https://' + raw.replace(/^\/+/, '')
  try {
    const url = new URL(candidate)
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

function parseCoordinate(raw: string, minimum: number, maximum: number): number | null | 'invalid' {
  const value = raw.trim()
  if (!value) return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) return 'invalid'
  return parsed
}

function verificationLabel(level: string | null | undefined, bn: boolean) {
  const row = level ? TRUST_LABELS[level] : null
  return row ? (bn ? row.bn : row.en) : (bn ? TRUST_LABELS.unverified.bn : TRUST_LABELS.unverified.en)
}

export default function DirectoryBusinessEditorPage() {
  const params = useParams<{ businessId: string }>()
  const businessId = String(params.businessId ?? '').trim()
  const { locale } = useFenixLocale()
  const bn = locale === 'bn'

  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [business, setBusiness] = useState<BusinessRow | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [locationExists, setLocationExists] = useState(false)
  const [contactsExist, setContactsExist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState<SectionKey | null>(null)
  const [feedback, setFeedback] = useState<Partial<Record<SectionKey, Feedback>>>({})
  const [aliases, setAliases] = useState<AliasRow[]>([])
  const [aliasDraft, setAliasDraft] = useState('')
  const [aliasLanguage, setAliasLanguage] = useState<'bn' | 'en' | 'banglish' | 'local'>('bn')
  const [aliasBusyId, setAliasBusyId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [titleBn, setTitleBn] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  const [slug, setSlug] = useState('')
  const [businessType, setBusinessType] = useState('')
  const [taglineBn, setTaglineBn] = useState('')
  const [taglineEn, setTaglineEn] = useState('')
  const [aboutBn, setAboutBn] = useState('')
  const [aboutEn, setAboutEn] = useState('')

  const [district, setDistrict] = useState('Feni')
  const [upazila, setUpazila] = useState('')
  const [area, setArea] = useState('')
  const [market, setMarket] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [mapLabel, setMapLabel] = useState('')
  const [locationPublic, setLocationPublic] = useState(true)

  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [phonePublic, setPhonePublic] = useState(false)
  const [whatsappPublic, setWhatsappPublic] = useState(false)
  const [websitePublic, setWebsitePublic] = useState(true)

  function setSectionFeedback(section: SectionKey, kind: Feedback['kind'], text: string) {
    setFeedback((current) => ({ ...current, [section]: { kind, text } }))
  }

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setLoadError('')
      setNotFound(false)

      try {
        const supabase = createClient()
        const { data: auth, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!active) return

        setSignedIn(Boolean(auth.user))
        if (!auth.user) return

        if (!businessId) {
          setNotFound(true)
          return
        }

        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id,owner_id,name,title_bn,title_en,category,description,updated_at')
          .eq('id', businessId)
          .eq('owner_id', auth.user.id)
          .maybeSingle()

        if (!active) return
        if (businessError) throw businessError
        if (!businessData) {
          setNotFound(true)
          return
        }

        const [profileResult, locationResult, contactResult, aliasResult] = await Promise.all([
          supabase
            .from('business_directory_profiles')
            .select('business_id,slug,tagline_bn,tagline_en,about_bn,about_en,business_type,verification_level,listing_status,owner_claimed,phone_verified,location_verified')
            .eq('business_id', businessId)
            .maybeSingle(),
          supabase
            .from('business_directory_locations')
            .select('business_id,district,upazila,area,market,address,postal_code,latitude,longitude,map_label,is_public')
            .eq('business_id', businessId)
            .maybeSingle(),
          supabase
            .from('business_directory_contacts')
            .select('business_id,phone,whatsapp,website_url,facebook_url,is_phone_public,is_whatsapp_public,is_website_public')
            .eq('business_id', businessId)
            .maybeSingle(),
          supabase
            .from('business_directory_aliases')
            .select('id,business_id,alias,language_code,created_at')
            .eq('business_id', businessId)
            .order('created_at', { ascending: true })
            .limit(100),
        ])

        if (!active) return
        const firstError = profileResult.error || locationResult.error || contactResult.error || aliasResult.error
        if (firstError) throw firstError

        const loadedProfile = profileResult.data as ProfileRow | null
        const loadedLocation = locationResult.data as LocationRow | null
        const loadedContact = contactResult.data as ContactRow | null

        setBusiness(businessData as BusinessRow)
        setProfile(loadedProfile)
        setLocationExists(Boolean(loadedLocation))
        setContactsExist(Boolean(loadedContact))

        setName(businessData.name ?? '')
        setTitleBn(businessData.title_bn ?? '')
        setTitleEn(businessData.title_en ?? '')
        setCategory(businessData.category ?? '')
        setDescription(businessData.description ?? '')

        setSlug(loadedProfile?.slug ?? '')
        setBusinessType(loadedProfile?.business_type ?? '')
        setTaglineBn(loadedProfile?.tagline_bn ?? '')
        setTaglineEn(loadedProfile?.tagline_en ?? '')
        setAboutBn(loadedProfile?.about_bn ?? '')
        setAboutEn(loadedProfile?.about_en ?? '')

        setDistrict(loadedLocation?.district ?? 'Feni')
        setUpazila(loadedLocation?.upazila ?? '')
        setArea(loadedLocation?.area ?? '')
        setMarket(loadedLocation?.market ?? '')
        setAddress(loadedLocation?.address ?? '')
        setPostalCode(loadedLocation?.postal_code ?? '')
        setLatitude(loadedLocation?.latitude == null ? '' : String(loadedLocation.latitude))
        setLongitude(loadedLocation?.longitude == null ? '' : String(loadedLocation.longitude))
        setMapLabel(loadedLocation?.map_label ?? '')
        setLocationPublic(loadedLocation?.is_public ?? true)

        setPhone(loadedContact?.phone ?? '')
        setWhatsapp(loadedContact?.whatsapp ?? '')
        setWebsiteUrl(loadedContact?.website_url ?? '')
        setFacebookUrl(loadedContact?.facebook_url ?? '')
        setPhonePublic(loadedContact?.is_phone_public ?? false)
        setWhatsappPublic(loadedContact?.is_whatsapp_public ?? false)
        setWebsitePublic(loadedContact?.is_website_public ?? true)
        setAliases((aliasResult.data ?? []) as AliasRow[])
        setOwnerId(auth.user.id)
      } catch {
        if (active) {
          setLoadError('Business details could not be loaded. Check your connection and try again.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [businessId])

  async function saveBasic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!business || !ownerId || saving) return

    const safeName = cleanText(name, 180)
    const safeCategory = cleanText(category, 80)
    if (safeName.length < 2) {
      setSectionFeedback('basic', 'error', bn ? 'ব্যবসার নাম কমপক্ষে ২ অক্ষরের হতে হবে।' : 'Business name must be at least 2 characters.')
      return
    }
    if (!safeCategory) {
      setSectionFeedback('basic', 'error', bn ? 'একটি বিভাগ বেছে নিন।' : 'Choose a business category.')
      return
    }

    setSaving('basic')
    setSectionFeedback('basic', 'success', '')

    try {
      const supabase = createClient()
      const { data, error: saveError } = await supabase
        .from('businesses')
        .update({
          name: safeName,
          title_bn: cleanText(titleBn, 180) || null,
          title_en: cleanText(titleEn, 180) || null,
          category: safeCategory,
          description: cleanText(description, 2000) || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)
        .eq('owner_id', ownerId)
        .select('id,owner_id,name,title_bn,title_en,category,description,updated_at')
        .maybeSingle()

      if (saveError) throw saveError
      if (!data) throw new Error('Business update was not confirmed.')

      setBusiness(data as BusinessRow)
      setName(data.name)
      setTitleBn(data.title_bn ?? '')
      setTitleEn(data.title_en ?? '')
      setCategory(data.category ?? '')
      setDescription(data.description ?? '')
      setSectionFeedback('basic', 'success', bn ? 'ব্যবসার মূল তথ্য সংরক্ষণ হয়েছে।' : 'Business details saved.')
    } catch (error) {
      const duplicate = error instanceof Error && /duplicate key|businesses.*name/i.test(error.message)
      setSectionFeedback(
        'basic',
        'error',
        duplicate
          ? (bn ? 'এই নামে একটি ব্যবসা আগে থেকেই থাকতে পারে। নামটি যাচাই করুন।' : 'A business with this name may already exist. Please check the name.')
          : (bn ? 'তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' : 'Business details could not be saved. Please try again.'),
      )
    } finally {
      setSaving(null)
    }
  }

  async function savePublicProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!business || !ownerId || saving) return

    const nextSlug = cleanText(slug, 120).toLowerCase()
    if (nextSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextSlug)) {
      setSectionFeedback('profile', 'error', bn ? 'স্লাগে শুধু ছোট ইংরেজি অক্ষর, সংখ্যা ও মাঝখানে হাইফেন ব্যবহার করুন।' : 'Use lowercase English letters, numbers and single hyphens in the slug.')
      return
    }

    setSaving('profile')
    setSectionFeedback('profile', 'success', '')

    try {
      const supabase = createClient()
      const publicFields = {
        slug: nextSlug || null,
        business_type: cleanText(businessType, 80) || null,
        tagline_bn: cleanText(taglineBn, 240) || null,
        tagline_en: cleanText(taglineEn, 240) || null,
        about_bn: cleanText(aboutBn, 4000) || null,
        about_en: cleanText(aboutEn, 4000) || null,
      }

      const query = profile
        ? supabase
            .from('business_directory_profiles')
            .update(publicFields)
            .eq('business_id', business.id)
        : supabase
            .from('business_directory_profiles')
            .insert({ business_id: business.id, ...publicFields })

      const { data, error: saveError } = await query
        .select('business_id,slug,tagline_bn,tagline_en,about_bn,about_en,business_type,verification_level,listing_status,owner_claimed,phone_verified,location_verified')
        .maybeSingle()

      if (saveError) {
        if (saveError.code === '23505') throw new Error('DUPLICATE_SLUG')
        throw saveError
      }
      if (!data) throw new Error('Directory profile update was not confirmed.')

      setProfile(data as ProfileRow)
      setSlug(data.slug ?? '')
      setSectionFeedback('profile', 'success', bn ? 'পাবলিক প্রোফাইলের তথ্য সংরক্ষণ হয়েছে।' : 'Public profile details saved.')
    } catch (error) {
      const duplicate = error instanceof Error && (error.message === 'DUPLICATE_SLUG' || error.message.includes('slug'))
      setSectionFeedback(
        'profile',
        'error',
        duplicate
          ? (bn ? 'এই স্লাগটি অন্য ব্যবসা ব্যবহার করছে। অন্য স্লাগ দিন।' : 'That slug is already in use. Choose another one.')
          : (bn ? 'পাবলিক প্রোফাইল সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' : 'Public profile could not be saved. Please try again.'),
      )
    } finally {
      setSaving(null)
    }
  }

  async function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!business || !ownerId || saving) return

    const lat = parseCoordinate(latitude, -90, 90)
    const lon = parseCoordinate(longitude, -180, 180)
    if (lat === 'invalid' || lon === 'invalid' || ((lat === null) !== (lon === null))) {
      setSectionFeedback(
        'location',
        'error',
        bn
          ? 'অক্ষাংশ ও দ্রাঘিমাংশ দুটিই বৈধভাবে দিন, অথবা দুটিই ফাঁকা রাখুন।'
          : 'Enter both valid latitude and longitude, or leave both empty.',
      )
      return
    }

    setSaving('location')
    setSectionFeedback('location', 'success', '')

    try {
      const supabase = createClient()
      const publicLocation = {
        district: cleanText(district, 120) || 'Feni',
        upazila: cleanText(upazila, 120) || null,
        area: cleanText(area, 160) || null,
        market: cleanText(market, 160) || null,
        address: cleanText(address, 500) || null,
        postal_code: cleanText(postalCode, 24) || null,
        latitude: lat,
        longitude: lon,
        map_label: cleanText(mapLabel, 240) || null,
        is_public: locationPublic,
      }
      const query = locationExists
        ? supabase
            .from('business_directory_locations')
            .update(publicLocation)
            .eq('business_id', business.id)
        : supabase
            .from('business_directory_locations')
            .insert({ business_id: business.id, ...publicLocation })
      const { data, error: saveError } = await query.select('business_id').maybeSingle()

      if (saveError) throw saveError
      if (!data) throw new Error('Location update was not confirmed.')
      setLocationExists(true)
      setSectionFeedback('location', 'success', bn ? 'অবস্থান ও মানচিত্রের তথ্য সংরক্ষণ হয়েছে।' : 'Location details saved.')
    } catch {
      setSectionFeedback('location', 'error', bn ? 'অবস্থানের তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' : 'Location details could not be saved. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  async function saveContacts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!business || !ownerId || saving) return

    const rawWebsite = cleanText(websiteUrl, 1000)
    const rawFacebook = cleanText(facebookUrl, 1000)
    const normalizedWebsite = websitePublic && rawWebsite ? normalizePublicUrl(rawWebsite) : null
    const normalizedFacebook = websitePublic && rawFacebook ? normalizePublicUrl(rawFacebook) : null

    if (websitePublic && rawWebsite && !normalizedWebsite) {
      setSectionFeedback('contacts', 'error', bn ? 'ওয়েবসাইটের লিংকটি বৈধ নয়। https:// দিয়ে শুরু করুন।' : 'Website URL is invalid. Use a valid http:// or https:// link.')
      return
    }
    if (websitePublic && rawFacebook && !normalizedFacebook) {
      setSectionFeedback('contacts', 'error', bn ? 'Facebook লিংকটি বৈধ নয়।' : 'Facebook URL is invalid.')
      return
    }

    setSaving('contacts')
    setSectionFeedback('contacts', 'success', '')

    try {
      const supabase = createClient()
      const publicContacts = {
        phone: phonePublic ? cleanText(phone, 60) || null : null,
        whatsapp: whatsappPublic ? cleanText(whatsapp, 60) || null : null,
        website_url: websitePublic ? normalizedWebsite : null,
        facebook_url: websitePublic ? normalizedFacebook : null,
        is_phone_public: phonePublic,
        is_whatsapp_public: whatsappPublic,
        is_website_public: websitePublic,
      }
      const query = contactsExist
        ? supabase
            .from('business_directory_contacts')
            .update(publicContacts)
            .eq('business_id', business.id)
        : supabase
            .from('business_directory_contacts')
            .insert({ business_id: business.id, ...publicContacts })
      const { data, error: saveError } = await query.select('business_id').maybeSingle()

      if (saveError) throw saveError
      if (!data) throw new Error('Contact update was not confirmed.')
      setContactsExist(true)
      if (!phonePublic) setPhone('')
      if (!whatsappPublic) setWhatsapp('')
      if (!websitePublic) {
        setWebsiteUrl('')
        setFacebookUrl('')
      } else {
        setWebsiteUrl(normalizedWebsite ?? '')
        setFacebookUrl(normalizedFacebook ?? '')
      }
      setSectionFeedback('contacts', 'success', bn ? 'যোগাযোগের তথ্য সংরক্ষণ হয়েছে।' : 'Contact details saved.')
    } catch {
      setSectionFeedback('contacts', 'error', bn ? 'যোগাযোগের তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।' : 'Contact details could not be saved. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  async function addAlias(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!business || !ownerId || saving || aliasBusyId) return
    const safeAlias = cleanText(aliasDraft, 120)
    if (safeAlias.length < 2) {
      setSectionFeedback('aliases', 'error', bn ? 'বিকল্প নাম কমপক্ষে ২ অক্ষরের হতে হবে।' : 'An alternate name must be at least 2 characters.')
      return
    }

    setAliasBusyId('add')
    setSectionFeedback('aliases', 'success', '')

    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('business_directory_aliases')
        .insert({
          business_id: business.id,
          alias: safeAlias,
          language_code: aliasLanguage,
        })
        .select('id,business_id,alias,language_code,created_at')
        .single()

      if (insertError) {
        if (insertError.code === '23505') throw new Error('DUPLICATE_ALIAS')
        throw insertError
      }
      setAliases((current) => [...current, data as AliasRow])
      setAliasDraft('')
      setSectionFeedback('aliases', 'success', bn ? 'বিকল্প নাম যোগ হয়েছে।' : 'Alternate name added.')
    } catch (error) {
      const duplicate = error instanceof Error && (error.message === 'DUPLICATE_ALIAS' || error.message.includes('alias'))
      setSectionFeedback(
        'aliases',
        'error',
        duplicate
          ? (bn ? 'এই বিকল্প নামটি আগে থেকেই আছে।' : 'That alternate name already exists.')
          : (bn ? 'বিকল্প নাম যোগ করা যায়নি। আবার চেষ্টা করুন।' : 'Alternate name could not be added. Please try again.'),
      )
    } finally {
      setAliasBusyId(null)
    }
  }

  async function deleteAlias(aliasId: string) {
    if (!business || !ownerId || saving || aliasBusyId) return
    setAliasBusyId(aliasId)
    setSectionFeedback('aliases', 'success', '')

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('business_directory_aliases')
        .delete()
        .eq('id', aliasId)
        .eq('business_id', business.id)

      if (deleteError) throw deleteError
      setAliases((current) => current.filter((item) => item.id !== aliasId))
      setSectionFeedback('aliases', 'success', bn ? 'বিকল্প নাম মুছে ফেলা হয়েছে।' : 'Alternate name removed.')
    } catch {
      setSectionFeedback('aliases', 'error', bn ? 'বিকল্প নাম মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।' : 'Alternate name could not be removed. Please try again.')
    } finally {
      setAliasBusyId(null)
    }
  }

  const busyLabel = bn ? 'সংরক্ষণ হচ্ছে…' : 'Saving…'

  return (
    <main className="min-h-dvh bg-[var(--fx-bg)] text-[var(--fx-text)]">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/directory/manage" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-4 text-sm font-bold">
            <ArrowLeft size={17} /> {bn ? 'আমার ব্যবসা' : 'My businesses'}
          </Link>
          {business && (
            <Link href={'/directory/' + encodeURIComponent(profile?.slug || business.id)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              {bn ? 'পাবলিক প্রোফাইল' : 'Public profile'} <ArrowUpRight size={16} />
            </Link>
          )}
        </div>

        <header className="mt-7">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#008080]">{bn ? 'ব্যবসার মালিকের ওয়ার্কস্পেস' : 'Business owner workspace'}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{bn ? 'ডিরেক্টরি প্রোফাইল সম্পাদনা' : 'Edit Directory Profile'}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 opacity-60">
            {bn
              ? 'এখানে পাবলিক ব্যবসার তথ্য, এলাকা, যোগাযোগ ও সার্চের বিকল্প নাম সম্পাদনা করুন। যাচাইকরণ বা বিশ্বাসযোগ্যতার লেবেল মালিক নিজে পরিবর্তন করতে পারবেন না।'
              : 'Edit public business information, location, contact details and search aliases here. Owners cannot change verification or trust labels themselves.'}
          </p>
        </header>

        {loading ? (
          <div role="status" className="mt-8 h-80 animate-pulse rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]" />
        ) : !signedIn ? (
          <section className="mt-8 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-7">
            <h2 className="text-xl font-black">{bn ? 'লগইন প্রয়োজন' : 'Sign in required'}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{loadError || (bn ? 'ব্যবসার তথ্য সম্পাদনা করতে লগইন করুন।' : 'Sign in to edit a business you own.')}</p>
            <Link href={'/login?next=' + encodeURIComponent('/directory/manage/' + encodeURIComponent(businessId))} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#008080] px-4 text-sm font-bold text-white">
              {bn ? 'লগইন করুন' : 'Sign in'}
            </Link>
          </section>
        ) : notFound || loadError || !business ? (
          <section role="alert" className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/[.04] p-7">
            <h2 className="text-xl font-black">{bn ? 'ব্যবসা পাওয়া যায়নি' : 'Business unavailable'}</h2>
            <p className="mt-2 text-sm leading-6 opacity-65">{loadError || (bn ? 'এই ব্যবসাটি আপনার অ্যাকাউন্টের সঙ্গে যুক্ত নয় অথবা আর পাওয়া যাচ্ছে না।' : 'This business is not linked to your account or is no longer available.')}</p>
            <Link href="/directory/manage" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[var(--fx-border)] px-4 text-sm font-bold">
              {bn ? 'ব্যবসার তালিকায় ফিরুন' : 'Back to my businesses'}
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-7 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Storefront size={24} className="text-[var(--fx-primary-strong)]" />
                  <div>
                    <p className="text-xs text-[var(--fx-muted)]">{bn ? 'বর্তমান ব্যবসা' : 'Current business'}</p>
                    <h2 className="mt-1 text-xl font-black">{business.title_bn || business.title_en || business.name}</h2>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-[var(--fx-border)] px-3 py-1.5 font-bold">{verificationLabel(profile?.verification_level, bn)}</span>
                  <span className="rounded-full bg-[var(--fx-primary-soft)] px-3 py-1.5 font-bold">{bn ? 'তথ্য-সম্পাদনাযোগ্য' : 'Owner-editable details'}</span>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--fx-muted)]">
                {bn
                  ? 'এই স্ক্রিনে প্রতিটি অংশ আলাদা করে সংরক্ষণ হয়। ফলে একটি অংশে সমস্যা হলে অন্য অংশের সফল সংরক্ষণ নষ্ট হয় না।'
                  : 'Each section saves independently, so a failure in one section does not undo another section that was already saved.'}
              </p>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-8">
              <h2 className="text-xl font-black">{bn ? '১. মূল ব্যবসার তথ্য' : '1. Basic business information'}</h2>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">{bn ? 'নাম ও বিভাগ পরিবর্তন করুন।' : 'Update the business name and category.'}</p>
              <form onSubmit={saveBasic} className="mt-6 space-y-5">
                <FenixField label={bn ? 'ব্যবসার নাম (প্রধান)' : 'Business name (primary)'} htmlFor="business-name" required>
                  <FenixInput id="business-name" required minLength={2} maxLength={180} value={name} onChange={(e) => setName(e.target.value)} />
                </FenixField>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'বাংলা নাম' : 'Bangla name'} htmlFor="business-title-bn">
                    <FenixInput id="business-title-bn" maxLength={180} value={titleBn} onChange={(e) => setTitleBn(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'ইংরেজি নাম' : 'English name'} htmlFor="business-title-en">
                    <FenixInput id="business-title-en" maxLength={180} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
                  </FenixField>
                </div>
                <FenixField label={bn ? 'বিভাগ' : 'Category'} htmlFor="business-category" required>
                  <FenixSelect id="business-category" required value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">{bn ? 'বিভাগ বেছে নিন' : 'Choose a category'}</option>
                    {category && !CATEGORIES.includes(category) && <option value={category}>{category}</option>}
                    {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </FenixSelect>
                </FenixField>
                <FenixField label={bn ? 'সংক্ষিপ্ত বিবরণ' : 'Short description'} htmlFor="business-description" hint={bn ? 'সঠিক ও যাচাইযোগ্য তথ্য দিন।' : 'Keep the description factual and verifiable.'}>
                  <FenixTextarea id="business-description" maxLength={2000} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                </FenixField>
                {feedback.basic && <FenixFormMessage tone={feedback.basic.kind}>{feedback.basic.text}</FenixFormMessage>}
                <FenixSubmitButton loading={saving === 'basic'}>{bn ? 'মূল তথ্য সংরক্ষণ করুন' : 'Save basic information'}</FenixSubmitButton>
              </form>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-8">
              <h2 className="text-xl font-black">{bn ? '২. পাবলিক প্রোফাইল' : '2. Public directory profile'}</h2>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">{bn ? 'প্রোফাইলের বর্ণনা ও URL slug সম্পাদনা করুন।' : 'Edit profile descriptions and the public URL slug.'}</p>
              <form onSubmit={savePublicProfile} className="mt-6 space-y-5">
                <FenixField label="URL slug" htmlFor="business-slug" hint={bn ? 'ঐচ্ছিক: যেমন feni-fashion-house। ফাঁকা রাখলে ID ব্যবহার হবে।' : 'Optional, for example feni-fashion-house. Leave empty to use the business ID.'}>
                  <FenixInput id="business-slug" maxLength={120} value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="feni-fashion-house" />
                </FenixField>
                <FenixField label={bn ? 'ব্যবসার ধরন' : 'Business type'} htmlFor="business-type">
                  <FenixInput id="business-type" maxLength={80} value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder={bn ? 'যেমন: পাইকারি দোকান' : 'e.g. Wholesale shop'} />
                </FenixField>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'বাংলা ট্যাগলাইন' : 'Bangla tagline'} htmlFor="tagline-bn">
                    <FenixInput id="tagline-bn" maxLength={240} value={taglineBn} onChange={(e) => setTaglineBn(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'ইংরেজি ট্যাগলাইন' : 'English tagline'} htmlFor="tagline-en">
                    <FenixInput id="tagline-en" maxLength={240} value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} />
                  </FenixField>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'বাংলা বিস্তারিত' : 'About in Bangla'} htmlFor="about-bn">
                    <FenixTextarea id="about-bn" maxLength={4000} rows={6} value={aboutBn} onChange={(e) => setAboutBn(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'ইংরেজি বিস্তারিত' : 'About in English'} htmlFor="about-en">
                    <FenixTextarea id="about-en" maxLength={4000} rows={6} value={aboutEn} onChange={(e) => setAboutEn(e.target.value)} />
                  </FenixField>
                </div>
                {feedback.profile && <FenixFormMessage tone={feedback.profile.kind}>{feedback.profile.text}</FenixFormMessage>}
                <FenixSubmitButton loading={saving === 'profile'}>{bn ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save public profile'}</FenixSubmitButton>
              </form>
              <p className="mt-4 text-xs leading-5 text-[var(--fx-muted)]">
                {bn ? 'যাচাইকরণ, মালিকানা দাবি অনুমোদন, ফোন/অবস্থান যাচাই এবং প্রকাশের অবস্থা এখানে সম্পাদনা করা যায় না।' : 'Verification, approved ownership claims, phone/location verification and publication status cannot be changed here.'}
              </p>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-8">
              <h2 className="text-xl font-black">{bn ? '৩. অবস্থান ও মানচিত্র' : '3. Location and map'}</h2>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">{bn ? 'প্রকাশযোগ্য অবস্থান দিন। ঠিকানা থেকে স্থানাঙ্ক অনুমান করা হয় না।' : 'Provide a publishable location. Coordinates are never guessed from an address.'}</p>
              <form onSubmit={saveLocation} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'জেলা' : 'District'} htmlFor="business-district" required>
                    <FenixInput id="business-district" required maxLength={120} value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'উপজেলা' : 'Upazila'} htmlFor="business-upazila">
                    <FenixInput id="business-upazila" maxLength={120} value={upazila} onChange={(e) => setUpazila(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'এলাকা' : 'Area'} htmlFor="business-area">
                    <FenixInput id="business-area" maxLength={160} value={area} onChange={(e) => setArea(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'বাজার' : 'Market'} htmlFor="business-market">
                    <FenixInput id="business-market" maxLength={160} value={market} onChange={(e) => setMarket(e.target.value)} />
                  </FenixField>
                </div>
                <FenixField label={bn ? 'পূর্ণ ঠিকানা' : 'Street / full address'} htmlFor="business-address">
                  <FenixTextarea id="business-address" maxLength={500} rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
                </FenixField>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'পোস্ট কোড' : 'Postal code'} htmlFor="business-postal">
                    <FenixInput id="business-postal" maxLength={24} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </FenixField>
                  <FenixField label={bn ? 'মানচিত্রে দেখানোর নাম' : 'Map label'} htmlFor="business-map-label">
                    <FenixInput id="business-map-label" maxLength={240} value={mapLabel} onChange={(e) => setMapLabel(e.target.value)} placeholder={bn ? 'যেমন: মহিপাল বাসস্ট্যান্ডের পাশে' : 'e.g. Near Mohipal bus stand'} />
                  </FenixField>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'অক্ষাংশ (Latitude)' : 'Latitude'} htmlFor="business-latitude">
                    <FenixInput id="business-latitude" type="number" step="any" min="-90" max="90" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 23.0159" />
                  </FenixField>
                  <FenixField label={bn ? 'দ্রাঘিমাংশ (Longitude)' : 'Longitude'} htmlFor="business-longitude">
                    <FenixInput id="business-longitude" type="number" step="any" min="-180" max="180" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 91.3976" />
                  </FenixField>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-[var(--fx-border)] p-4 text-sm">
                  <input type="checkbox" checked={locationPublic} onChange={(e) => setLocationPublic(e.target.checked)} className="mt-1 h-4 w-4 accent-[#008080]" />
                  <span>
                    <strong>{bn ? 'অবস্থান পাবলিকভাবে দেখান' : 'Make location public'}</strong>
                    <span className="mt-1 block text-xs leading-5 text-[var(--fx-muted)]">{bn ? 'বন্ধ করলে পাবলিক প্রোফাইল ও ম্যাপে এই লোকেশন দেখানো হবে না।' : 'When disabled, this location is hidden from the public profile and directory map.'}</span>
                  </span>
                </label>
                {feedback.location && <FenixFormMessage tone={feedback.location.kind}>{feedback.location.text}</FenixFormMessage>}
                <FenixSubmitButton loading={saving === 'location'}><MapPin size={17} /> {bn ? 'অবস্থান সংরক্ষণ করুন' : 'Save location'}</FenixSubmitButton>
              </form>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-8">
              <h2 className="text-xl font-black">{bn ? '৪. যোগাযোগের তথ্য' : '4. Public contact details'}</h2>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">{bn ? 'প্রতিটি ফোন/লিংক পাবলিক করার আগে সেটিংস যাচাই করুন।' : 'Review visibility before publishing phone numbers and links.'}</p>
              <form onSubmit={saveContacts} className="mt-6 space-y-5">
                <FenixField label={bn ? 'ফোন নম্বর' : 'Phone number'} htmlFor="business-phone">
                  <FenixInput id="business-phone" type="tel" maxLength={60} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </FenixField>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={phonePublic} onChange={(e) => setPhonePublic(e.target.checked)} className="h-4 w-4 accent-[#008080]" />
                  {bn ? 'ফোন নম্বর পাবলিকভাবে দেখান' : 'Show phone publicly'}
                </label>
                <FenixField label={bn ? 'WhatsApp নম্বর' : 'WhatsApp number'} htmlFor="business-whatsapp">
                  <FenixInput id="business-whatsapp" type="tel" maxLength={60} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </FenixField>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={whatsappPublic} onChange={(e) => setWhatsappPublic(e.target.checked)} className="h-4 w-4 accent-[#008080]" />
                  {bn ? 'WhatsApp নম্বর পাবলিকভাবে দেখান' : 'Show WhatsApp publicly'}
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <FenixField label={bn ? 'ওয়েবসাইট URL' : 'Website URL'} htmlFor="business-website">
                    <FenixInput id="business-website" type="url" maxLength={1000} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
                  </FenixField>
                  <FenixField label={bn ? 'Facebook URL' : 'Facebook URL'} htmlFor="business-facebook">
                    <FenixInput id="business-facebook" type="url" maxLength={1000} value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." />
                  </FenixField>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-[var(--fx-border)] p-4 text-sm">
                  <input type="checkbox" checked={websitePublic} onChange={(e) => setWebsitePublic(e.target.checked)} className="mt-1 h-4 w-4 accent-[#008080]" />
                  <span>
                    <strong>{bn ? 'ওয়েবসাইট/Facebook লিংক পাবলিক করুন' : 'Show website/Facebook links publicly'}</strong>
                    <span className="mt-1 block text-xs leading-5 text-[var(--fx-muted)]">{bn ? 'এই সেটিংস বন্ধ করলে ওয়েবসাইট ও Facebook লিংক পাবলিক প্রোফাইল থেকে লুকানো হবে। সংরক্ষণের আগে নিশ্চিত হন।' : 'When disabled, both website and Facebook links are hidden. Confirm before saving.'}</span>
                  </span>
                </label>
                {feedback.contacts && <FenixFormMessage tone={feedback.contacts.kind}>{feedback.contacts.text}</FenixFormMessage>}
                <FenixSubmitButton loading={saving === 'contacts'}>{bn ? 'যোগাযোগের তথ্য সংরক্ষণ করুন' : 'Save contact details'}</FenixSubmitButton>
              </form>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-6 sm:p-8">
              <h2 className="text-xl font-black">{bn ? '৫. সার্চের বিকল্প নাম' : '5. Alternate search names'}</h2>
              <p className="mt-1 text-sm text-[var(--fx-muted)]">{bn ? 'বাংলা, ইংরেজি ও Banglish বানান যোগ করুন যাতে মানুষ সহজে খুঁজে পায়।' : 'Add Bangla, English and Banglish spellings to help people find this business.'}</p>
              <form onSubmit={addAlias} className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                <FenixField label={bn ? 'বিকল্প নাম' : 'Alternate name'} htmlFor="business-alias" required>
                  <FenixInput id="business-alias" required minLength={2} maxLength={120} value={aliasDraft} onChange={(e) => setAliasDraft(e.target.value)} />
                </FenixField>
                <FenixField label={bn ? 'ভাষা/ধরন' : 'Language / type'} htmlFor="business-alias-language">
                  <FenixSelect id="business-alias-language" value={aliasLanguage} onChange={(e) => setAliasLanguage(e.target.value as typeof aliasLanguage)}>
                    <option value="bn">বাংলা</option>
                    <option value="en">English</option>
                    <option value="banglish">Banglish</option>
                    <option value="local">{bn ? 'স্থানীয় নাম' : 'Local name'}</option>
                  </FenixSelect>
                </FenixField>
                <FenixSubmitButton loading={aliasBusyId === 'add'}><Plus size={17} /> {bn ? 'যোগ করুন' : 'Add alias'}</FenixSubmitButton>
              </form>
              {feedback.aliases && <div className="mt-4"><FenixFormMessage tone={feedback.aliases.kind}>{feedback.aliases.text}</FenixFormMessage></div>}
              <div className="mt-5 space-y-2">
                {aliases.length ? aliases.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--fx-border)] p-3">
                    <div>
                      <p className="font-semibold">{item.alias}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--fx-muted)]">{item.language_code}</p>
                    </div>
                    <button type="button" disabled={Boolean(aliasBusyId)} onClick={() => void deleteAlias(item.id)} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-red-500/20 px-3 text-xs font-bold text-red-700 disabled:opacity-50 dark:text-red-200">
                      {aliasBusyId === item.id ? (bn ? 'মুছে ফেলা হচ্ছে…' : 'Removing…') : <><Trash size={14} /> {bn ? 'মুছুন' : 'Remove'}</>}
                    </button>
                  </div>
                )) : <p className="rounded-xl bg-black/[.025] p-4 text-sm text-[var(--fx-muted)] dark:bg-white/[.03]">{bn ? 'এখনো কোনো বিকল্প নাম যোগ করা হয়নি।' : 'No alternate search names yet.'}</p>}
              </div>
            </section>

            <section className="mt-6 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
              <div className="flex items-start gap-3">
                <ShieldCheck size={21} className="mt-0.5 shrink-0 text-[var(--fx-primary-strong)]" />
                <div>
                  <h2 className="font-black">{bn ? 'যাচাই ও প্রকাশের অবস্থা' : 'Verification and publication state'}</h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">
                    {bn
                      ? 'এই স্ক্রিনে ব্যবসার নাম, বিবরণ, ঠিকানা, যোগাযোগ ও সার্চের বানান পরিবর্তন করা যায়। FeniX-এর যাচাইকরণ ব্যাজ, ফোন/অবস্থান যাচাইকরণ এবং প্রকাশ/সাসপেন্ড অবস্থা অনুমোদিত reviewer পরিচালনা করেন।'
                      : 'This screen edits business details, location, contact information and search aliases. FeniX trust badges, phone/location verification and publish/suspend status are controlled by authorized reviewers.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={'/directory/verify?business=' + encodeURIComponent(business.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">
                      <ShieldCheck size={15} /> {bn ? 'যাচাইয়ের অনুরোধ' : 'Request verification'}
                    </Link>
                    <Link href={'/directory/' + encodeURIComponent(profile?.slug || business.id) + '/qr'} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold">
                      <ArrowUpRight size={15} /> {bn ? 'QR পরিচয়' : 'QR identity'}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  )
}
