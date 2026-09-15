'use client'

import {
FormEvent,
useEffect,
useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
ArrowLeft,
CheckCircle,
Package,
WarningCircle,
} from '@phosphor-icons/react'

import Navbar from '../../../../../components/Navbar'
import { createClient } from '../../../../../utils/supabase/client'

type Vendor = {
id: string
display_name: string
status:
| 'pending'
| 'approved'
| 'suspended'
| 'rejected'
}

type Category = {
id: string
name_bn: string | null
name_en: string | null
}

function createSlug(value: string) {
return value
.trim()
.toLowerCase()
.normalize('NFKD')
.replace(/[\u0300-\u036f]/g, '')
.replace(
/[^a-z0-9\u0980-\u09ff]+/g,
'-',
)
.replace(/^-+|-+$/g, '')
.slice(0, 150)
}

export default function NewProductPage() {
const router = useRouter()

const [loading, setLoading] = useState(true)
const [submitting, setSubmitting] = useState(false)

const [vendor, setVendor] =
useState<Vendor | null>(null)

const [categories, setCategories] =
useState<Category[]>([])

const [nameBn, setNameBn] = useState('')
const [nameEn, setNameEn] = useState('')
const [slug, setSlug] = useState('')
const [descriptionBn, setDescriptionBn] =
useState('')
const [descriptionEn, setDescriptionEn] =
useState('')
const [sku, setSku] = useState('')
const [price, setPrice] = useState('')
const [compareAtPrice, setCompareAtPrice] =
useState('')
const [categoryId, setCategoryId] =
useState('')
const [allowGuestPurchase, setAllowGuestPurchase] =
useState(true)

const [error, setError] = useState('')
const [success, setSuccess] = useState('')

useEffect(() => {
let active = true

async function loadForm() {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (!active) return

    if (userError || !user) {
      router.replace(
        '/login?next=/commerce/seller/products/new',
      )
      return
    }

    const [
      vendorResult,
      categoryResult,
    ] = await Promise.all([
      supabase
        .from('vendor_profiles')
        .select(
          'id, display_name, status',
        )
        .eq('user_id', user.id)
        .maybeSingle(),

      supabase
        .from('product_categories')
        .select(
          'id, name_bn, name_en',
        )
        .eq('is_active', true)
        .order('sort_order', {
          ascending: true,
        }),
    ])

    if (!active) return

    if (vendorResult.error) {
      console.error(
        'Vendor lookup failed:',
        {
          code:
            vendorResult.error.code,
        },
      )

      setError(
        'Seller information load করা যায়নি।',
      )

      return
    }

    if (!vendorResult.data) {
      router.replace('/commerce/sell')
      return
    }

    const currentVendor =
      vendorResult.data as Vendor

    if (
      currentVendor.status !==
      'approved'
    ) {
      router.replace(
        '/commerce/seller',
      )
      return
    }

    setVendor(currentVendor)

    if (categoryResult.error) {
      console.error(
        'Category lookup failed:',
        {
          code:
            categoryResult.error.code,
        },
      )

      setError(
        'Product categories load করা যায়নি।',
      )

      return
    }

    setCategories(
      (categoryResult.data ??
        []) as Category[],
    )
  } catch (loadError) {
    console.error(
      'New product page failed:',
      {
        name:
          loadError instanceof Error
            ? loadError.name
            : 'UnknownError',
      },
    )

    if (active) {
      setError(
        'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      )
    }
  } finally {
    if (active) {
      setLoading(false)
    }
  }
}

void loadForm()

return () => {
  active = false
}

}, [router])

function handleEnglishNameChange(
value: string,
) {
const cleanValue =
value.slice(0, 200)

setNameEn(cleanValue)

if (
  !slug ||
  slug === createSlug(nameEn)
) {
  setSlug(
    createSlug(cleanValue),
  )
}

}

async function handleSubmit(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault()

if (!vendor) {
  setError(
    'Seller information পাওয়া যায়নি।',
  )
  return
}

setError('')
setSuccess('')

const cleanNameBn =
  nameBn.trim().slice(0, 200)

const cleanNameEn =
  nameEn.trim().slice(0, 200)

const cleanSlug =
  createSlug(
    slug || nameEn || nameBn,
  )

const cleanDescriptionBn =
  descriptionBn
    .trim()
    .slice(0, 4000)

const cleanDescriptionEn =
  descriptionEn
    .trim()
    .slice(0, 4000)

const cleanSku =
  sku.trim().slice(0, 100)

const numericPrice =
  Number(price)

const numericCompareAtPrice =
  compareAtPrice
    ? Number(compareAtPrice)
    : null

if (
  !cleanNameBn &&
  !cleanNameEn
) {
  setError(
    'বাংলা অথবা English product name দিন।',
  )
  return
}

if (!cleanSlug) {
  setError(
    'Product slug তৈরি করা যায়নি।',
  )
  return
}

if (
  !Number.isFinite(
    numericPrice,
  ) ||
  numericPrice < 0
) {
  setError(
    'Valid product price দিন।',
  )
  return
}

if (
  numericCompareAtPrice !==
  null &&
  (
    !Number.isFinite(
      numericCompareAtPrice,
    ) ||
    numericCompareAtPrice <
      numericPrice
  )
) {
  setError(
    'Compare-at price product price-এর সমান বা বেশি হতে হবে।',
  )
  return
}

setSubmitting(true)

try {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    router.replace(
      '/login?next=/commerce/seller/products/new',
    )
    return
  }

  const {
    data: createdProduct,
    error: insertError,
  } = await supabase
    .from('products')
    .insert([
      {
        vendor_id: vendor.id,
        category_id:
          categoryId || null,
        name_bn:
          cleanNameBn || null,
        name_en:
          cleanNameEn || null,
        slug: cleanSlug,
        description_bn:
          cleanDescriptionBn ||
          null,
        description_en:
          cleanDescriptionEn ||
          null,
        sku:
          cleanSku || null,
        price: numericPrice,
        compare_at_price:
          numericCompareAtPrice,
        currency: 'BDT',
        status: 'draft',
        is_active: false,
        is_featured: false,
        allow_guest_purchase:
          allowGuestPurchase,
      },
    ])
    .select('id')
    .single()

  if (
    insertError ||
    !createdProduct
  ) {
    console.error(
      'Product creation failed:',
      {
        code:
          insertError?.code,
      },
    )

    if (
      insertError?.code ===
      '23505'
    ) {
      setError(
        'এই slug বা SKU আগে থেকেই ব্যবহৃত হয়েছে। অন্য একটি দিন।',
      )
    } else {
      setError(
        'Product draft তৈরি করা যায়নি। আবার চেষ্টা করুন।',
      )
    }

    return
  }

  setSuccess(
    'Product draft সফলভাবে তৈরি হয়েছে।',
  )

  setTimeout(() => {
    router.push(
      '/commerce/seller',
    )
  }, 700)
} catch (submitError) {
  console.error(
    'Product creation error:',
    {
      name:
        submitError instanceof Error
          ? submitError.name
          : 'UnknownError',
    },
  )

  setError(
    'কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।',
  )
} finally {
  setSubmitting(false)
}

}

