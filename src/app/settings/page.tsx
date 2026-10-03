'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Bell, BookmarkSimple, ChatCircleDots, GearSix, Globe, Lock, Moon, Palette, ShieldCheck,
  SignOut, Sun, UserCircle, Users, WarningCircle,
} from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useHomeTheme, type HomeTheme } from '@/components/theme/HomeThemeProvider'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Privacy = 'public' | 'private'
type MessagePermission = 'everyone' | 'authenticated' | 'nobody'
type FeedVisibility = 'public' | 'authenticated'

type NotificationPrefs = {
  messages: boolean
  social: boolean
  trust: boolean
  news: boolean
  push: boolean
}

const DEFAULT_PREFS: NotificationPrefs = {
  messages: true,
  social: true,
  trust: true,
  news: true,
  push: true,
}

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const { locale, setLocale } = useFenixLocale()
  const { theme, setTheme } = useHomeTheme()

  const [profileVisibility, setProfileVisibility] = useState<Privacy>('public')
  const [messagePermissions, setMessagePermissions] = useState<MessagePermission>('everyone')
  const [feedVisibility, setFeedVisibility] = useState<FeedVisibility>('public')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [savingKey, setSavingKey] = useState('')
  const [notice, setNotice] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityBusy, setSecurityBusy] = useState(false)

  useEffect(() => {
    const currentUserId = user?.id
    if (!currentUserId) {
      window.location.replace('/login?next=/settings')
      return
    }
    let active = true
    async function load(uid: string) {
      const s = createClient()
      const { data } = await s
        .from('profile_settings')
        .select('profile_visibility,message_permissions,feed_visibility,reduced_motion,notification_preferences,theme')
        .eq('user_id', uid)
        .maybeSingle()
      if (!active) return
      if (data?.profile_visibility === 'private') setProfileVisibility('private')
      if (data?.message_permissions === 'authenticated' || data?.message_permissions === 'nobody') setMessagePermissions(data.message_permissions)
      if (data?.feed_visibility === 'authenticated') setFeedVisibility('authenticated')
      if (data?.theme === 'light' || data?.theme === 'dark' || data?.theme === 'system') setTheme(data.theme)
      setReducedMotion(Boolean(data?.reduced_motion))
      const stored = data?.notification_preferences
      if (stored && typeof stored === 'object') {
        setPrefs({
          ...DEFAULT_PREFS,
          ...Object.fromEntries(
            Object.entries(stored).filter(([key, value]) => key in DEFAULT_PREFS && typeof value === 'boolean'),
          ),
        } as NotificationPrefs)
      }
    }
    void load(currentUserId)
    return () => { active = false }
  }, [setTheme, user])

  async function save(patch: Record<string, unknown>, key: string, success = locale === 'bn' ? 'সংরক্ষণ হয়েছে।' : 'Saved') {
    if (!user) return
    setSavingKey(key)
    setNotice('')
    const s = createClient()
    const { error } = await s
      .from('profile_settings')
      .upsert({ user_id: user.id, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) {
      setNotice(locale === 'bn' ? 'সেটিংস সংরক্ষণ করা যায়নি।' : 'This setting could not be saved.')
    } else {
      setNotice(success)
    }
    setSavingKey('')
  }

  const updatePrivacy = (key: 'profile_visibility' | 'message_permissions' | 'feed_visibility', value: string) => {
    if (key === 'profile_visibility') setProfileVisibility(value as Privacy)
    if (key === 'message_permissions') setMessagePermissions(value as MessagePermission)
    if (key === 'feed_visibility') setFeedVisibility(value as FeedVisibility)
    void save({ [key]: value }, key)
  }

  const togglePref = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    void save({ notification_preferences: next }, 'notification:' + key)
  }

  const chooseTheme = (next: HomeTheme) => {
    setTheme(next)
    void save({ theme: next }, 'theme')
  }

  async function changePassword() {
    if (newPassword.length < 8) {
      setNotice(bn ? 'Password কমপক্ষে 8 অক্ষরের হতে হবে।' : 'Password must be at least 8 characters.')
      return
    }
    if (!currentPassword) {
      setNotice(bn ? 'বর্তমান password দিন।' : 'Enter your current password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setNotice(bn ? 'Password confirmation মিলছে না।' : 'Password confirmation does not match.')
      return
    }
    if (currentPassword === newPassword) {
      setNotice(bn ? 'নতুন password অবশ্যই আলাদা হতে হবে।' : 'New password must be different from the current password.')
      return
    }
    setSecurityBusy(true)
    setNotice('')
    const s = createClient()
    const email = user?.email
    if (!email) {
      setSecurityBusy(false)
      setNotice(bn ? 'এই account-এ email password সেট করা নেই।' : 'This account does not have an email password sign-in.')
      return
    }

    const { error: verifyError } = await s.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (verifyError) {
      setSecurityBusy(false)
      setCurrentPassword('')
      setNotice(bn ? 'বর্তমান password সঠিক নয়।' : 'Current password is incorrect.')
      return
    }

    const { error } = await s.auth.updateUser({ password: newPassword })
    setSecurityBusy(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setNotice(error
      ? (bn ? 'Password পরিবর্তন করা যায়নি। প্রয়োজনে আবার Login করে চেষ্টা করুন।' : 'Password could not be changed. Please sign in again and retry.')
      : (bn ? 'Password পরিবর্তন হয়েছে।' : 'Password changed successfully.'))
  }

  async function signOutAllSessions() {
    setSecurityBusy(true)
    const s = createClient()
    await s.auth.signOut({ scope: 'global' })
    setSecurityBusy(false)
    window.location.replace('/login')
  }

  const chooseMotion = (next: boolean) => {
    setReducedMotion(next)
    try {
      localStorage.setItem('fenix-reduce-motion', String(next))
      document.documentElement.dataset.reduceMotion = next ? 'true' : 'false'
    } catch {}
    void save({ reduced_motion: next }, 'motion')
  }

  const bn = locale === 'bn'

  return (
    <main className="fenix-shell min-h-dvh overflow-x-clip">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <header className="rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-5 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">
              <GearSix size={24} weight="duotone" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--fx-primary-strong)]">
                {bn ? 'FeniX Settings' : 'FeniX Settings'}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-.05em] sm:text-5xl">
                {bn ? 'সব নিয়ন্ত্রণ এক জায়গায়' : 'Everything in one place'}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--fx-muted)]">
                {bn
                  ? 'Account, privacy, notifications, appearance ও safety—প্রয়োজন অনুযায়ী আলাদা করে নিয়ন্ত্রণ করুন।'
                  : 'Account, privacy, notifications, appearance and safety controls, separated by purpose.'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-4">
            <QuickLink href="/profile" icon={<UserCircle size={18}/>} title={bn ? 'প্রোফাইল' : 'Profile'} />
            <QuickLink href="/messages" icon={<ChatCircleDots size={18}/>} title={bn ? 'বার্তা' : 'Messages'} />
            <QuickLink href="/notifications" icon={<Bell size={18}/>} title={bn ? 'নোটিফিকেশন' : 'Notifications'} />
            <QuickLink href="/dashboard" icon={<Users size={18}/>} title={bn ? 'ওয়ার্কস্পেস' : 'Workspace'} />
            <QuickLink href="/saved" icon={<BookmarkSimple size={18}/>} title={bn ? 'Saved' : 'Saved'} />
          </div>
        </header>

        <div className="mt-5 space-y-4">
          <SettingsSection icon={<Lock size={20}/>} title={bn ? 'Privacy' : 'Privacy'} text={bn ? 'কে কী দেখতে ও করতে পারবে সেটা ঠিক করুন।' : 'Control who can see and interact with you.'}>
            <SettingRow
              title={bn ? 'প্রোফাইল দৃশ্যমানতা' : 'Profile visibility'}
              body={bn ? 'Public হলে username, bio ও public profile দেখা যাবে।' : 'Public profiles can be opened by anyone.'}
              control={
                <select value={profileVisibility} onChange={e => updatePrivacy('profile_visibility', e.target.value)} className="h-10 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-xs font-bold">
                  <option value="public">{bn ? 'সবার জন্য' : 'Public'}</option>
                  <option value="private">{bn ? 'ব্যক্তিগত' : 'Private'}</option>
                </select>
              }
            />
            <SettingRow
              title={bn ? 'কে message করতে পারবে' : 'Who can message you'}
              body={bn ? 'Direct message-এর eligibility নিয়ন্ত্রণ করুন।' : 'Control who can start or continue direct conversations.'}
              control={
                <select value={messagePermissions} onChange={e => updatePrivacy('message_permissions', e.target.value)} className="h-10 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-xs font-bold">
                  <option value="everyone">{bn ? 'সবাই' : 'Everyone'}</option>
                  <option value="authenticated">{bn ? 'লগইন করা ব্যবহারকারী' : 'Authenticated users'}</option>
                  <option value="nobody">{bn ? 'কেউ না' : 'Nobody'}</option>
                </select>
              }
            />
            <SettingRow
              title={bn ? 'Feed দৃশ্যমানতা' : 'Feed visibility'}
              body={bn ? 'আপনার public feed content কারা দেখতে পারবে।' : 'Control who can see your public feed content.'}
              control={
                <select value={feedVisibility} onChange={e => updatePrivacy('feed_visibility', e.target.value)} className="h-10 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)] px-3 text-xs font-bold">
                  <option value="public">{bn ? 'সবার জন্য' : 'Public'}</option>
                  <option value="authenticated">{bn ? 'শুধু লগইন ব্যবহারকারী' : 'Authenticated users'}</option>
                </select>
              }
            />
            <Link href="/settings/blocked" className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/45 p-4 hover:bg-[var(--fx-bg)]">
              <div><p className="text-sm font-bold">{bn ? 'Blocked accounts' : 'Blocked accounts'}</p><p className="mt-1 text-xs text-[var(--fx-muted)]">{bn ? 'যাদের message ও interaction বন্ধ করেছেন।' : 'Review people you have blocked.'}</p></div>
              <span className="text-xs font-black text-[var(--fx-primary-strong)]">Open</span>
            </Link>
          </SettingsSection>

          <SettingsSection icon={<Bell size={20}/>} title={bn ? 'Notifications' : 'Notifications'} text={bn ? 'কোন ধরনের activity আপনার notification inbox-এ আসবে তা নিয়ন্ত্রণ করুন।' : 'Choose which activity categories can appear in your notification inbox.'}>
            <PreferenceRow title={bn ? 'বার্তা' : 'Messages'} body={bn ? 'Direct-message related notifications।' : 'Notifications related to direct messages.'} enabled={prefs.messages} busy={savingKey === 'notification:messages'} onToggle={() => togglePref('messages')} />
            <PreferenceRow title={bn ? 'Social activity' : 'Social activity'} body={bn ? 'Community and interaction notifications।' : 'Community and interaction notifications.'} enabled={prefs.social} busy={savingKey === 'notification:social'} onToggle={() => togglePref('social')} />
            <PreferenceRow title={bn ? 'Trust & verification' : 'Trust & verification'} body={bn ? 'Verification, claims ও trust review updates।' : 'Verification, claims and trust review updates.'} enabled={prefs.trust} busy={savingKey === 'notification:trust'} onToggle={() => togglePref('trust')} />
            <PreferenceRow title={bn ? 'News & updates' : 'News & updates'} body={bn ? 'FeniX newsroom ও ecosystem update notifications।' : 'FeniX newsroom and ecosystem updates.'} enabled={prefs.news} busy={savingKey === 'notification:news'} onToggle={() => togglePref('news')} />
            <div className="rounded-2xl border border-dashed border-[var(--fx-border)] bg-[var(--fx-bg)]/35 p-4 text-xs leading-5 text-[var(--fx-muted)]">
              <WarningCircle size={15} className="mr-1 inline text-[var(--fx-primary-strong)]" />
              {bn ? 'Browser push permission আলাদা OS/browser permission; FeniX এখন inbox notification preference নিয়ন্ত্রণ করছে।' : 'Browser push permission is a separate OS/browser permission; these controls manage FeniX notification categories.'}
            </div>
          </SettingsSection>

          <SettingsSection icon={<Palette size={20}/>} title={bn ? 'Appearance & accessibility' : 'Appearance & accessibility'} text={bn ? 'Theme, language ও motion preference ঠিক করুন।' : 'Choose your theme, language and motion preferences.'}>
            <div className="grid gap-2 sm:grid-cols-3">
              {(['light','system','dark'] as HomeTheme[]).map(key => {
                const Icon = key === 'light' ? Sun : key === 'dark' ? Moon : Palette
                return <button key={key} type="button" onClick={() => chooseTheme(key)} aria-pressed={theme === key} className={'flex min-h-12 items-center justify-center gap-2 rounded-xl border text-xs font-bold ' + (theme === key ? 'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]' : 'border-[var(--fx-border)] bg-[var(--fx-bg)]/40')}><Icon size={18}/>{key === 'light' ? 'Light' : key === 'dark' ? 'Dark' : 'System'}</button>
              })}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { setLocale('bn'); void save({locale:'bn'}, 'locale', 'বাংলা চালু হয়েছে।') }} aria-pressed={locale === 'bn'} className={'min-h-12 rounded-xl border text-sm font-bold ' + (locale === 'bn' ? 'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)] bg-[var(--fx-bg)]/40')}>বাংলা</button>
              <button type="button" onClick={() => { setLocale('en'); void save({locale:'en'}, 'locale', 'Language set to English.') }} aria-pressed={locale === 'en'} className={'min-h-12 rounded-xl border text-sm font-bold ' + (locale === 'en' ? 'border-[var(--fx-primary)]/25 bg-[var(--fx-primary-soft)]' : 'border-[var(--fx-border)] bg-[var(--fx-bg)]/40')}>English</button>
            </div>
            <SettingRow title={bn ? 'Reduced motion' : 'Reduced motion'} body={bn ? 'Animation ও transition কমিয়ে দিন।' : 'Reduce extra transitions and animation.'} control={<Switch enabled={reducedMotion} busy={savingKey === 'motion'} onToggle={() => chooseMotion(!reducedMotion)} />} />
          </SettingsSection>


          <SettingsSection icon={<Lock size={20}/>} title={bn ? 'Security & login' : 'Security & login'} text={bn ? 'Password এবং session access নিয়ন্ত্রণ করুন।' : 'Control password and session access.'}>
            <div className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/40 p-4">
              <p className="text-sm font-bold">{bn ? 'Password পরিবর্তন' : 'Change password'}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{bn ? 'কমপক্ষে 8 অক্ষরের নতুন password দিন। Supabase সাম্প্রতিক authentication চাইতে পারে।' : 'Choose a new password of at least 8 characters. Supabase may require recent authentication.'}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} autoComplete="current-password" placeholder={bn?'বর্তমান password':'Current password'} className="h-11 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm outline-none"/>
                <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password" placeholder={bn?'নতুন password':'New password'} className="h-11 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm outline-none"/>
                <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} autoComplete="new-password" placeholder={bn?'আবার password দিন':'Confirm password'} className="h-11 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm outline-none"/>
              </div>
              <button type="button" onClick={()=>void changePassword()} disabled={securityBusy || !currentPassword || !newPassword || !confirmPassword} className="mt-3 min-h-10 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white disabled:opacity-40">{securityBusy ? (bn?'কাজ হচ্ছে…':'Working…') : (bn?'Password আপডেট করুন':'Update password')}</button>
            </div>
            <div className="rounded-2xl border border-red-500/15 bg-red-500/[.035] p-4">
              <p className="text-sm font-bold">{bn ? 'সব session থেকে Sign out' : 'Sign out all sessions'}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{bn ? 'এই account-এর অন্য device/browser session-ও বন্ধ হবে।' : 'End every active FeniX session for this account.'}</p>
              <button type="button" onClick={()=>void signOutAllSessions()} disabled={securityBusy} className="mt-3 min-h-10 rounded-xl border border-red-500/20 bg-red-500/[.07] px-4 text-xs font-bold text-red-700 dark:text-red-300 disabled:opacity-40">{bn?'সব session বন্ধ করুন':'Sign out all sessions'}</button>
            </div>
          </SettingsSection>

          <SettingsSection icon={<ShieldCheck size={20}/>} title={bn ? 'Safety, support & trust' : 'Safety, support & trust'} text={bn ? 'Report, verification, policy ও help-এর direct access।' : 'Direct access to reporting, verification, policy and help.'}>
            <div className="grid gap-2 sm:grid-cols-2">
              <QuickLink href="/help" icon={<WarningCircle size={18}/>} title={bn ? 'Help & Safety' : 'Help & Safety'} />
              <QuickLink href="/policy" icon={<ShieldCheck size={18}/>} title={bn ? 'Privacy & Policy' : 'Privacy & Policy'} />
              <QuickLink href="/directory/verify" icon={<ShieldCheck size={18}/>} title={bn ? 'Verification' : 'Verification'} />
              <QuickLink href="/emergency" icon={<WarningCircle size={18}/>} title={bn ? 'Emergency' : 'Emergency'} />
            </div>
          </SettingsSection>

          <SettingsSection icon={<Globe size={20}/>} title={bn ? 'Connected services' : 'Connected services'} text={bn ? 'এক tap-এ FeniX-এর মূল service খুলুন।' : 'Open the main FeniX services in one tap.'}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <QuickLink href="/feed" icon={<UserCircle size={18}/>} title={bn ? 'Feed' : 'Feed'} />
              <QuickLink href="/search" icon={<Globe size={18}/>} title={bn ? 'Search' : 'Search'} />
              <QuickLink href="/services" icon={<GearSix size={18}/>} title={bn ? 'Network' : 'Network'} />
              <QuickLink href="/guide" icon={<Palette size={18}/>} title={bn ? 'Feni Brain' : 'Feni Brain'} />
              <QuickLink href="/directory" icon={<Users size={18}/>} title={bn ? 'Directory' : 'Directory'} />
              <QuickLink href="/commerce" icon={<Globe size={18}/>} title={bn ? 'Shop' : 'Shop'} />
              <QuickLink href="/invest" icon={<ShieldCheck size={18}/>} title={bn ? 'Invest' : 'Invest'} />
              <QuickLink href="/jobs" icon={<Users size={18}/>} title={bn ? 'Jobs' : 'Jobs'} />
              <QuickLink href="/news" icon={<Bell size={18}/>} title={bn ? 'News' : 'News'} />
              <QuickLink href="/saved" icon={<BookmarkSimple size={18}/>} title={bn ? 'Saved' : 'Saved'} />
            </div>
          </SettingsSection>

          {notice && <div className="rounded-2xl border border-[var(--fx-primary)]/15 bg-[var(--fx-primary-soft)] p-4 text-sm">{notice}</div>}

          <section className="rounded-[2rem] border border-red-500/15 bg-red-500/[.035] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[.15em] text-red-600 dark:text-red-300">{bn ? 'Account action' : 'Account action'}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--fx-muted)]">{bn ? 'এই device থেকে FeniX account sign out করুন।' : 'Sign out of this FeniX account on this device.'}</p>
            <button type="button" onClick={() => void logout()} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[.07] px-4 text-sm font-bold text-red-700 dark:text-red-300">
              <SignOut size={17}/> {bn ? 'লগআউট' : 'Sign out'}
            </button>
          </section>
        </div>
      </section>
    </main>
  )
}

