'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapPin } from '@phosphor-icons/react'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type LocationRow = {
  id: string
  parent_id: string | null
  level: 'district' | 'upazila' | 'union' | 'ward' | 'municipality'
  name_bn: string
  name_en: string | null
  slug: string
}

type Props = {
  districtId: string
  upazilaId: string
  localityId: string
  areaText: string
  roadText: string
  houseDetails: string
  holdingNo: string
  publicLevel: 'district' | 'upazila' | 'locality'
  exactVisibility: 'private' | 'connections'
  onChange: (patch: {
    districtId?: string
    upazilaId?: string
    localityId?: string
    areaText?: string
    roadText?: string
    houseDetails?: string
    holdingNo?: string
    publicLevel?: 'district' | 'upazila' | 'locality'
    exactVisibility?: 'private' | 'connections'
    locationText?: string
  }) => void
}

export default function FeniLocationPicker({
  districtId, upazilaId, localityId, areaText, roadText, houseDetails, holdingNo,
  publicLevel, exactVisibility, onChange,
}: Props) {
  const { locale } = useFenixLocale()
  const [rows, setRows] = useState<LocationRow[]>([])
  const bn = locale === 'bn'

  useEffect(() => {
    let active = true
    const s = createClient()
    void s.from('fenix_brain_locations')
      .select('id,parent_id,level,name_bn,name_en,slug')
      .eq('is_active', true)
      .order('name_en')
      .then(({ data }) => {
        if (active) setRows((data ?? []) as LocationRow[])
      })
    return () => { active = false }
  }, [])

  const districts = useMemo(() => rows.filter(row => row.level === 'district'), [rows])
  const feniDistrict = useMemo(
    () => districts.find(row => /feni|ফেনী/i.test(row.name_en ?? '') || /ফেনী/.test(row.name_bn)) ?? districts[0],
    [districts],
  )
  const resolvedDistrictId = districtId || feniDistrict?.id || ''
  const upazilas = useMemo(
    () => rows.filter(row => row.level === 'upazila' && row.parent_id === resolvedDistrictId),
    [rows, resolvedDistrictId],
  )
  const selectedUpazila = useMemo(() => rows.find(row => row.id === upazilaId), [rows, upazilaId])
  const localities = useMemo(
    () => rows.filter(row =>
      (row.level === 'union' || row.level === 'ward' || row.level === 'municipality') &&
      row.parent_id === upazilaId,
    ),
    [rows, upazilaId],
  )
  const selectedLocality = useMemo(() => rows.find(row => row.id === localityId), [rows, localityId])
  const label = (row?: LocationRow) => row ? (bn ? row.name_bn : (row.name_en || row.name_bn)) : ''

  useEffect(() => {
    if (feniDistrict && !districtId) onChange({ districtId: feniDistrict.id })
  }, [districtId, feniDistrict, onChange])

  function selectUpazila(value: string) {
    const nextUpazila = rows.find(row => row.id === value)
    onChange({
      upazilaId: value,
      localityId: '',
      publicLevel: publicLevel === 'locality' ? 'upazila' : publicLevel,
      locationText: [label(feniDistrict), label(nextUpazila), areaText.trim(), roadText.trim()].filter(Boolean).join(' · ').slice(0, 500),
    })
  }

  function selectLocality(value: string) {
    const nextLocality = rows.find(row => row.id === value)
    onChange({
      localityId: value,
      locationText: [label(feniDistrict), label(selectedUpazila), label(nextLocality), areaText.trim(), roadText.trim()].filter(Boolean).join(' · ').slice(0, 500),
    })
  }

  function makeLocationText() {
    return [label(feniDistrict), label(selectedUpazila), label(selectedLocality), areaText.trim(), roadText.trim(), holdingNo.trim() ? (bn ? 'হোল্ডিং '+holdingNo.trim() : 'Holding '+holdingNo.trim()) : '', houseDetails.trim()].filter(Boolean).join(' · ').slice(0, 500)
  }

  return (
    <section className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)]/35 p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]"><MapPin size={18}/></div>
        <div><p className="text-sm font-black">{bn ? 'Feni location' : 'Feni location'}</p><p className="mt-1 text-xs leading-5 text-[var(--fx-muted)]">{bn ? 'এলাকা নির্বাচন করুন; exact address public profile-এ দেখানো হবে না।' : 'Choose the local area; the exact address is never exposed on the public profile.'}</p></div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold">{bn ? 'জেলা' : 'District'}</span>
          <select value={resolvedDistrictId} disabled className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">
            {feniDistrict && <option value={feniDistrict.id}>{label(feniDistrict)}</option>}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold">{bn ? 'উপজেলা' : 'Upazila'}</span>
          <select value={upazilaId} onChange={e=>selectUpazila(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">
            <option value="">{bn ? 'উপজেলা বাছাই' : 'Choose upazila'}</option>
            {upazilas.map(row=><option key={row.id} value={row.id}>{label(row)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-bold">{bn ? 'ইউনিয়ন/ওয়ার্ড/পৌরসভা' : 'Union / Ward / Municipality'}</span>
          <select value={localityId} onChange={e=>selectLocality(e.target.value)} disabled={!upazilaId} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm disabled:opacity-50">
            <option value="">{bn ? 'এলাকা বাছাই' : 'Choose area'}</option>
            {localities.map(row=><option key={row.id} value={row.id}>{label(row)}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label><span className="text-xs font-bold">{bn ? 'পাড়া/এলাকা' : 'Para / Area'}</span><input value={areaText} maxLength={160} onChange={e=>onChange({areaText:e.target.value,locationText:makeLocationText()})} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm" placeholder={bn ? 'যেমন: মিজান রোড এলাকা' : 'Local area name'}/></label>
        <label><span className="text-xs font-bold">{bn ? 'রোড/রাস্তা' : 'Road / Street'}</span><input value={roadText} maxLength={160} onChange={e=>onChange({roadText:e.target.value,locationText:makeLocationText()})} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm" placeholder={bn ? 'রোডের নাম' : 'Road name'}/></label>
        <label><span className="text-xs font-bold">{bn ? 'বাড়ির তথ্য' : 'House details'}</span><input value={houseDetails} maxLength={200} onChange={e=>onChange({houseDetails:e.target.value,locationText:makeLocationText()})} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm" placeholder={bn ? 'ঐচ্ছিক' : 'Optional'}/></label>
        <label><span className="text-xs font-bold">{bn ? 'হোল্ডিং নম্বর' : 'Holding number'}</span><input value={holdingNo} maxLength={80} onChange={e=>onChange({holdingNo:e.target.value,locationText:makeLocationText()})} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm" placeholder={bn ? 'ঐচ্ছিক' : 'Optional'}/></label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label><span className="text-xs font-bold">{bn ? 'Public location level' : 'Public location level'}</span>
          <select value={publicLevel} onChange={e=>onChange({publicLevel:e.target.value as Props['publicLevel'],locationText:makeLocationText()})} className="mt-2 h-11 w-full rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 text-sm">
            <option value="district">{bn ? 'শুধু জেলা' : 'District only'}</option>
            <option value="upazila">{bn ? 'জেলা + উপজেলা' : 'District + upazila'}</option>
            <option value="locality">{bn ? 'জেলা + উপজেলা + স্থানীয় এলাকা' : 'District + upazila + local area'}</option>
          </select>
        </label>
        <div className="rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-3 text-xs leading-5 text-[var(--fx-muted)]">
          <p className="font-bold text-[var(--fx-text)]">{bn ? 'Exact address privacy' : 'Exact address privacy'}</p>
          <p className="mt-1">{bn ? 'Exact address public করা যাবে না। Connections setting এখন চালু নেই; exact address private থাকবে।' : 'Exact address is never exposed publicly. Connection-only exact-address access is not enabled; exact address remains private.'}</p>
          <div className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-[var(--fx-border)] bg-[var(--fx-bg)] px-2.5 text-xs font-bold">
            {exactVisibility === 'private' ? (bn ? 'Private' : 'Private') : (bn ? 'Private (masked publicly)' : 'Private (masked publicly)')}
          </div>
        </div>
      </div>
    </section>
  )
}
