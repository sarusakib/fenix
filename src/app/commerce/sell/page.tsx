'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  Storefront,
  WarningCircle,
} from '@phosphor-icons/react'

import Navbar from '../../../components/Navbar'
import { createClient } from '../../../utils/supabase/client'

type VendorStatus =
  | 'pending'
  | 'approved'
  | 'suspended'
  | 'rejected'

type VendorProfile = {
  id: string
  display_name: string
  status: VendorStatus
  is_verified: boolean
}

export default function CommerceSellPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [existingVendor, setExistingVendor] =
    useState<VendorProfile | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [displayName, setDisplayName] = useState('')
  const [displayNameBn, setDisplayNameBn] = useState('')
  const [displayNameEn, setDisplayNameEn] = useState('')
  const [descriptionBn, setDescriptionBn] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    let active = true

    async function loadSellerState() {
      try {
        const supabase = createClient()

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (!active) return

        if (userError || !user) {
          setUserId(null)
          setLoading(false)
          return
        }

        setUserId(user.id)

        const { data: vendor, error: vendorError } = await supabase
          .from('vendor_profiles')
          .select('id, display_name, status, is_verified')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!active) return

        if (vendorError) {
          console.error('Seller profile lookup failed:', {
            code: vendorError.code,
          })

          setError('Seller information load করা যায়নি।')
        } else if (vendor) {
          setExistingVendor(vendor as VendorProfile)
        }
      } catch (loadError) {
        console.error('Seller page load failed:', {
          name:
            loadError instanceof Error
              ? loadError.name
              : 'UnknownError',
        })

        if (active) {
          setError('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSellerState()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (submitting) return

    if (!userId) {
      router.push('/login?next=/commerce/sell')
      return
    }

    setError('')
    setSuccess('')

    const cleanDisplayName = displayName.trim().slice(0, 200)
    const cleanDisplayNameBn = displayNameBn.trim().slice(0, 200)
    const cleanDisplayNameEn = displayNameEn.trim().slice(0, 200)
    const cleanDescriptionBn = descriptionBn.trim().slice(0, 2000)
    const cleanDescriptionEn = descriptionEn.trim().slice(0, 2000)
    const cleanPhone = phone.trim().slice(0, 40)

    if (!cleanDisplayName) {
      setError('দোকান বা seller name দিন।')
      return
    }

    if (cleanDisplayName.length < 2) {
      setError('Seller name কমপক্ষে ২ অক্ষরের হতে হবে।')
      return
    }

    if (!cleanPhone || cleanPhone.length < 7) {
      setError('একটি valid phone number দিন।')
      return
    }

    setSubmitting(true)

    try {
      const supabase = createClient()

      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser()

      if (
        currentUserError ||
        !currentUser ||
        currentUser.id !== userId
      ) {
        setError(
          'আপনার login session পাওয়া যায়নি। আবার login করুন.',
        )
        return
      }

      /*
       * Important:
       * Use array payload with Supabase typed insert.
       * This avoids the `never[]` inference problem that occurred
       * when the Commerce tables were added to Database types.
       */
      const { data: createdVendor, error: insertError } = await supabase
        .from('vendor_profiles')
        .insert([
          {
            user_id: userId,
            display_name: cleanDisplayName,
            display_name_bn: cleanDisplayNameBn || null,
            display_name_en: cleanDisplayNameEn || null,
            description_bn: cleanDescriptionBn || null,
            description_en: cleanDescriptionEn || null,
            phone: cleanPhone,
          },
        ])
        .select('id, display_name, status, is_verified')
        .single()

      if (insertError) {
        if (insertError.code === '23505') {
          setError(
            'এই account থেকে ইতিমধ্যে seller application তৈরি হয়েছে।',
          )
        } else {
          console.error('Seller application failed:', {
            code: insertError.code,
          })

          setError(
            'Seller application submit করা যায়নি। আবার চেষ্টা করুন।',
          )
        }

        return
      }

      if (!createdVendor) {
        setError(
          'Seller application তৈরি হয়েছে কি না নিশ্চিত হওয়া যায়নি।',
        )
        return
      }

      setExistingVendor(createdVendor as VendorProfile)
      setSuccess(
        'আপনার seller application সফলভাবে জমা হয়েছে।',
      )
    } catch (submitError) {
      console.error('Seller application error:', {
        name:
          submitError instanceof Error
            ? submitError.name
            : 'UnknownError',
      })

      setError('কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।')
    } finally {
      setSubmitting(false)
    }
  }

  function getStatusText(status: VendorStatus) {
    switch (status) {
      case 'approved':
        return 'আপনার seller account approved হয়েছে।'

      case 'suspended':
        return 'আপনার seller account বর্তমানে suspended।'

      case 'rejected':
        return 'আপনার previous seller application rejected হয়েছে।'

      default:
        return 'আপনার application review-এর জন্য অপেক্ষমাণ।'
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-clip bg-[#f7faf9] text-[#0b1736] transition-colors dark:bg-[#030506] dark:text-white">
      <Navbar />

      <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <button
          type="button"
          onClick={() => router.push('/commerce')}
          className="
            inline-flex items-center gap-2 rounded-xl
            border border-[#0b1736]/10
            bg-white/75 px-3.5 py-2
            text-sm text-[#0b1736]/70
            shadow-sm backdrop-blur-xl
            transition hover:bg-white hover:text-[#0b1736]
            dark:border-white/10
            dark:bg-white/[0.045]
            dark:text-white/70
            dark:hover:bg-white/[0.08]
            dark:hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Commerce
        </button>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          {/* Intro */}
          <div>
            <div
              className="
                inline-flex items-center gap-2 rounded-full
                border border-[#008080]/20
                bg-[#008080]/[0.07]
                px-4 py-2
                text-xs font-semibold uppercase
                tracking-[0.16em] text-[#007373]
                dark:border-teal-200/[0.18]
                dark:bg-teal-300/[0.08]
                dark:text-teal-200
              "
            >
              <Storefront size={15} weight="duotone" />
              FeniX Seller
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Sell on FeniX.
            </h1>

            <p className="mt-5 text-sm leading-7 text-[#0b1736]/60 dark:text-white/55 sm:text-base">
              আপনার local business বা দোকানের products FeniX Commerce-এ
              publish করার জন্য seller application submit করুন।
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                <div
                  className="
                    flex h-10 w-10 shrink-0 items-center justify-center
                    rounded-xl bg-[#008080]/10
                    text-[#008080]
                    dark:bg-teal-300/10 dark:text-teal-200
                  "
                >
                  <ShieldCheck size={21} weight="duotone" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Verification first
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#0b1736]/50 dark:text-white/40">
                    Application pending থাকবে যতক্ষণ না seller verification
                    complete হয়।
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div
                  className="
                    flex h-10 w-10 shrink-0 items-center justify-center
                    rounded-xl bg-[#D4A72C]/10
                    text-[#a17b12]
                    dark:bg-[#D4A72C]/10 dark:text-[#e2c66f]
                  "
                >
                  <CheckCircle size={21} weight="duotone" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Customer account ≠ Seller account
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#0b1736]/50 dark:text-white/40">
                    Shopping করার জন্য seller হওয়া প্রয়োজন নেই।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form / Status */}
          <div
            className="
              rounded-[2rem]
              border border-[#0b1736]/10
              bg-white/80 p-5
              shadow-[0_20px_70px_rgba(11,23,54,0.07)]
              backdrop-blur-2xl
              sm:p-8
              dark:border-white/10
              dark:bg-white/[0.045]
              dark:shadow-[0_20px_80px_rgba(0,0,0,0.25)]
            "
          >
            {loading ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#008080]/20 border-t-[#008080]" />

                <p className="mt-4 text-sm text-[#0b1736]/50 dark:text-white/45">
                  Seller information checking...
                </p>
              </div>
            ) : !userId ? (
              <div className="py-10 text-center">
                <div
                  className="
                    mx-auto flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-[#008080]/10
                    text-[#008080]
                    dark:bg-teal-300/10 dark:text-teal-200
                  "
                >
                  <Storefront size={27} weight="duotone" />
                </div>

                <h2 className="mt-5 text-2xl font-semibold">
                  Seller হতে login করুন
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#0b1736]/55 dark:text-white/45">
                  Customer হিসেবে shopping করতে login প্রয়োজন নেই। তবে
                  seller application-এর জন্য FeniX account প্রয়োজন।
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push('/login?next=/commerce/sell')
                  }
                  className="
                    mt-7 inline-flex items-center gap-2 rounded-xl
                    bg-[#008080] px-5 py-3
                    text-sm font-semibold text-white
                    transition hover:bg-[#006f6f]
                  "
                >
                  Login to continue
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : existingVendor ? (
              <div>
                <div
                  className="
                    rounded-2xl border border-[#008080]/20
                    bg-[#008080]/[0.06] p-5
                    dark:border-teal-300/15
                    dark:bg-teal-300/[0.06]
                  "
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={24}
                      weight="duotone"
                      className="mt-0.5 shrink-0 text-[#008080] dark:text-teal-200"
                    />

                    <div>
                      <p className="font-semibold">
                        Seller application already exists
                      </p>

                      <p className="mt-1 text-sm text-[#0b1736]/60 dark:text-white/50">
                        {getStatusText(existingVendor.status)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#008080] dark:text-teal-200/80">
                    Seller
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    {existingVendor.display_name}
                  </h2>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#0b1736]/10 bg-[#0b1736]/[0.025] p-4 dark:border-white/[0.08] dark:bg-white/[0.025]">
                      <p className="text-xs text-[#0b1736]/45 dark:text-white/40">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize">
                        {existingVendor.status}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#0b1736]/10 bg-[#0b1736]/[0.025] p-4 dark:border-white/[0.08] dark:bg-white/[0.025]">
                      <p className="text-xs text-[#0b1736]/45 dark:text-white/40">
                        Verification
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {existingVendor.is_verified
                          ? 'Verified'
                          : 'Not verified yet'}
                      </p>
                    </div>
                  </div>

                  {existingVendor.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => router.push('/commerce')}
                      className="
                        mt-7 inline-flex items-center gap-2 rounded-xl
                        bg-[#008080] px-5 py-3
                        text-sm font-semibold text-white
                        transition hover:bg-[#006f6f]
                      "
                    >
                      Continue to Commerce
                      <ArrowRight size={17} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#008080] dark:text-teal-200/80">
                    Application
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Tell us about your store
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#0b1736]/50 dark:text-white/40">
                    এই information seller profile তৈরি করতে ব্যবহার হবে।
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="
                      mt-6 flex gap-3 rounded-xl
                      border border-red-500/20
                      bg-red-500/[0.06] p-4
                      text-sm text-red-700
                      dark:text-red-200
                    "
                  >
                    <WarningCircle size={19} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div
                    role="status"
                    className="
                      mt-6 flex gap-3 rounded-xl
                      border border-[#008080]/20
                      bg-[#008080]/[0.06] p-4
                      text-sm text-[#006b6b]
                      dark:text-teal-200
                    "
                  >
                    <CheckCircle size={19} className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="display-name"
                      className="text-sm font-medium"
                    >
                      Store / Seller name
                    </label>

                    <input
                      id="display-name"
                      type="text"
                      value={displayName}
                      onChange={(event) =>
                        setDisplayName(event.target.value.slice(0, 200))
                      }
                      placeholder="যেমন: Feni Fashion House"
                      maxLength={200}
                      required
                      className="
                        mt-2 h-12 w-full rounded-xl
                        border border-[#0b1736]/10
                        bg-white px-4 text-sm
                        text-[#0b1736]
                        outline-none transition
                        placeholder:text-[#0b1736]/30
                        focus:border-[#008080]/40
                        focus:ring-4 focus:ring-[#008080]/10
                        dark:border-white/10
                        dark:bg-white/[0.045]
                        dark:text-white
                        dark:placeholder:text-white/25
                        dark:focus:border-teal-300/30
                        dark:focus:ring-teal-300/10
                      "
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="display-name-bn"
                        className="text-sm font-medium"
                      >
                        বাংলা নাম
                      </label>

                      <input
                        id="display-name-bn"
                        type="text"
                        value={displayNameBn}
                        onChange={(event) =>
                          setDisplayNameBn(
                            event.target.value.slice(0, 200),
                          )
                        }
                        placeholder="ফেনী ফ্যাশন হাউস"
                        maxLength={200}
                        className="
                          mt-2 h-12 w-full rounded-xl
                          border border-[#0b1736]/10
                          bg-white px-4 text-sm
                          text-[#0b1736]
                          outline-none transition
                          placeholder:text-[#0b1736]/30
                          focus:border-[#008080]/40
                          focus:ring-4 focus:ring-[#008080]/10
                          dark:border-white/10
                          dark:bg-white/[0.045]
                          dark:text-white
                          dark:placeholder:text-white/25
                          dark:focus:border-teal-300/30
                          dark:focus:ring-teal-300/10
                        "
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="display-name-en"
                        className="text-sm font-medium"
                      >
                        English name
                      </label>

                      <input
                        id="display-name-en"
                        type="text"
                        value={displayNameEn}
                        onChange={(event) =>
                          setDisplayNameEn(
                            event.target.value.slice(0, 200),
                          )
                        }
                        placeholder="Feni Fashion House"
                        maxLength={200}
                        className="
                          mt-2 h-12 w-full rounded-xl
                          border border-[#0b1736]/10
                          bg-white px-4 text-sm
                          text-[#0b1736]
                          outline-none transition
                          placeholder:text-[#0b1736]/30
                          focus:border-[#008080]/40
                          focus:ring-4 focus:ring-[#008080]/10
                          dark:border-white/10
                          dark:bg-white/[0.045]
                          dark:text-white
                          dark:placeholder:text-white/25
                          dark:focus:border-teal-300/30
                          dark:focus:ring-teal-300/10
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium"
                    >
                      Seller phone
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value.slice(0, 40))
                      }
                      placeholder="01XXXXXXXXX"
                      maxLength={40}
                      required
                      className="
                        mt-2 h-12 w-full rounded-xl
                        border border-[#0b1736]/10
                        bg-white px-4 text-sm
                        text-[#0b1736]
                        outline-none transition
                        placeholder:text-[#0b1736]/30
                        focus:border-[#008080]/40
                        focus:ring-4 focus:ring-[#008080]/10
                        dark:border-white/10
                        dark:bg-white/[0.045]
                        dark:text-white
                        dark:placeholder:text-white/25
                        dark:focus:border-teal-300/30
                        dark:focus:ring-teal-300/10
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description-bn"
                      className="text-sm font-medium"
                    >
                      দোকান সম্পর্কে সংক্ষেপে
                    </label>

                    <textarea
                      id="description-bn"
                      value={descriptionBn}
                      onChange={(event) =>
                        setDescriptionBn(
                          event.target.value.slice(0, 2000),
                        )
                      }
                      placeholder="আপনার দোকান বা business সম্পর্কে লিখুন..."
                      maxLength={2000}
                      rows={4}
                      className="
                        mt-2 w-full resize-y rounded-xl
                        border border-[#0b1736]/10
                        bg-white px-4 py-3 text-sm
                        leading-6 text-[#0b1736]
                        outline-none transition
                        placeholder:text-[#0b1736]/30
                        focus:border-[#008080]/40
                        focus:ring-4 focus:ring-[#008080]/10
                        dark:border-white/10
                        dark:bg-white/[0.045]
                        dark:text-white
                        dark:placeholder:text-white/25
                        dark:focus:border-teal-300/30
                      "
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description-en"
                      className="text-sm font-medium"
                    >
                      English description
                    </label>

                    <textarea
                      id="description-en"
                      value={descriptionEn}
                      onChange={(event) =>
                        setDescriptionEn(
                          event.target.value.slice(0, 2000),
                        )
                      }
                      placeholder="Tell customers about your store..."
                      maxLength={2000}
                      rows={4}
                      className="
                        mt-2 w-full resize-y rounded-xl
                        border border-[#0b1736]/10
                        bg-white px-4 py-3 text-sm
                        leading-6 text-[#0b1736]
                        outline-none transition
                        placeholder:text-[#0b1736]/30
                        focus:border-[#008080]/40
                        focus:ring-4 focus:ring-[#008080]/10
                        dark:border-white/10
                        dark:bg-white/[0.045]
                        dark:text-white
                        dark:placeholder:text-white/25
                        dark:focus:border-teal-300/30
                      "
                    />
                  </div>
                </div>

                <div
                  className="
                    mt-6 rounded-xl
                    border border-[#D4A72C]/20
                    bg-[#D4A72C]/[0.05]
                    p-4
                    text-xs leading-5
                    text-[#0b1736]/60
                    dark:text-white/50
                  "
                >
                  <strong className="font-semibold">
                    Verification:
                  </strong>{' '}
                  Application submit করার পর seller status `pending` থাকবে।
                  Approved না হওয়া পর্যন্ত product publish করা যাবে না।
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    mt-6 inline-flex w-full items-center
                    justify-center gap-2 rounded-xl
                    bg-[#008080] px-5 py-3.5
                    text-sm font-semibold text-white
                    shadow-lg shadow-[#008080]/15
                    transition
                    hover:bg-[#006f6f]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Seller Application
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
            }
