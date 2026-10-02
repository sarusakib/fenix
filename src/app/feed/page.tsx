'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookmarkSimple, ChatCircle, DotsThreeVertical, ImageSquare, LinkSimple, Newspaper, PaperPlaneRight, Plus, Question, ShareNetwork, ThumbsUp, UploadSimple, UserCircle, UserPlus, WarningCircle, X } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'
import { optimizeImageFile, uploadOptimizedPublicImage } from '@/lib/media/image-upload'
import { ROUTES } from '@/lib/core/routes'

type Topic = { id:string; slug:string; name_bn:string; name_en:string }
type QuestionRow = {
  id:string; title:string; body:string; created_at:string; author_id:string;
  topic_id:string|null; author_name:string|null; author_username:string|null; author_avatar_url:string|null;
  topic_name:string|null; answer_count?:number; score?:number;
}
type NewsRow = { id:string; slug:string; title_bn:string; title_en:string; excerpt_bn:string|null; excerpt_en:string|null; category:string; verification_status:string; featured:boolean; breaking:boolean; published_at:string|null; source_name:string|null; image_url:string|null }
type PostMediaRow = { id:string; post_id:string; storage_bucket:string; storage_path:string; mime_type:string; width:number|null; height:number|null; sort_order:number; byte_size:number; source_byte_size:number|null; source_digest:string|null; public_url:string }
type PostRow = { id:string; body:string; created_at:string; author_id:string; author_name:string|null; author_username:string|null; author_avatar_url:string|null; media:PostMediaRow[]; score:number; comment_count:number; liked:boolean; saved:boolean }
type FeedTab = 'for-you'|'following'|'latest'|'questions'|'news'
const FEED_TABS = ['for-you','following','latest','questions','news'] as const
const normalizeFeedTab=(value:string|null):FeedTab=>FEED_TABS.includes(value as FeedTab)?value as FeedTab:'for-you'

const fmt=(v:string,locale:string)=>new Date(v).toLocaleString(locale==='bn'?'bn-BD':'en-BD',{dateStyle:'medium',timeStyle:'short'})
const label=(t:Topic,locale:string)=>locale==='bn'?t.name_bn:t.name_en

