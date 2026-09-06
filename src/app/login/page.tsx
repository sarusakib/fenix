'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const setAuth = useAuthStore((state) => state.setAuth);
  const resetFailedAttempts = useAuthStore(
    (state) => state.resetFailedAttempts
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: 'user',
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          setAuth(data.session);
          resetFailedAttempts();

          alert('রেজিস্ট্রেশন সফল হয়েছে!');
          router.push('/guide');
          router.refresh();
        } else {
          alert(
            'অ্যাকাউন্ট তৈরি হয়েছে। আগে ইমেইল confirm করতে হবে, তারপর login করুন।'
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (!data.session) {
          throw new Error('Login session তৈরি হয়নি।');
        }

        setAuth(data.session);
        resetFailedAttempts();

        alert('সফলভাবে লগইন হয়েছে!');
        router.push('/guide');
        router.refresh();
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'একটি সমস্যা হয়েছে';

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        color: '#000',
      }}
    >
      <h2 style={{ marginBottom: '15px' }}>
        {isSignUp ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}
      </h2>

      <form onSubmit={handleAuth}>
        {isSignUp && (
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="আপনার পুরো নাম"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="ইমেইল অ্যাড্রেস"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="পাসওয়ার্ড"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? 'প্রসেসিং...'
            : isSignUp
              ? 'সাইন-আপ করুন'
              : 'লগইন করুন'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{
          marginTop: '15px',
          background: 'none',
          border: 'none',
          color: 'blue',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        {isSignUp
          ? 'আগে থেকেই অ্যাকাউন্ট আছে? লগইন করুন'
          : 'নতুন অ্যাকাউন্ট তৈরি করতে চান? সাইন-আপ করুন'}
      </button>
    </div>
  );
}