if (loading) {
return (
<main className="min-h-screen bg-[#f7faf9] dark:bg-[#030506]">
<Navbar />

    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <div
          className="
            mx-auto h-9 w-9 animate-spin
            rounded-full border-2
            border-[#008080]/20
            border-t-[#008080]
          "
        />

        <p
          className="
            mt-4 text-sm
            text-[#0b1736]/50
            dark:text-white/45
          "
        >
          Product form loading...
        </p>
      </div>
    </div>
  </main>
)

}

return (
<main
className="
min-h-screen w-full overflow-x-clip
bg-[#f7faf9] text-[#0b1736]
dark:bg-[#030506]
dark:text-white
"
>
<Navbar />

  <section
    className="
      mx-auto w-full max-w-4xl
      px-4 pb-20 pt-8
      sm:px-6
      lg:px-8 lg:pt-10
    "
  >
    <button
      type="button"
      onClick={() =>
        router.push(
          '/commerce/seller',
        )
      }
      className="
        inline-flex items-center gap-2
        rounded-xl
        border border-[#0b1736]/10
        bg-white/75
        px-3.5 py-2
        text-sm text-[#0b1736]/70
        shadow-sm backdrop-blur-xl
        dark:border-white/10
        dark:bg-white/[0.045]
        dark:text-white/70
      "
    >
      <ArrowLeft size={17} />
      Seller Dashboard
    </button>

    <div className="mt-10">
      <p
        className="
          text-xs font-semibold
          uppercase tracking-[0.15em]
          text-[#008080]
          dark:text-teal-200/80
        "
      >
        Product
      </p>

      <h1
        className="
          mt-2 text-3xl font-semibold
          sm:text-4xl
        "
      >
        Add a product
      </h1>

      <p
        className="
          mt-3 max-w-2xl
          text-sm leading-6
          text-[#0b1736]/55
          dark:text-white/45
        "
      >
        Product প্রথমে draft হিসেবে তৈরি হবে।
        Image, inventory এবং publishing
        workflow পরবর্তী ধাপে যুক্ত হবে।
      </p>
    </div>

    <form
      onSubmit={handleSubmit}
      noValidate
      className="
        mt-8 rounded-[2rem]
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
      {error && (
        <div
          role="alert"
          className="
            flex gap-3 rounded-xl
            border border-red-500/20
            bg-red-500/[0.06] p-4
            text-sm text-red-700
            dark:text-red-200
          "
        >
          <WarningCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="
            flex gap-3 rounded-xl
            border border-[#008080]/20
            bg-[#008080]/[0.06] p-4
            text-sm text-[#006b6b]
            dark:text-teal-200
          "
        >
          <CheckCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <span>{success}</span>
        </div>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field
          id="name-bn"
          label="Product name — বাংলা"
          value={nameBn}
          onChange={setNameBn}
          placeholder="যেমন: ফেনীর দেশি মধু"
          maxLength={200}
        />

        <Field
          id="name-en"
          label="Product name — English"
          value={nameEn}
          onChange={
            handleEnglishNameChange
          }
          placeholder="Feni Local Honey"
          maxLength={200}
        />
      </div>

      <div className="mt-5">
        <Field
          id="slug"
          label="Product slug"
          value={slug}
          onChange={(value) =>
            setSlug(
              createSlug(value),
            )
          }
          placeholder="feni-local-honey"
          maxLength={160}
        />

        <p
          className="
            mt-2 text-xs
            text-[#0b1736]/40
            dark:text-white/35
          "
        >
          Shareable product URL-এর জন্য
          ব্যবহার হবে।
        </p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field
          id="price"
          label="Price — BDT"
          type="number"
          value={price}
          onChange={setPrice}
          placeholder="0"
          min="0"
          step="0.01"
        />

        <Field
          id="compare-price"
          label="Compare-at price — optional"
          type="number"
          value={compareAtPrice}
          onChange={setCompareAtPrice}
          placeholder="0"
          min="0"
          step="0.01"
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field
          id="sku"
          label="SKU — optional"
          value={sku}
          onChange={setSku}
          placeholder="FNX-HONEY-001"
          maxLength={100}
        />

        <div>
          <label
            htmlFor="category"
            className="text-sm font-medium"
          >
            Category
          </label>

          <select
            id="category"
            value={categoryId}
            onChange={(event) =>
              setCategoryId(
                event.target.value,
              )
            }
            className="
              mt-2 h-12 w-full
              rounded-xl
              border border-[#0b1736]/10
              bg-white px-4 text-sm
              text-[#0b1736]
              outline-none
              focus:border-[#008080]/40
              focus:ring-4
              focus:ring-[#008080]/10
              dark:border-white/10
              dark:bg-[#101416]
              dark:text-white
            "
          >
            <option value="">
              No category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name_bn ||
                    category.name_en ||
                    'Category'}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="description-bn"
          className="text-sm font-medium"
        >
          Description — বাংলা
        </label>

        <textarea
          id="description-bn"
          value={descriptionBn}
          onChange={(event) =>
            setDescriptionBn(
              event.target.value.slice(
                0,
                4000,
              ),
            )
          }
          rows={5}
          maxLength={4000}
          placeholder="পণ্যের বিস্তারিত তথ্য..."
          className="
            mt-2 w-full resize-y
            rounded-xl
            border border-[#0b1736]/10
            bg-white px-4 py-3
            text-sm leading-6
            text-[#0b1736]
            outline-none
            placeholder:text-[#0b1736]/30
            focus:border-[#008080]/40
            focus:ring-4
            focus:ring-[#008080]/10
            dark:border-white/10
            dark:bg-white/[0.045]
            dark:text-white
            dark:placeholder:text-white/25
          "
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="description-en"
          className="text-sm font-medium"
        >
          Description — English
        </label>

        <textarea
          id="description-en"
          value={descriptionEn}
          onChange={(event) =>
            setDescriptionEn(
              event.target.value.slice(
                0,
                4000,
              ),
            )
          }
          rows={5}
          maxLength={4000}
          placeholder="Describe your product..."
          className="
            mt-2 w-full resize-y
            rounded-xl
            border border-[#0b1736]/10
            bg-white px-4 py-3
            text-sm leading-6
            text-[#0b1736]
            outline-none
            placeholder:text-[#0b1736]/30
            focus:border-[#008080]/40
            focus:ring-4
            focus:ring-[#008080]/10
            dark:border-white/10
            dark:bg-white/[0.045]
            dark:text-white
            dark:placeholder:text-white/25
          "
        />
      </div>

      <label
        className="
          mt-6 flex cursor-pointer
          items-start gap-3
          rounded-xl
          border border-[#0b1736]/10
          bg-[#0b1736]/[0.025] p-4
          dark:border-white/[0.08]
          dark:bg-white/[0.025]
        "
      >
        <input
          type="checkbox"
          checked={
            allowGuestPurchase
          }
          onChange={(event) =>
            setAllowGuestPurchase(
              event.target.checked,
            )
          }
          className="
            mt-1 h-4 w-4
            accent-[#008080]
          "
        />

        <span>
          <span className="block text-sm font-medium">
            Allow guest purchase
          </span>

          <span
            className="
              mt-1 block text-xs
              leading-5
              text-[#0b1736]/45
              dark:text-white/40
            "
          >
            Customer FeniX account ছাড়াই
            এই product order করতে পারবে।
          </span>
        </span>
      </label>

      <div
        className="
          mt-6 flex gap-3 rounded-xl
          border border-[#008080]/15
          bg-[#008080]/[0.05] p-4
        "
      >
        <Package
          size={20}
          className="
            mt-0.5 shrink-0
            text-[#008080]
          "
          weight="duotone"
        />

        <p
          className="
            text-xs leading-5
            text-[#0b1736]/55
            dark:text-white/45
          "
        >
          এই ধাপে product শুধুমাত্র{' '}
          <strong>draft</strong> হিসেবে
          তৈরি হবে। সরাসরি public listing
          বা stock পরিবর্তনের permission নেই।
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="
          mt-7 inline-flex w-full
          items-center justify-center
          gap-2 rounded-xl
          bg-[#008080] px-5 py-3.5
          text-sm font-semibold text-white
          shadow-lg
          shadow-[#008080]/15
          transition
          hover:bg-[#006f6f]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {submitting ? (
          <>
            <span
              className="
                h-4 w-4 animate-spin
                rounded-full border-2
                border-white/30
                border-t-white
              "
            />

            Creating draft...
          </>
        ) : (
          <>
            <Package
              size={18}
              weight="duotone"
            />

            Create Product Draft
          </>
        )}
      </button>
    </form>
  </section>
</main>

)
}

function Field({
id,
label,
value,
onChange,
placeholder,
maxLength,
type = 'text',
min,
step,
}: {
id: string
label: string
value: string
onChange: (
value: string,
) => void
placeholder?: string
maxLength?: number
type?: string
min?: string
step?: string
}) {
return (
<div>
<label
htmlFor={id}
className="text-sm font-medium"
>
{label}
</label>

  <input
    id={id}
    type={type}
    value={value}
    onChange={(event) =>
      onChange(
        event.target.value,
      )
    }
    placeholder={placeholder}
    maxLength={maxLength}
    min={min}
    step={step}
    className="
      mt-2 h-12 w-full
      rounded-xl
      border border-[#0b1736]/10
      bg-white px-4 text-sm
      text-[#0b1736]
      outline-none transition
      placeholder:text-[#0b1736]/30
      focus:border-[#008080]/40
      focus:ring-4
      focus:ring-[#008080]/10
      dark:border-white/10
      dark:bg-white/[0.045]
      dark:text-white
      dark:placeholder:text-white/25
      dark:focus:border-teal-300/30
      dark:focus:ring-teal-300/10
    "
  />
</div>

)
}