export default function FeedPage(){
  const {locale}=useFenixLocale()
  const router=useRouter()
  const searchParams=useSearchParams()
  const tab=normalizeFeedTab(searchParams.get('tab'))
  const [questions,setQuestions]=useState<QuestionRow[]>([])
  const [news,setNews]=useState<NewsRow[]>([])
  const [posts,setPosts]=useState<PostRow[]>([])
  const [topics,setTopics]=useState<Topic[]>([])
  const [followed,setFollowed]=useState<string[]>([])
  const [followedProfiles,setFollowedProfiles]=useState<string[]>([])
  const [postMenuId,setPostMenuId]=useState<string|null>(null)
  const [userId,setUserId]=useState<string|null>(null)
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [topicId,setTopicId]=useState('')
  const [composer,setComposer]=useState<'question'|'post'>('post')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')
  const [postImages,setPostImages]=useState<Array<{id:string;file:File;previewUrl:string;width:number;height:number;byteSize:number;sourceByteSize:number;sourceDigest:string}>>([])
  const [imageBusy,setImageBusy]=useState(false)
  const [loading,setLoading]=useState(true)
  const [loadedTab,setLoadedTab]=useState<FeedTab|null>(null)

  const changeTab=useCallback((next:FeedTab)=>{
    const params=new URLSearchParams(searchParams.toString())
    if(next==='for-you') params.delete('tab')
    else params.set('tab',next)
    const query=params.toString()
    router.replace(query?`${ROUTES.feed}?${query}`:ROUTES.feed,{scroll:false})
    window.scrollTo({top:0,behavior:'smooth'})
  },[router,searchParams])

  const load=useCallback(async()=>{
    setLoading(true)
    const s=createClient()
    try {
      const questionPromise = tab === 'questions' || tab === 'following' ? s.from('fenix_public_question_feed') : Promise.resolve({data:null})
        .select('id,title,body,created_at,author_id,topic_id,author_name,author_username,author_avatar_url,topic_slug,topic_name_bn,topic_name_en,answer_count,score')
        .order('created_at',{ascending:false}).limit(40)
      const newsPromise = tab === 'news' ? s.from('news_posts') : Promise.resolve({data:null})
        .select('id,slug,title_bn,title_en,excerpt_bn,excerpt_en,category,verification_status,featured,breaking,published_at,source_name,image_url')
        .eq('status','published').order('published_at',{ascending:false}).limit(24)
      const postsPromise = tab === 'questions' || tab === 'news' ? Promise.resolve({data:null}) : s.from('fenix_public_feed').select('id,body,created_at,author_id,author_name,author_username,author_avatar_url').order('created_at',{ascending:false}).limit(30)
      const [{data:auth},{data:q},{data:n},{data:p}] = await Promise.all([s.auth.getSession(),questionPromise,newsPromise,postsPromise])
      const uid=auth.session?.user?.id??null
      setUserId(uid)
      let nextFollowedProfiles:string[]=[]
      if(uid){
        const {data:follows}=await s.from('fenix_profile_follows').select('following_id').eq('follower_id',uid)
        nextFollowedProfiles=(follows??[]).map((row:{following_id:string})=>row.following_id)
      }
      setFollowedProfiles(nextFollowedProfiles)

      let nextPosts:PostRow[]=[]
      if(tab!=='questions' && tab!=='news'){
        const postRows=(p??[]) as unknown as PostRow[]
        const postIds=postRows.map(row=>row.id)
        let nextPostMedia:Array<Omit<PostMediaRow,'public_url'>>=[]
        let voteRows:{content_id:string;value:number;user_id:string|null}[]=[]
        let commentRows:{content_id:string}[]=[]
        let bookmarkRows:{content_id:string}[]=[]
        if(postIds.length){
          const [mediaResult,voteResult,commentResult,bookmarkResult]=await Promise.all([
            s.from('fenix_post_media')
              .select('id,post_id,storage_bucket,storage_path,mime_type,width,height,sort_order,byte_size,source_byte_size,source_digest')
              .in('post_id',postIds).order('sort_order',{ascending:true}),
            s.from('fenix_content_votes').select('content_id,value,user_id').eq('content_type','post').in('content_id',postIds),
            s.from('fenix_content_comments').select('content_id').eq('content_type','post').in('content_id',postIds).is('deleted_at',null),
            uid ? s.from('fenix_content_bookmarks').select('content_id').eq('user_id',uid).eq('content_type','post').in('content_id',postIds) : Promise.resolve({data:null}),
          ])
          nextPostMedia=(mediaResult.data??[]) as Array<Omit<PostMediaRow,'public_url'>>
          voteRows=(voteResult.data??[]) as {content_id:string;value:number;user_id:string|null}[]
          commentRows=(commentResult.data??[]) as {content_id:string}[]
          bookmarkRows=(bookmarkResult.data??[]) as {content_id:string}[]
        }
        const mediaByPost:Record<string,PostMediaRow[]>={}
        for(const row of nextPostMedia){
          const public_url=s.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data.publicUrl
          ;(mediaByPost[row.post_id]??[]).push({...row,public_url})
        }
        const scoreByPost:Record<string,number>={}
        for(const row of voteRows) scoreByPost[row.content_id]=(scoreByPost[row.content_id]??0)+Number(row.value??0)
        const commentsByPost:Record<string,number>={}
        for(const row of commentRows) commentsByPost[row.content_id]=(commentsByPost[row.content_id]??0)+1
        const savedIds=new Set(bookmarkRows.map(row=>row.content_id))
        nextPosts=postRows.map(row=>({...row,media:mediaByPost[row.id]??[],score:scoreByPost[row.id]??0,comment_count:commentsByPost[row.id]??0,liked:Boolean(uid && voteRows.some(v=>v.content_id===row.id && v.user_id===uid && Number(v.value)>0)),saved:savedIds.has(row.id)}))
      }
      const qq=(q??[]).map((x:any)=>({
        ...x,
        author_name:x.author_name??null,
        author_username:x.author_username??null,
        author_avatar_url:x.author_avatar_url??null,
        topic_name:locale==='bn'?(x.topic_name_bn??x.topic_name_en):(x.topic_name_en??x.topic_name_bn),
      })) as QuestionRow[]
      setQuestions(qq)
      setNews((n??[]) as NewsRow[])
      setPosts(nextPosts)
      if(tab==='following' && uid){
        const {data:f}=await s.from('fenix_topic_follows').select('topic_id').eq('user_id',uid)
        setFollowed((f??[]).map(x=>x.topic_id))
      } else if(tab!=='following') setFollowed([])
    } catch {
      setMessage(locale==='bn'?'Feed লোড করা যায়নি।':'Could not load the feed.')
      setQuestions([]);setNews([]);setPosts([])
    } finally {
      setLoadedTab(tab)
      setLoading(false)
    }
  },[tab,locale])

  useEffect(()=>{void load()},[load])

  useEffect(()=>{
    if(!userId || topics.length) return
    const s=createClient()
    void s.from('fenix_topics').select('id,slug,name_bn,name_en').order('name_en').then(({data})=>{
      if(data) setTopics(data as Topic[])
    })
  },[userId,topics.length])

  async function ask(){
    const cleanTitle=title.trim(), cleanBody=body.trim()
    if(cleanTitle.length<8||cleanBody.length<1||!userId)return
    setBusy(true);setMessage('')
    const s=createClient()
    const {error}=await s.from('fenix_questions').insert({author_id:userId,title:cleanTitle,body:cleanBody,topic_id:topicId||null})
    if(error)setMessage(locale==='bn'?'Question পোস্ট করা যায়নি।':'Could not publish the question.')
    else{setTitle('');setBody('');setMessage(locale==='bn'?'Question প্রকাশ হয়েছে।':'Question published.');await load()}
    setBusy(false)
  }

  async function selectPostImages(files: FileList | null){
    if(!files?.length)return
    const available=Math.max(0,4-postImages.length)
    if(available===0){setMessage(locale==='bn'?'একটি post-এ সর্বোচ্চ ৪টি photo দিতে পারবেন।':'You can add up to 4 photos to one post.');return}
    setImageBusy(true);setMessage('')
    const prepared:Array<{id:string;file:File;previewUrl:string;width:number;height:number;byteSize:number;sourceByteSize:number;sourceDigest:string}>=[]
    try{
      for(const file of Array.from(files).slice(0,available)){
        const optimized=await optimizeImageFile(file,{maxDimension:1600})
        if (optimized.sourceDigest && (postImages.some(image => image.sourceDigest === optimized.sourceDigest) || prepared.some(image => image.sourceDigest === optimized.sourceDigest))) continue
        prepared.push({id:crypto.randomUUID(),file:optimized.file,previewUrl:URL.createObjectURL(optimized.file),width:optimized.width,height:optimized.height,byteSize:optimized.byteSize,sourceByteSize:optimized.sourceByteSize ?? file.size,sourceDigest:optimized.sourceDigest ?? ''})
      }
      setPostImages(value=>[...value,...prepared])
      if (prepared.length < Math.min(files.length, available)) {
        setMessage(locale==='bn'?'একই photo আবার দেওয়া হয়নি।':'Duplicate photos were skipped.')
      }
      if(files.length>available)setMessage(locale==='bn'?'সর্বোচ্চ ৪টি photo রাখা হয়েছে।':'Only the first 4 photos were kept.')
    }catch(error){
      for(const item of prepared)URL.revokeObjectURL(item.previewUrl)
      setMessage(locale==='bn'?'ছবিটি প্রস্তুত করা যায়নি।':'Could not prepare the image: '+(error instanceof Error?error.message:'Unknown error'))
    }finally{setImageBusy(false)}
  }

  function removePostImage(id:string){
    setPostImages(value=>{
      const item=value.find(image=>image.id===id)
      if(item)URL.revokeObjectURL(item.previewUrl)
      return value.filter(image=>image.id!==id)
    })
  }

  function clearPostImages(){
    setPostImages(value=>{for(const image of value)URL.revokeObjectURL(image.previewUrl);return []})
  }

  async function publishPost(){
    const clean=body.trim()
    if(!userId || (!clean && postImages.length===0))return
    setBusy(true);setMessage('')
    const s=createClient()
    const postId=crypto.randomUUID()
    const uploaded:Array<{path:string;publicUrl:string;width:number;height:number;byteSize:number;mimeType:string;sourceByteSize?:number;sourceDigest?:string}> = []
    let postCreated=false
    try{
      const results=await Promise.all(postImages.map((image,index)=>{
        const extension=image.file.type==='image/webp'?'webp':'jpg'
        const path=userId+'/'+postId+'/'+String(index)+'.'+extension
        return uploadOptimizedPublicImage(s,'fenix-post-media',path,{file:image.file,width:image.width,height:image.height,byteSize:image.byteSize,mimeType:image.file.type})
      }))
      uploaded.push(...results)

      const {error:postError}=await s.from('fenix_posts').insert({id:postId,author_id:userId,body:clean,visibility:'public'})
      if(postError)throw postError
      postCreated=true

      if(uploaded.length){
        const {error:mediaError}=await s.from('fenix_post_media').insert(uploaded.map((item,index)=>({post_id:postId,author_id:userId,storage_bucket:'fenix-post-media',storage_path:item.path,mime_type:item.mimeType,byte_size:item.byteSize,width:item.width,height:item.height,source_byte_size:item.sourceByteSize ?? null,source_digest:item.sourceDigest ?? null,optimization_version:'fenix-image-v2',sort_order:index})))
        if(mediaError)throw mediaError
      }

      setBody('');clearPostImages();setMessage(locale==='bn'?'Post প্রকাশ হয়েছে।':'Post published.');await load()
    }catch(error){
      if(postCreated)await s.from('fenix_posts').update({deleted_at:new Date().toISOString()}).eq('id',postId).eq('author_id',userId)
      if(uploaded.length)await s.storage.from('fenix-post-media').remove(uploaded.map(item=>item.path))
      setMessage(locale==='bn'?'Post প্রকাশ করা যায়নি।':'Could not publish the post: '+(error instanceof Error?error.message:'Unknown error'))
    }finally{setBusy(false)}
  }

  async function toggleFollow(id:string){
    if(!userId)return
    const s=createClient(), exists=followed.includes(id)
    setBusy(true)
    const r=exists?await s.from('fenix_topic_follows').delete().eq('user_id',userId).eq('topic_id',id):await s.from('fenix_topic_follows').insert({user_id:userId,topic_id:id})
    if(!r.error)setFollowed(v=>exists?v.filter(x=>x!==id):[...v,id])
    setBusy(false)
  }

  async function toggleProfileFollow(profileId:string){
    if(!userId){setMessage(locale==='bn'?'Follow করতে Login করুন।':'Sign in to follow people.');return}
    if(profileId===userId)return
    const exists=followedProfiles.includes(profileId)
    const s=createClient()
    setBusy(true)
    const result=exists
      ? await s.from('fenix_profile_follows').delete().eq('follower_id',userId).eq('following_id',profileId)
      : await s.from('fenix_profile_follows').insert({follower_id:userId,following_id:profileId})
    if(result.error){setMessage(locale==='bn'?'Follow আপডেট করা যায়নি।':'Could not update follow.')} else setFollowedProfiles(value=>exists?value.filter(id=>id!==profileId):[...value,profileId])
    setBusy(false)
  }

  async function togglePostSave(contentId:string){
    if(!userId){setMessage(locale==='bn'?'Save করতে Login করুন।':'Sign in to save posts.');return}
    const current=posts.find(post=>post.id===contentId)?.saved ?? false
    const s=createClient()
    const result=current
      ? await s.from('fenix_content_bookmarks').delete().eq('user_id',userId).eq('content_type','post').eq('content_id',contentId)
      : await s.from('fenix_content_bookmarks').insert({user_id:userId,content_type:'post',content_id:contentId})
    if(result.error){setMessage(locale==='bn'?'Save আপডেট করা যায়নি।':'Could not update saved post.');return}
    setPosts(value=>value.map(post=>post.id===contentId?{...post,saved:!current}:post))
  }

  async function copyPostLink(contentId:string){
    const url=location.origin+'/feed/post/'+contentId
    try{await navigator.clipboard.writeText(url);setMessage(locale==='bn'?'Post link কপি হয়েছে।':'Post link copied.')}catch{setMessage(locale==='bn'?'Link কপি করা যায়নি।':'Could not copy the link.')}
    setPostMenuId(null)
  }

  async function reportPost(contentId:string){
    if(!userId){setMessage(locale==='bn'?'Report করতে Login করুন।':'Sign in to report a post.');return}
    const s=createClient()
    const {error}=await s.from('fenix_content_reports').insert({reporter_id:userId,content_type:'post',content_id:contentId,reason:'spam',details:'Reported from FeniX Feed.'})
    if(error)setMessage(locale==='bn'?'Report পাঠানো যায়নি।':'Could not submit the report.')
    else setMessage(locale==='bn'?'Report পাঠানো হয়েছে।':'Report submitted.')
    setPostMenuId(null)
  }

  async function sharePost(contentId:string,title?:string){
    const url=location.origin+'/feed/post/'+contentId
    try{
      if(navigator.share) await navigator.share({title:title||'FeniX post',url})
      else await navigator.clipboard.writeText(url)
    }catch{}
  }

  async function votePost(contentId:string){
    if(!userId){setMessage(locale==='bn'?'Like দিতে Login করুন।':'Sign in to like.');return}
    const s=createClient()
    const {data:old}=await s.from('fenix_content_votes').select('value').eq('user_id',userId).eq('content_type','post').eq('content_id',contentId).maybeSingle()
    const result=old
      ? await s.from('fenix_content_votes').delete().eq('user_id',userId).eq('content_type','post').eq('content_id',contentId)
      : await s.from('fenix_content_votes').insert({user_id:userId,content_type:'post',content_id:contentId,value:1})
    if(result.error){setMessage(locale==='bn'?'Like আপডেট করা যায়নি।':'Could not update like.');return}
    setPosts(value=>value.map(p=>p.id===contentId?{...p,liked:!old,score:Math.max(0,p.score+(old?-1:1))}:p))
  }

  async function vote(contentId:string){
    if(!userId){setMessage(locale==='bn'?'Vote দিতে Login করুন।':'Sign in to vote.');return}
    const s=createClient()
    const {data:old}=await s.from('fenix_content_votes').select('value').eq('user_id',userId).eq('content_type','question').eq('content_id',contentId).maybeSingle()
    let error:string|null=null
    if(old) {
      const result=await s.from('fenix_content_votes').delete().eq('user_id',userId).eq('content_type','question').eq('content_id',contentId)
      error=result.error?.message??null
    } else {
      const result=await s.from('fenix_content_votes').insert({user_id:userId,content_type:'question',content_id:contentId,value:1})
      error=result.error?.message??null
    }
    if(error){setMessage(locale==='bn'?'Vote আপডেট করা যায়নি।':'Could not update vote.');return}
    setQuestions(value=>value.map(q=>q.id===contentId?{...q,score:Math.max(0,(q.score??0)+(old?-1:1))}:q))
  }

  const visibleQuestions=useMemo(()=>{
    if(tab==='following') return questions.filter(q=>(q.topic_id&&followed.includes(q.topic_id)) || followedProfiles.includes(q.author_id))
    return questions
  },[tab,questions,followed,followedProfiles])

  const feedItems=useMemo(()=>{
    if(tab==='questions') return visibleQuestions.map(q=>({kind:'question' as const,time:q.created_at,data:q}))
    if(tab==='news') return news.map(n=>({kind:'news' as const,time:n.published_at??'',data:n}))
    const availablePosts=tab==='following' ? posts.filter(p=>followedProfiles.includes(p.author_id)) : posts
    const all=[] as Array<{kind:'post'|'question';time:string;data:PostRow|QuestionRow}>
    if(tab==='following') all.push(...visibleQuestions.map(q=>({kind:'question' as const,time:q.created_at,data:q})))
    all.push(...availablePosts.map(p=>({kind:'post' as const,time:p.created_at,data:p})))
    return all.sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime())
  },[tab,visibleQuestions,news,posts,followedProfiles])

  const copy=locale==='bn'?{title:'FeniX Feed',intro:'আপনার FeniX community-এর post দেখুন, নিজের update শেয়ার করুন এবং local people-এর সাথে connected থাকুন।',ask:'প্রশ্ন করুন',post:'Post',placeholderTitle:'আপনার প্রশ্ন কী?',placeholderBody:'প্রশ্নটি বিস্তারিত লিখুন…',submit:'Publish',empty:'এখনও কোনো content নেই।',following:'Following',latest:'Latest',questions:'Questions',news:'News',forYou:'For You',follow:'Follow',followingLabel:'Following',answers:'উত্তর',vote:'Helpful',read:'Read News',login:'Login করে প্রশ্ন/উত্তর করুন',topic:'Topic',share:'Share',save:'Save'}
  :{title:'FeniX Feed',intro:'Your social home for FeniX posts, local people and community activity.',ask:'Ask Question',post:'Post',placeholderTitle:'What is your question?',placeholderBody:'Add context, details or your experience…',submit:'Publish',empty:'No content yet.',following:'Following',latest:'Latest',questions:'Questions',news:'News',forYou:'For You',follow:'Follow',followingLabel:'Following',answers:'answers',vote:'Helpful',read:'Read News',login:'Sign in to ask or answer',topic:'Topic',share:'Share',save:'Save'}

  return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6">
    <header><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">FeniX Knowledge Network</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">{copy.intro}</p></header>

    <div className="sticky top-16 z-20 mt-6 overflow-x-auto rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-1" role="tablist" aria-label={locale==='bn'?'ফিডের ধরন':'Feed views'}><div className="flex min-w-max gap-1">
      {([['for-you',copy.forYou],['following',copy.following],['latest',copy.latest],['questions',copy.questions],['news',copy.news]] as const).map(([id,text])=><button key={id} id={`feed-tab-${id}`} type="button" role="tab" aria-selected={tab===id} aria-controls={`feed-panel-${id}`} onClick={()=>changeTab(id)} className={`rounded-xl px-3 py-2.5 text-xs font-bold transition ${tab===id?'bg-[var(--fx-primary-strong)] text-white':'text-[var(--fx-muted)] hover:bg-[var(--fx-primary-soft)] hover:text-[var(--fx-primary-strong)]'}`}>{text}</button>)}
    </div></div>

    {userId&&<section className="mt-4 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
      <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>{clearPostImages();setComposer('question')}} className={`rounded-xl px-3 py-2 text-xs font-bold ${composer==='question'?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':''}`}><Question size={15} className="mr-1 inline"/> {copy.ask}</button><button type="button" onClick={()=>setComposer('post')} className={`rounded-xl px-3 py-2 text-xs font-bold ${composer==='post'?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':''}`}><PaperPlaneRight size={15} className="mr-1 inline"/> {copy.post}</button></div>
      {composer==='question'?<div className="mt-3 space-y-2"><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={240} placeholder={copy.placeholderTitle} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm font-bold outline-none"/><textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={12000} rows={4} placeholder={copy.placeholderBody} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7 outline-none"/><div className="flex flex-wrap items-center gap-2"><select value={topicId} onChange={e=>setTopicId(e.target.value)} className="rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 text-xs"><option value="">{copy.topic}</option>{topics.map(t=><option key={t.id} value={t.id}>{label(t,locale)}</option>)}</select><button disabled={busy||title.trim().length<8||!body.trim()} onClick={()=>void ask()} className="ml-auto rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Plus size={15} className="mr-1 inline"/>{copy.submit}</button></div></div>
      :<div className="mt-3"><textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} rows={4} placeholder={locale==='bn'?'আপনি কী শেয়ার করতে চান?':'What would you like to share?'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/>{postImages.length>0&&<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{postImages.map(image=><div key={image.id} className="relative overflow-hidden rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)]"><img src={image.previewUrl} alt="" className="aspect-square h-full w-full object-cover"/><button type="button" onClick={()=>removePostImage(image.id)} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"><X size={15}/></button><span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">{Math.round(image.byteSize/1024)}KB</span></div>)}</div>}<div className="mt-2 flex flex-wrap items-center gap-2"><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ImageSquare size={16}/>{imageBusy?'Preparing…':'Add photos'}<input type="file" accept="image/*" multiple disabled={busy||imageBusy||postImages.length>=4} className="sr-only" onChange={e=>{void selectPostImages(e.target.files);e.currentTarget.value=''}}/></label><span className="text-[10px] text-[var(--fx-muted)]">JPG/PNG/WebP + supported browser formats · smart-composed toward ~300KB · max 400KB · up to 4</span><button disabled={busy||imageBusy||(!body.trim()&&!postImages.length)} onClick={()=>void publishPost()} className="ml-auto rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><UploadSimple size={15} className="mr-1 inline"/>{copy.submit}</button></div></div>}
    </section>}
    {!userId&&<Link href={`${ROUTES.auth.login}?next=${encodeURIComponent(ROUTES.feed)}`} className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-[var(--fx-primary-soft)] text-sm font-bold text-[var(--fx-primary-strong)]">{copy.login}</Link>}
    {message&&<p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs">{message}</p>}

    <div id={`feed-panel-${tab}`} role="tabpanel" aria-labelledby={`feed-tab-${tab}`} tabIndex={0} className="mt-5 outline-none" aria-busy={loading}>
      {loading && loadedTab!==tab ? <FeedSkeleton /> : feedItems.length ? <div className="space-y-3">{feedItems.map(item=>item.kind==='question'?<QuestionCard key={'q'+item.data.id} q={item.data} locale={locale} userId={userId} followedProfiles={followedProfiles} onProfileFollow={toggleProfileFollow} onVote={vote} onFollow={toggleFollow} followed={followed}/>:item.kind==='news'?<NewsCard key={'n'+item.data.id} n={item.data} locale={locale}/>:<PostCard key={'p'+item.data.id} p={item.data} locale={locale} userId={userId} followedProfiles={followedProfiles} onVote={votePost} onFollow={toggleProfileFollow} onSave={togglePostSave} onShare={sharePost} menuOpen={postMenuId===item.data.id} onMenu={()=>setPostMenuId(postMenuId===item.data.id?null:item.data.id)} onCopy={copyPostLink} onReport={reportPost}/>)}</div> : <div className="rounded-[1.7rem] border border-dashed border-[var(--fx-border)] p-10 text-center text-sm text-[var(--fx-muted)]">{copy.empty}</div>}
      {loading && loadedTab===tab && <div className="mt-3 text-center text-[10px] font-semibold text-[var(--fx-muted)]">Refreshing…</div>}
    </div>
  </section></main>
}

function FeedSkeleton(){return <div className="space-y-3" aria-hidden="true">{Array.from({length:4},(_,i)=><div key={i} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="h-4 w-28 animate-pulse rounded bg-[var(--fx-primary-soft)]"/><div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-[var(--fx-primary-soft)]"/><div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--fx-primary-soft)]"/><div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[var(--fx-primary-soft)]"/></div>)}</div>}

function QuestionCard({q,locale,userId,followedProfiles,onProfileFollow,onVote,onFollow,followed}:{q:QuestionRow;locale:string;userId:string|null;followedProfiles:string[];onProfileFollow:(id:string)=>void;onVote:(id:string)=>void;onFollow:(id:string)=>void;followed:string[]}){
  return <article className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
    <div className="flex items-start gap-3">{q.author_avatar_url?<img src={q.author_avatar_url} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-10 w-10 rounded-full object-cover"/>:<UserCircle size={40} className="shrink-0 opacity-40"/>}<div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 text-[11px] text-[var(--fx-muted)]"><span className="font-bold text-[var(--fx-text)]">{q.author_name||q.author_username||'FeniX user'}</span><span>·</span><time>{fmt(q.created_at,locale)}</time>{q.topic_id&&<><span>·</span><span className="font-bold">{q.topic_name}</span></>}{userId&&userId!==q.author_id&&<button type="button" onClick={()=>onProfileFollow(q.author_id)} className="ml-1 font-bold text-[var(--fx-primary-strong)]">{followedProfiles.includes(q.author_id)?(locale==='bn'?'অনুসরণ করছেন':'Following'):(locale==='bn'?'অনুসরণ':'Follow')}</button>}</div>
      <Link href={`/feed/question/${q.id}`} className="mt-2 block text-lg font-black leading-7 hover:underline sm:text-xl">{q.title}</Link>
      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-[var(--fx-muted)]">{q.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={()=>onVote(q.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ThumbsUp size={15}/> {q.score??0} {locale==='bn'?'Helpful':'Helpful'}</button><Link href={`/feed/question/${q.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ChatCircle size={15}/> {q.answer_count??0} {locale==='bn'?'উত্তর':'answers'}</Link>{q.topic_id&&<button onClick={()=>onFollow(q.topic_id!)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold ${followed.includes(q.topic_id)?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border border-[var(--fx-border)]'}`}>{followed.includes(q.topic_id)?'✓ Following':'Follow'}</button>}<button onClick={()=>void navigator.share?.({title:q.title,url:location.origin+`/feed/question/${q.id}`})} className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ShareNetwork size={15}/> Share</button></div>
    </div></div>
  </article>
}

function NewsCard({n,locale}:{n:NewsRow;locale:string}){
  return <article className="overflow-hidden rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)]">
    <div className="flex items-center gap-2 p-5 pb-0 text-[11px] font-bold text-[var(--fx-primary-strong)]"><Newspaper size={16}/><span>FeniX News</span>{n.breaking&&<span className="rounded-full bg-red-500/10 px-2 py-1 text-red-600">Breaking</span>}<span className="ml-auto text-[var(--fx-muted)]">{n.category}</span></div>
    {n.image_url&&<img src={n.image_url} alt="" loading="lazy" decoding="async" className="mt-4 aspect-[16/7] w-full object-cover"/>}
    <div className="p-5 pt-3">
      <Link href={`/news/${n.slug}`} className="block text-lg font-black leading-7 hover:underline">{locale==='bn'?n.title_bn:n.title_en}</Link>
      <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--fx-muted)]">{locale==='bn'?(n.excerpt_bn||n.excerpt_en):(n.excerpt_en||n.excerpt_bn)}</p>
      <div className="mt-4 flex items-center gap-3 text-[11px] text-[var(--fx-muted)]"><span>{n.verification_status.replaceAll('_',' ')}</span>{n.source_name&&<span>· {n.source_name}</span>}<Link href={`/news/${n.slug}`} className="ml-auto font-bold text-[var(--fx-primary-strong)]">Read News →</Link></div>
    </div>
  </article>
}

function PostCard({p,locale,userId,followedProfiles,onVote,onFollow,onSave,onShare,menuOpen,onMenu,onCopy,onReport}:{p:PostRow;locale:string;userId:string|null;followedProfiles:string[];onVote:(id:string)=>void;onFollow:(id:string)=>void;onSave:(id:string)=>void;onShare:(id:string,title?:string)=>void;menuOpen:boolean;onMenu:()=>void;onCopy:(id:string)=>void;onReport:(id:string)=>void}){
  const profileHref=p.author_username?'/profile/'+encodeURIComponent(p.author_username):''
  const isFollowing=followedProfiles.includes(p.author_id)
  return <article className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 sm:p-5">
    <div className="flex items-start gap-3">
      {profileHref?<Link href={profileHref} className="shrink-0">{p.author_avatar_url?<img src={p.author_avatar_url} alt="" loading="lazy" decoding="async" width={42} height={42} className="h-[42px] w-[42px] rounded-full object-cover"/>:<UserCircle size={42} className="opacity-40"/>}</Link>:p.author_avatar_url?<img src={p.author_avatar_url} alt="" loading="lazy" decoding="async" width={42} height={42} className="h-[42px] w-[42px] rounded-full object-cover"/>:<UserCircle size={42} className="opacity-40"/>}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            {profileHref?<Link href={profileHref} className="block truncate text-sm font-bold hover:underline">{p.author_name||p.author_username||'FeniX user'}</Link>:<p className="truncate text-sm font-bold">{p.author_name||p.author_username||'FeniX user'}</p>}
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[var(--fx-muted)]"><time>{fmt(p.created_at,locale)}</time><span>·</span><span>FeniX</span></div>
          </div>
          {userId && userId!==p.author_id && <button type="button" onClick={()=>onFollow(p.author_id)} className={'inline-flex min-h-8 items-center gap-1 rounded-lg px-2.5 text-[10px] font-bold '+(isFollowing?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border border-[var(--fx-border)]')}><UserPlus size={13}/>{isFollowing?(locale==='bn'?'অনুসরণ করছেন':'Following'):(locale==='bn'?'অনুসরণ':'Follow')}</button>}
          <button type="button" aria-label="More options" onClick={onMenu} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-black/[.04] dark:hover:bg-white/[.05]"><DotsThreeVertical size={20}/></button>
        </div>
      </div>
    </div>
    {p.body&&<p className="mt-4 whitespace-pre-wrap text-sm leading-7">{p.body}</p>}
    {p.media?.length>0&&<div className={`mt-4 grid gap-1.5 ${p.media.length===1?'grid-cols-1':p.media.length===2?'grid-cols-2':'grid-cols-2'}`}>{p.media.map(media=><Link key={media.id} href={`/feed/post/${p.id}`} className="overflow-hidden rounded-xl border border-[var(--fx-border)] bg-[var(--fx-primary-soft)]"><img src={media.public_url} alt="" loading="lazy" decoding="async" width={media.width??1200} height={media.height??800} className="max-h-[560px] w-full object-cover"/></Link>)}</div>}
    <div className="mt-3 flex items-center justify-between border-t border-[var(--fx-border)] pt-2">
      <button type="button" onClick={()=>onVote(p.id)} className={'flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold '+(p.liked?'text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)]')}><ThumbsUp size={17} weight={p.liked?'fill':'regular'}/>{locale==='bn'?'Like':'Like'}{p.score>0?' · '+p.score:''}</button>
      <Link href={`/feed/post/${p.id}`} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-[var(--fx-muted)]"><ChatCircle size={17}/>{locale==='bn'?'মন্তব্য':'Comment'}{p.comment_count>0?' · '+p.comment_count:''}</Link>
      <button type="button" onClick={()=>void onShare(p.id,p.author_name||undefined)} className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold text-[var(--fx-muted)]"><ShareNetwork size={17}/>{locale==='bn'?'শেয়ার':'Share'}</button>
      <button type="button" onClick={()=>onSave(p.id)} className={'flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-xs font-bold '+(p.saved?'text-[var(--fx-primary-strong)]':'text-[var(--fx-muted)]')}><BookmarkSimple size={17} weight={p.saved?'fill':'regular'}/>{p.saved?(locale==='bn'?'Saved':'Saved'):(locale==='bn'?'Save':'Save')}</button>
    </div>
    {menuOpen&&<div className="mt-2 grid gap-1 rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-bg)] p-2 shadow-xl">
      <button type="button" onClick={()=>void onShare(p.id,p.author_name||undefined)} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><ShareNetwork size={15}/>{locale==='bn'?'শেয়ার':'Share'}</button>
      <button type="button" onClick={()=>onCopy(p.id)} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><LinkSimple size={15}/>{locale==='bn'?'লিংক কপি':'Copy link'}</button>
      {userId&&userId!==p.author_id&&<button type="button" onClick={()=>onReport(p.id)} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold hover:bg-red-500/10"><WarningCircle size={15}/>{locale==='bn'?'Report':'Report'}</button>}
      <Link href={`/feed/post/${p.id}`} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-left text-xs font-bold hover:bg-[var(--fx-primary-soft)]"><ChatCircle size={15}/>{locale==='bn'?'Post খুলুন':'Open post'}</Link>
    </div>}
  </article>
}