function SettingsSection({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children: React.ReactNode }) {
  return <details className="group rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface-strong)] p-0">
    <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden sm:p-6">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</div>
      <div className="min-w-0 flex-1"><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-sm leading-6 text-[var(--fx-muted)]">{text}</p></div>
      <span aria-hidden="true" className="text-xl font-light text-[var(--fx-muted)] transition-transform group-open:rotate-45">+</span>
    </summary>
    <div className="space-y-2 border-t border-[var(--fx-border)] p-5 sm:p-6">{children}</div>
  </details>
}

function SettingRow({ title, body, control }: { title: string; body: string; control: React.ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/40 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="text-sm font-bold">{title}</p><p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--fx-muted)]">{body}</p></div>
    <div className="shrink-0">{control}</div>
  </div>
}

function PreferenceRow({ title, body, enabled, busy, onToggle }: { title: string; body: string; enabled: boolean; busy: boolean; onToggle: () => void }) {
  return <SettingRow title={title} body={body} control={<Switch enabled={enabled} busy={busy} onToggle={onToggle} />} />
}

function Switch({ enabled, busy, onToggle }: { enabled: boolean; busy: boolean; onToggle: () => void }) {
  return <button type="button" role="switch" aria-checked={enabled} disabled={busy} onClick={onToggle} className={'relative h-7 w-12 rounded-full transition disabled:opacity-40 ' + (enabled ? 'bg-[var(--fx-primary)]' : 'bg-black/10 dark:bg-white/10')}>
    <span className={'absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ' + (enabled ? 'left-6' : 'left-1')} />
    <span className="sr-only">{enabled ? 'Enabled' : 'Disabled'}</span>
  </button>
}

function QuickLink({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
  return <Link href={href} className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/40 px-3.5 text-sm font-bold transition hover:bg-[var(--fx-bg)]">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]">{icon}</span>
    <span>{title}</span>
  </Link>
}
