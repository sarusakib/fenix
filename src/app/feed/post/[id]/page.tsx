'use client'

import Link from 'next/link'
import { use, useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ChatCircle, PaperPlaneRight, ShareNetwork, ThumbsUp, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import FenixRouteSkeleton from '@/components/loading/FenixRouteSkeleton'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Post={id:string;body:string;created_at:string;author_id:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null}
type Media={id:string;post_id:string;storage_bucket:string;storage_path:string;width:number|null;height:number|null;sort_order:number;public_url:string}
type Comment={id:string;author_id:string;body:string;created_at:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null}

export default function PostPage({params}:{params:Promise<{id:string}>}){
 const {id}=use(params)
 const {locale}=useFenixLocale()
 const [post,setPost]=useState<Post|null>(null)
 const [media,setMedia]=useState<Media[]>([])
 const [comments,setComments]=useState<Comment[]>([])
 const [userId,setUserId]=useState<string|null>(null)
 const [liked,setLiked]=useState(false)
 const [score,setScore]=useState(0)
 const [body,setBody]=useState('')
 const [loading,setLoading]=useState(true)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')

 const load=useCallback(async()=>{
   setLoading(true)
   const s=createClient()
   try{
     const [{data:auth},{data:pv},{data:mv},{data:cv}]=await Promise.all([
       s.auth.getSession(),
       s.from('fenix_public_feed').select('id,body,created_at,author_id,author_name,author_username,author_avatar_url').eq('id',id).maybeSingle(),
       s.from('fenix_post_media').select('id,post_id,storage_bucket,storage_path,width,height,sort_order').eq('post_id',id).order('sort_order',{ascending:true}),
       s.from('fenix_content_comments').select('id,author_id,body,created_at').eq('content_type','post').eq('content_id',id).is('deleted_at',null).order('created_at',{ascending:true}).limit(100),
     ])
     const uid=auth.session?.user?.id??null
     setUserId(uid)
     setPost((pv??null) as Post|null)
     setMedia(((mv??[]) as Array<Omit<Media,'public_url'>>).map(item=>({...item,public_url:s.storage.from(item.storage_bucket).getPublicUrl(item.storage_path).data.publicUrl})))
     const raw=(cv??[]) as Array<{id:string;author_id:string;body:string;created_at:string}>
     if(raw.length){
       const ids=Array.from(new Set(raw.map(x=>x.author_id)))
       const {data:profiles}=await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').in('id',ids)
       const byId=Object.fromEntries(((profiles??[]) as Array<{id:string;full_name:string|null;username:string|null;avatar_url:string|null}>).map(p=>[p.id,p]))
       setComments(raw.map(x=>({...x,author_name:byId[x.author_id]?.full_name??null,author_username:byId[x.author_id]?.username??null,author_avatar_url:byId[x.author_id]?.avatar_url??null})))
     }else setComments([])
     const {data:votes}=await s.from('fenix_content_votes').select('value,user_id').eq('content_type','post').eq('content_id',id)
     setScore((votes??[]).reduce((sum,row)=>sum+Number(row.value??0),0))
     setLiked(Boolean(uid && (votes??[]).some(row=>row.user_id===uid && Number(row.value)>0)))
   }catch{
     setMessage(locale==='bn'?'Post লোড করা যায়নি।':'Could not load this post.')
   }finally{setLoading(false)}
 },[id,locale])

 useEffect(()=>{void load()},[load])

 async function toggleLike(){
   if(!userId){setMessage(locale==='bn'?'Like দিতে Login করুন।':'Sign in to like.');return}
   const s=createClient()
   const result=liked
     ? await s.from('fenix_content_votes').delete().eq('user_id',userId).eq('content_type','post').eq('content_id',id)
     : await s.from('fenix_content_votes').insert({user_id:userId,content_type:'post',content_id:id,value:1})
   if(result.error){setMessage(locale==='bn'?'Like আপডেট করা যায়নি।':'Could not update like.');return}
   setLiked(v=>!v);setScore(v=>Math.max(0,v+(liked?-1:1)))
 }

 async function addComment(){
   const clean=body.trim()
   if(!userId||!clean)return
   setBusy(true);setMessage('')
   const s=createClient()
   const {data,error}=await s.from('fenix_content_comments').insert({author_id:userId,content_type:'post',content_id:id,body:clean}).select('id,author_id,body,created_at').maybeSingle()
   if(error||!data){setMessage(locale==='bn'?'Comment যোগ করা যায়নি।':'Could not add comment.');setBusy(false);return}
   const {data:profile}=await s.from('fenix_public_profiles').select('id,full_name,username,avatar_url').eq('id',userId).maybeSingle()
   setComments(v=>[...v,{...data,author_name:profile?.full_name??null,author_username:profile?.username??null,author_avatar_url:profile?.avatar_url??null} as Comment])
   setBody('');setBusy(false)
 }

 if(loading)return <FenixRouteSkeleton variant="article" />
 if(!post)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-10"><Link href="/feed" className="font-bold">← Feed</Link><p className="mt-8 text-sm text-[var(--fx-muted)]">{message|| (locale==='bn'?'Post পাওয়া যায়নি।':'Post not found.')}</p></section></main>

 return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6">
  <Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feed</Link>
  {message&&<p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs">{message}</p>}
  <article className="mt-5 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7">
   <div className="flex items-center gap-3">{post.author_avatar_url?<img src={post.author_avatar_url} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-10 w-10 rounded-full object-cover"/>:<UserCircle size={40} className="opacity-40"/>}<div><p className="text-sm font-bold">{post.author_name||post.author_username||'FeniX user'}</p><time className="text-[11px] text-[var(--fx-muted)]">{new Date(post.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div>
   {post.body&&<p className="mt-5 whitespace-pre-wrap text-sm leading-8">{post.body}</p>}
   {media.length>0&&<div className={`mt-5 grid gap-2 ${media.length===1?'grid-cols-1':'grid-cols-2'}`}>{media.map(item=><img key={item.id} src={item.public_url} alt="" loading="lazy" decoding="async" width={item.width??1200} height={item.height??800} className="max-h-[620px] w-full rounded-2xl object-cover"/>)}</div>}
   <div className="mt-5 flex flex-wrap items-center gap-2"><button onClick={()=>void toggleLike()} className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold ${liked?'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border-[var(--fx-border)]'}`}><ThumbsUp size={16}/>{locale==='bn'?'Like':'Like'} · {score}</button><button onClick={()=>document.getElementById('comments')?.scrollIntoView({behavior:'smooth'})} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ChatCircle size={16}/>{locale==='bn'?'মন্তব্য':'Comments'} · {comments.length}</button><button onClick={()=>void navigator.share?.({title:post.author_name||'FeniX post',url:location.href})} className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--fx-border)] px-3 text-xs font-bold"><ShareNetwork size={16}/>{locale==='bn'?'শেয়ার':'Share'}</button></div>
  </article>

  <section id="comments" className="mt-7">
   <h2 className="text-xl font-black">{locale==='bn'?'মন্তব্য':'Comments'} ({comments.length})</h2>
   {userId&&<div className="mt-3 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} maxLength={3000} placeholder={locale==='bn'?'মন্তব্য লিখুন…':'Write a comment…'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/><button disabled={busy||!body.trim()} onClick={()=>void addComment()} className="mt-2 ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--fx-primary-strong)] px-4 text-xs font-bold text-white disabled:opacity-40"><PaperPlaneRight size={15}/>{locale==='bn'?'পাঠান':'Send'}</button></div>}
   {!userId&&<Link href={`/login?next=/feed/post/${id}`} className="mt-3 block rounded-2xl bg-[var(--fx-primary-soft)] p-4 text-center text-sm font-bold text-[var(--fx-primary-strong)]">{locale==='bn'?'মন্তব্য করতে Login করুন':'Sign in to comment'}</Link>}
   <div className="mt-3 space-y-2">{comments.map(comment=><article key={comment.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><div className="flex items-center gap-2">{comment.author_avatar_url?<img src={comment.author_avatar_url} alt="" loading="lazy" decoding="async" width={32} height={32} className="h-8 w-8 rounded-full object-cover"/>:<UserCircle size={32} className="opacity-40"/>}<div><p className="text-xs font-bold">{comment.author_name||comment.author_username||'FeniX user'}</p><time className="text-[10px] text-[var(--fx-muted)]">{new Date(comment.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.body}</p></article>)}</div>
  </section>
 </section></main>
}
