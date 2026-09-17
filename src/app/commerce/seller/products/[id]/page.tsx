'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package, Archive, UploadSimple, WarningCircle } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'

export default function SellerProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<{ id: string; name_bn: string; name_en: string; price: number; status: string; is_active: boolean } | null>(null)
  const [quantity, setQuantity] = useState('0')
  const [threshold, setThreshold] = useState('5')

  useEffect(() => {
    let active = true
    async function load() {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) { router.replace(`/login?next=/commerce/seller/products/${encodeURIComponent(params.id)}`); return }
      const { data: vendor } = await supabase.from('vendor_profiles').select('id, status').eq('user_id', auth.user.id).maybeSingle()
      if (!vendor || vendor.status !== 'approved') { router.replace('/commerce/seller'); return }
      const { data, error: productError } = await supabase.from('products').select('id, name_bn, name_en, price, status, is_active').eq('id', params.id).eq('vendor_id', vendor.id).maybeSingle()
      if (!active) return
      if (productError || !data) { setError('Product পাওয়া যায়নি।'); setLoading(false); return }
      const { data: stock } = await supabase.from('inventory').select('quantity, low_stock_threshold').eq('product_id', params.id).maybeSingle()
      setProduct(data)
      setQuantity(String(stock?.quantity ?? 0))
      setThreshold(String(stock?.low_stock_threshold ?? 5))
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [params.id, router])

  async function inventorySave() {
    setSaving(true); setError('')
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc('set_vendor_product_inventory', { p_product_id: params.id, p_quantity: Number(quantity), p_low_stock_threshold: Number(threshold) })
    if (rpcError) setError('Inventory update করা যায়নি।')
    setSaving(false)
  }

  async function productAction(action: 'publish' | 'archive') {
    setSaving(true); setError('')
    const supabase = createClient()
    const { error: rpcError } = await supabase.rpc(action === 'publish' ? 'publish_vendor_product' : 'archive_vendor_product', { p_product_id: params.id })
    if (rpcError) setError(action === 'publish' ? 'Product publish করা যায়নি। আগে required information ও seller approval check করুন।' : 'Product archive করা যায়নি.')
    else setProduct((current) => current ? { ...current, status: action === 'publish' ? 'published' : 'archived', is_active: action === 'publish' } : current)
    setSaving(false)
  }

  return <main className="min-h-screen bg-[#f7faf9] text-[#0b1736] dark:bg-[#030506] dark:text-white"><Navbar /><section className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6 lg:px-8"><Link href="/commerce/seller" className="inline-flex items-center gap-2 rounded-xl border border-[#0b1736]/10 bg-white/70 px-3.5 py-2 text-sm dark:border-white/10 dark:bg-white/[0.045]"><ArrowLeft size={17} /> Seller Dashboard</Link>{loading ? <div className="py-24 text-center opacity-50">Loading product...</div> : error && !product ? <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-6 text-red-700 dark:text-red-200">{error}</div> : product ? <><div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#008080]">Product management</p><h1 className="mt-2 text-3xl font-black">{product.name_bn || product.name_en}</h1><p className="mt-2 text-sm opacity-50">৳{Number(product.price).toLocaleString('en-BD')} · {product.status}</p></div><span className="rounded-full bg-[#008080]/10 px-3 py-1.5 text-xs font-bold capitalize text-[#007373] dark:text-teal-200">{product.status}</span></div>{error && <div role="alert" className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-700 dark:text-red-200">{error}</div>}<div className="mt-7 rounded-[2rem] border border-[#0b1736]/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.045]"><h2 className="flex items-center gap-2 font-black"><Package size={20} /> Inventory</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Available quantity" value={quantity} setValue={setQuantity} /><Field label="Low stock alert" value={threshold} setValue={setThreshold} /></div><button disabled={saving} onClick={() => void inventorySave()} className="mt-5 rounded-xl bg-[#0b1736] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white/[0.12]">{saving ? 'Saving…' : 'Save inventory'}</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><button disabled={saving || product.status === 'published'} onClick={() => void productAction('publish')} className="flex items-center justify-center gap-2 rounded-xl bg-[#008080] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-40"><UploadSimple size={18} /> Publish product</button><button disabled={saving || product.status === 'archived'} onClick={() => void productAction('archive')} className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-3.5 text-sm font-bold text-red-600 disabled:opacity-40 dark:text-red-300"><Archive size={18} /> Archive product</button></div><div className="mt-5 flex items-start gap-2 rounded-xl bg-[#008080]/[0.06] p-4 text-xs leading-5 text-[#006b6b] dark:text-teal-200"><CheckCircle size={16} className="mt-0.5 shrink-0" /> Publishing and inventory changes are authorized by the database against the logged-in approved seller.</div></> : null}</section></main>
}

function Field({ label, value, setValue }: { label: string; value: string; setValue: (value: string) => void }) { return <label className="text-sm font-semibold">{label}<input type="number" min="0" max="100000000" value={value} onChange={(e) => setValue(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#0b1736]/10 bg-transparent px-4 outline-none focus:border-[#008080] dark:border-white/10" /></label> }
