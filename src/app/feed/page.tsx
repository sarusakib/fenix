'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookmarkSimple, CaretDown, ChatCircle, Flag, Newspaper, PencilSimple, PaperPlaneRight, Plus, Question, ShareNetwork, ThumbsUp, Trash, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Topic = { id:string; slug:string; name_bn:string; name_en:string }
type QuestionRow = {
  id:string; title:string; body:string; created_at:string; author_id:string;
  topic_id:string|null; author_name:string|null; author_username:string|null; author_avatar_url:string|null;
  topic_name:string|null; answer_count?:number; score?:number;
}
type NewsRow = { id:string; slug:string; title_bn:string; title_en:string; excerpt_bn:string|null; excerpt_en:string|null; category:string; verification_status:string; featured:boolean; breaking:boolean; published_at:string|null; source_name:string|null }
type PostRow = { id:string; body:string; created_at:string; author_id:string; author_name:string|null; author_username:string|null; author_avatar_url:string|null }

const fmt=(v:string,locale:string)=>new Date(v).toLocaleString(locale==='bn'?'bn-BD':'en-BD',{dateStyle:'medium',timeStyle:'short'})
const label=(t:Topic,locale:string)=>locale==='bn'?t.name_bn:t.name_en

export default function FeedPage(){
  const {locale}=useFenixLocale()
  const [tab,setTab]=useState<'for-you'|'following'|'latest'|'questions'|'news'>('for-you')
  const [questions,setQuestions]=useState<QuestionRow[]>([])
  const [news,setNews]=useState<NewsRow[]>([])
  const [posts,setPosts]=useState<PostRow[]>([])
  const [topics,setTopics]=useState<Topic[]>([])
  const [followed,setFollowed]=useState<string[]>([])
  const [userId,setUserId]=useState<string|null>(null)
  const [title,setTitle]=useState('')
  const [body,setBody]=useState('')
  const [topicId,setTopicId]=useState('')
  const [composer,setComposer]=useState<'question'|'post'>('question')
  const [busy,setBusy]=useState(false)
  const [message,setMessage]=useState('')

  const load=useCallback(async()=>{
    const s=createClient()
    const [{data:auth},{data:q},{data:n},{data:p},{data:t}]=await Promise.all([
      s.auth.getUser(),
      s.from('fenix_public_question_feed').select('*').order('created_at',{ascending:false}).limit(50),
      s.from('news_posts').select('id,slug,title_bn,title_en,excerpt_bn,excerpt_en,category,verification_status,featured,breaking,published_at,source_name').eq('status','published').order('published_at',{ascending:false}).limit(30),
      s.from('fenix_public_feed').select('*').order('created_at',{ascending:false}).limit(30),
      s.from('fenix_topics').select('id,slug,name_bn,name_en').order('name_en'),
    ])
    const uid=auth.user?.id??null
    setUserId(uid)
    if(uid){
      const {data:f}=await s.from('fenix_topic_follows').select('topic_id').eq('user_id',uid)
      setFollowed((f??[]).map(x=>x.topic_id))
    } else setFollowed([])
    const qq=(q??[]).map((x:any)=>({
      ...x,author_name:x.profiles?.full_name??null,author_username:x.profiles?.username??null,author_avatar_url:x.profiles?.avatar_url??null,
      topic_name:x.fenix_topics?.name_en??null,
    })) as QuestionRow[]
    setQuestions(qq); setNews((n??[]) as NewsRow[]); setPosts((p??[]) as PostRow[]); setTopics((t??[]) as Topic[])
  },[])

  useEffect(()=>{void load()},[load])

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

  async function publishPost(){
    const clean=body.trim()
    if(!clean||!userId)return
    setBusy(true);setMessage('')
    const s=createClient()
    const {error}=await s.from('fenix_posts').insert({author_id:userId,body:clean,visibility:'public'})
    if(error)setMessage(locale==='bn'?'Post প্রকাশ করা যায়নি।':'Could not publish the post.')
    else{setBody('');setMessage(locale==='bn'?'Post প্রকাশ হয়েছে।':'Post published.');await load()}
    setBusy(false)
  }

  async function toggleFollow(id:string){
    if(!userId)return
    const s=createClient(), exists=followed.includes(id)
    setBusy(true)
    const r=exists?await s.from('fenix_topic_follows').delete().eq('user_id',userId).eq('topic_id',id):await s.from('fenix_topic_follows').insert({user_id:userId,topic_id:id})
    if(!r.error)setFollowed(v=>exists?v.filter(x=>x!==id):[...v,id])
    setBusy(false)
  }

  async function vote(contentId:string){
    if(!userId){setMessage(locale==='bn'?'Vote দিতে Login করুন।':'Sign in to vote.');return}
    const s=createClient()
    const {data:old}=await s.from('fenix_content_votes').select('value').eq('user_id',userId).eq('content_type','question').eq('content_id',contentId).maybeSingle()
    if(old) await s.from('fenix_content_votes').delete().eq('user_id',userId).eq('content_type','question').eq('content_id',contentId)
    else await s.from('fenix_content_votes').insert({user_id:userId,content_type:'question',content_id:contentId,value:1})
    await load()
  }

  const visibleQuestions=useMemo(()=>{
    if(tab==='following') return questions.filter(q=>q.topic_id&&followed.includes(q.topic_id))
    return questions
  },[tab,questions,followed])

  const feedItems=useMemo(()=>{
    if(tab==='questions'||tab==='following')return visibleQuestions.map(q=>({kind:'question' as const,time:q.created_at,data:q}))
    if(tab==='news')return news.map(n=>({kind:'news' as const,time:n.published_at??'',data:n}))
    const all=[...visibleQuestions.map(q=>({kind:'question' as const,time:q.created_at,data:q})),...news.map(n=>({kind:'news' as const,time:n.published_at??'',data:n})),...(tab==='latest'?posts.map(p=>({kind:'post' as const,time:p.created_at,data:p})):[])]
    return all.sort((a,b)=>new Date(b.time).getTime()-new Date(a.time).getTime())
  },[tab,visibleQuestions,news,posts])

  const copy=locale==='bn'?{title:'FeniX Feed',intro:'Quora-এর মতো প্রশ্ন করুন, জ্ঞান শেয়ার করুন, উত্তর পড়ুন—সাথে FeniX News একই feed-এ।',ask:'প্রশ্ন করুন',post:'Post',placeholderTitle:'আপনার প্রশ্ন কী?',placeholderBody:'প্রশ্নটি বিস্তারিত লিখুন…',submit:'Publish',empty:'এখনও কোনো content নেই।',following:'Following',latest:'Latest',questions:'Questions',news:'News',forYou:'For You',follow:'Follow',followingLabel:'Following',answers:'উত্তর',vote:'Helpful',read:'Read News',login:'Login করে প্রশ্ন/উত্তর করুন',topic:'Topic',share:'Share',save:'Save'}
  :{title:'FeniX Feed',intro:'A Quora-style knowledge feed for questions, answers, local knowledge and FeniX News.',ask:'Ask Question',post:'Post',placeholderTitle:'What is your question?',placeholderBody:'Add context, details or your experience…',submit:'Publish',empty:'No content yet.',following:'Following',latest:'Latest',questions:'Questions',news:'News',forYou:'For You',follow:'Follow',followingLabel:'Following',answers:'answers',vote:'Helpful',read:'Read News',login:'Sign in to ask or answer',topic:'Topic',share:'Share',save:'Save'}

  return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-4xl px-4 pb-28 pt-7 sm:px-6">
    <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> {locale==='bn'?'হোম':'Home'}</Link>
    <header className="mt-6"><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--fx-primary-strong)]">FeniX Knowledge Network</p><h1 className="mt-2 text-3xl font-black sm:text-5xl">{copy.title}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--fx-muted)]">{copy.intro}</p></header>

    <div className="sticky top-16 z-20 mt-6 overflow-x-auto rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-1"><div className="flex min-w-max gap-1">
      {([['for-you',copy.forYou],['following',copy.following],['latest',copy.latest],['questions',copy.questions],['news',copy.news]] as const).map(([id,text])=><button key={id} type="button" onClick={()=>setTab(id)} className={`rounded-xl px-3 py-2.5 text-xs font-bold ${tab===id?'bg-[var(--fx-primary-strong)] text-white':'text-[var(--fx-muted)]'}`}>{text}</button>)}
    </div></div>

    {userId&&<section className="mt-4 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4">
      <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setComposer('question')} className={`rounded-xl px-3 py-2 text-xs font-bold ${composer==='question'?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':''}`}><Question size={15} className="mr-1 inline"/> {copy.ask}</button><button type="button" onClick={()=>setComposer('post')} className={`rounded-xl px-3 py-2 text-xs font-bold ${composer==='post'?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':''}`}><PaperPlaneRight size={15} className="mr-1 inline"/> {copy.post}</button></div>
      {composer==='question'?<div className="mt-3 space-y-2"><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={240} placeholder={copy.placeholderTitle} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm font-bold outline-none"/><textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={12000} rows={4} placeholder={copy.placeholderBody} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7 outline-none"/><div className="flex flex-wrap items-center gap-2"><select value={topicId} onChange={e=>setTopicId(e.target.value)} className="rounded-xl border border-[var(--fx-border)] bg-[var(--fx-surface)] px-3 py-2 text-xs"><option value="">{copy.topic}</option>{topics.map(t=><option key={t.id} value={t.id}>{label(t,locale)}</option>)}</select><button disabled={busy||title.trim().length<8||!body.trim()} onClick={()=>void ask()} className="ml-auto rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Plus size={15} className="mr-1 inline"/>{copy.submit}</button></div></div>
      :<div className="mt-3"><textarea value={body} onChange={e=>setBody(e.target.value)} maxLength={5000} rows={4} placeholder={locale==='bn'?'আপনি কী শেয়ার করতে চান?':'What would you like to share?'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/><button disabled={busy||!body.trim()} onClick={()=>void publishPost()} className="mt-2 ml-auto block rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{copy.submit}</button></div>}
    </section>}
    {!userId&&<Link href="/login?next=/feed" className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-[var(--fx-primary-soft)] text-sm font-bold text-[var(--fx-primary-strong)]">{copy.login}</Link>}
    {message&&<p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs">{message}</p>}

    <div className="mt-5 space-y-3">{feedItems.length?feedItems.map(item=>item.kind==='question'?<QuestionCard key={'q'+item.data.id} q={item.data} locale={locale} userId={userId} onVote={vote} onFollow={toggleFollow} followed={followed}/>:item.kind==='news'?<NewsCard key={'n'+item.data.id} n={item.data} locale={locale}/>:<PostCard key={'p'+item.data.id} p={item.data} locale={locale}/>):<div className="rounded-[1.7rem] border border-dashed border-[var(--fx-border)] p-10 text-center text-sm text-[var(--fx-muted)]">{copy.empty}</div>}</div>
  </section></main>
}

function QuestionCard({q,locale,userId,onVote,onFollow,followed}:{q:QuestionRow;locale:string;userId:string|null;onVote:(id:string)=>void;onFollow:(id:string)=>void;followed:string[]}){
  const [score,setScore]=useState(q.score??0)
  const [answerCount,setAnswerCount]=useState(q.answer_count??0)
  useEffect(()=>{setScore(q.score??0);setAnswerCount(q.answer_count??0)},[q.score,q.answer_count])
  return <article className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5">
    <div className="flex items-start gap-3">{q.author_avatar_url?<img src={q.author_avatar_url} alt="" className="h-10 w-10 rounded-full object-cover"/>:<UserCircle size={40} className="shrink-0 opacity-40"/>}<div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--fx-muted)]"><span className="font-bold text-[var(--fx-text)]">{q.author_name||q.author_username||'FeniX user'}</span><span>·</span><time>{fmt(q.created_at,locale)}</time>{q.topic_id&&<><span>·</span><span className="font-bold">{q.topic_name}</span></>}</div>
      <Link href={`/feed/question/${q.id}`} className="mt-2 block text-lg font-black leading-7 hover:underline sm:text-xl">{q.title}</Link>
      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-7 text-[var(--fx-muted)]">{q.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2"><button onClick={()=>onVote(q.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ThumbsUp size={15}/> {q.score??0} {locale==='bn'?'Helpful':'Helpful'}</button><Link href={`/feed/question/${q.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ChatCircle size={15}/> {q.answer_count??0} {locale==='bn'?'উত্তর':'answers'}</Link>{q.topic_id&&<button onClick={()=>onFollow(q.topic_id!)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold ${followed.includes(q.topic_id)?'bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border border-[var(--fx-border)]'}`}>{followed.includes(q.topic_id)?'✓ Following':'Follow'}</button>}<button onClick={()=>void navigator.share?.({title:q.title,url:location.origin+`/feed/question/${q.id}`})} className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ShareNetwork size={15}/> Share</button></div>
    </div></div>
  </article>
}

function NewsCard({n,locale}:{n:NewsRow;locale:string}){
  return <article className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-2 text-[11px] font-bold text-[var(--fx-primary-strong)]"><Newspaper size={16}/><span>FeniX News</span>{n.breaking&&<span className="rounded-full bg-red-500/10 px-2 py-1 text-red-600">Breaking</span>}<span className="ml-auto text-[var(--fx-muted)]">{n.category}</span></div><Link href={`/news/${n.slug}`} className="mt-3 block text-lg font-black leading-7 hover:underline">{locale==='bn'?n.title_bn:n.title_en}</Link><p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--fx-muted)]">{locale==='bn'?(n.excerpt_bn||n.excerpt_en):(n.excerpt_en||n.excerpt_bn)}</p><div className="mt-4 flex items-center gap-3 text-[11px] text-[var(--fx-muted)]"><span>{n.verification_status.replaceAll('_',' ')}</span>{n.source_name&&<span>· {n.source_name}</span>}<Link href={`/news/${n.slug}`} className="ml-auto font-bold text-[var(--fx-primary-strong)]">Read News →</Link></div></article>
}

function PostCard({p,locale}:{p:PostRow;locale:string}){
  return <article className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-3">{p.author_avatar_url?<img src={p.author_avatar_url} alt="" className="h-9 w-9 rounded-full object-cover"/>:<UserCircle size={36} className="opacity-40"/>}<div><p className="text-sm font-bold">{p.author_name||p.author_username||'FeniX user'}</p><time className="text-[11px] text-[var(--fx-muted)]">{fmt(p.created_at,locale)}</time></div></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{p.body}</p></article>
}
