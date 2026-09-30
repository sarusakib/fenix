'use client'

import Link from 'next/link'
import { use, useCallback, useEffect, useState } from 'react'
import { ArrowLeft, BookmarkSimple, PaperPlaneRight, ShareNetwork, ThumbsUp, UserCircle } from '@phosphor-icons/react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { useFenixLocale } from '@/components/i18n/FenixLocaleProvider'

type Answer={id:string;body:string;created_at:string;updated_at:string;author_id:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null;score:number}
type Question={id:string;title:string;body:string;created_at:string;author_id:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null;topic_id:string|null;topic_name:string|null}
type Comment={id:string;author_id:string;body:string;created_at:string;author_name:string|null;author_username:string|null;author_avatar_url:string|null}

export default function QuestionPage({params}:{params:Promise<{id:string}>}){
 const {id}=use(params);
 const {locale}=useFenixLocale();
 const [q,setQ]=useState<Question|null>(null);
 const [answers,setAnswers]=useState<Answer[]>([]);
 const [comments,setComments]=useState<Comment[]>([]);
 const [userId,setUserId]=useState<string|null>(null);
 const [body,setBody]=useState('');
 const [commentBody,setCommentBody]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saved,setSaved]=useState(false);
 const [message,setMessage]=useState('');

 const load=useCallback(async()=>{
   setLoading(true);
   const s=createClient();
   try{
     const [{data:auth},{data:qv},{data:av},{data:cv}]=await Promise.all([
       s.auth.getUser(),
       s.from('fenix_public_question_feed').select('id,title,body,created_at,author_id,topic_id,author_name,author_username,author_avatar_url,topic_name_bn,topic_name_en').eq('id',id).maybeSingle(),
       s.from('fenix_public_answer_feed').select('id,question_id,body,created_at,updated_at,author_id,author_name,author_username,author_avatar_url,score').eq('question_id',id).order('created_at',{ascending:true}),
       s.from('fenix_content_comments').select('id,author_id,body,created_at').eq('content_type','question').eq('content_id',id).order('created_at',{ascending:true}),
     ]);
     const uid=auth.user?.id??null;
     setUserId(uid);
     if(qv){
       const row=qv as unknown as Record<string,unknown>;
       setQ({...qv,topic_name:locale==='bn'?(String(row.topic_name_bn??'')||String(row.topic_name_en??'')):(String(row.topic_name_en??'')||String(row.topic_name_bn??''))} as Question);
     }else setQ(null);
     setAnswers((av??[]) as Answer[]);
     const commentRows=(cv??[]) as Array<{id:string;author_id:string;body:string;created_at:string}>;
   if(loading)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-10 sm:px-6"><div className="space-y-3" aria-hidden="true">{Array.from({length:4},(_,i)=><div key={i} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="h-4 w-28 animate-pulse rounded bg-[var(--fx-primary-soft)]"/><div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-[var(--fx-primary-soft)]"/><div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--fx-primary-soft)]"/></div>)}</div></section></main>
 if(!q)return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 py-10"><Link href="/feed" className="font-bold">← {locale==='bn'?'Feed':'Feed'}</Link><p className="mt-8 text-sm text-[var(--fx-muted)]">{message|| (locale==='bn'?'Question পাওয়া যায়নি।':'Question not found.')}</p></section></main>
 return <main className="min-h-dvh"><Navbar/><section className="mx-auto max-w-3xl px-4 pb-28 pt-7 sm:px-6"><Link href="/feed" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--fx-border)] px-3.5 text-xs font-bold"><ArrowLeft size={16}/> Feed</Link>
 {message&&<p className="mt-3 rounded-xl bg-[var(--fx-primary-soft)] p-3 text-xs">{message}</p>}
 <article className="mt-5 rounded-[2rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5 sm:p-7"><div className="flex items-center gap-3">{q.author_avatar_url?<img src={q.author_avatar_url} alt="" loading="lazy" decoding="async" width={40} height={40} className="h-10 w-10 rounded-full object-cover"/>:<UserCircle size={40} className="opacity-40"/>}<div><p className="text-sm font-bold">{q.author_name||q.author_username||'FeniX user'}</p><time className="text-[11px] text-[var(--fx-muted)]">{new Date(q.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div><h1 className="mt-5 text-2xl font-black leading-9 sm:text-4xl">{q.title}</h1>{q.topic_name&&<p className="mt-2 text-xs font-bold text-[var(--fx-primary-strong)]">{q.topic_name}</p>}<p className="mt-5 whitespace-pre-wrap text-sm leading-8">{q.body}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>void navigator.share?.({title:q.title,url:location.href})} className="rounded-xl border border-[var(--fx-border)] px-3 py-2 text-xs font-bold"><ShareNetwork size={15} className="mr-1 inline"/>Share</button><button onClick={()=>void toggleBookmark()} className={`rounded-xl border px-3 py-2 text-xs font-bold ${saved?'border-[var(--fx-primary)]/20 bg-[var(--fx-primary-soft)] text-[var(--fx-primary-strong)]':'border-[var(--fx-border)]'}`}><BookmarkSimple size={15} className="mr-1 inline"/>{saved?(locale==='bn'?'Saved':'Saved'):(locale==='bn'?'Save':'Save')}</button></div></article>
 <section className="mt-5"><h2 className="text-xl font-black">{locale==='bn'?'উত্তর':'Answers'} ({answers.length})</h2>{userId?<div className="mt-3 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} maxLength={20000} placeholder={locale==='bn'?'আপনার উত্তর লিখুন…':'Write your answer…'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/><button disabled={busy||!body.trim()} onClick={()=>void answer()} className="mt-2 ml-auto block rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"><PaperPlaneRight size={15} className="mr-1 inline"/> {locale==='bn'?'উত্তর দিন':'Answer'}</button></div>:<Link href={`/login?next=/feed/question/${id}`} className="mt-3 block rounded-2xl bg-[var(--fx-primary-soft)] p-4 text-center text-sm font-bold text-[var(--fx-primary-strong)]">{locale==='bn'?'উত্তর দিতে Login করুন':'Sign in to answer'}</Link>}
 <div className="mt-4 space-y-3">{answers.map(a=><article key={a.id} className="rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-5"><div className="flex items-center gap-3">{a.author_avatar_url?<img src={a.author_avatar_url} alt="" loading="lazy" decoding="async" width={36} height={36} className="h-9 w-9 rounded-full object-cover"/>:<UserCircle size={36} className="opacity-40"/>}<div><p className="text-sm font-bold">{a.author_name||a.author_username||'FeniX user'}</p><time className="text-[11px] text-[var(--fx-muted)]">{new Date(a.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{a.body}</p><button onClick={()=>void vote(a.id)} className="mt-3 rounded-xl border border-[var(--fx-border)] px-3 py-2 text-xs font-bold"><ThumbsUp size={15} className="mr-1 inline"/>{locale==='bn'?'Helpful':'Helpful'} · {a.score}</button></article>)}</div>
 </section>
 <section className="mt-7"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">{locale==='bn'?'Comments':'Comments'} ({comments.length})</h2></div>{userId&&<div className="mt-3 rounded-[1.7rem] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><textarea value={commentBody} onChange={e=>setCommentBody(e.target.value)} rows={3} maxLength={3000} placeholder={locale==='bn'?'মন্তব্য লিখুন…':'Write a comment…'} className="w-full rounded-xl border border-[var(--fx-border)] bg-transparent p-3 text-sm leading-7"/><button disabled={busy||!commentBody.trim()} onClick={()=>void addComment()} className="mt-2 ml-auto block rounded-xl bg-[var(--fx-primary-strong)] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{locale==='bn'?'Comment দিন':'Comment'}</button></div>}
 <div className="mt-3 space-y-2">{comments.map(comment=><article key={comment.id} className="rounded-2xl border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4"><div className="flex items-center gap-2">{comment.author_avatar_url?<img src={comment.author_avatar_url} alt="" loading="lazy" decoding="async" width={32} height={32} className="h-8 w-8 rounded-full object-cover"/>:<UserCircle size={32} className="opacity-40"/>}<div><p className="text-xs font-bold">{comment.author_name||comment.author_username||'FeniX user'}</p><time className="text-[10px] text-[var(--fx-muted)]">{new Date(comment.created_at).toLocaleString(locale==='bn'?'bn-BD':'en-BD')}</time></div></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.body}</p></article>)}</div>
 </section>
 </section></main>
}
