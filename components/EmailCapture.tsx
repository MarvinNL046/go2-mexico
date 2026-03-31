import { useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from './Toast';

type Variant = 'inline' | 'sidebar' | 'hero';

interface EmailCaptureProps {
  variant?: Variant;
  heading?: string;
  subtext?: string;
  buttonText?: string;
  className?: string;
}

export default function EmailCapture({
  variant = 'inline',
  heading,
  subtext,
  buttonText,
  className = '',
}: EmailCaptureProps) {
  const { locale } = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const defaults: Record<Variant, { heading: string; subtext: string; buttonText: string }> = {
    inline: {
      heading: 'Get Free Mexico Travel Tips',
      subtext: 'Join 1,000+ travelers. Weekly guides, hidden gems, and budget hacks — straight to your inbox.',
      buttonText: 'Subscribe',
    },
    sidebar: {
      heading: 'Get Mexico Updates',
      subtext: 'Weekly travel tips and guides',
      buttonText: 'Subscribe',
    },
    hero: {
      heading: 'Plan Your Perfect Mexico Trip',
      subtext: 'Get insider tips, budget hacks, and hidden gems delivered weekly. Free forever.',
      buttonText: 'Get Free Tips',
    },
  };

  const d = defaults[variant];
  const h = heading || d.heading;
  const s = subtext || d.subtext;
  const b = buttonText || d.buttonText;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, site: 'go2mexico', locale: locale || 'en' }),
      });
      if (!res.ok) throw new Error();
      setStatus('idle');
      setEmail('');
      toast.success("You're subscribed! Welcome aboard.");
    } catch {
      setStatus('error');
    }
  };

  if (variant === 'sidebar') {
    return (
      <div className={`bg-gray-900 text-white rounded-2xl p-6 ${className}`}>
        <span className="text-brand-accent text-sm font-medium">Stay in the loop</span>
        <h3 className="text-xl font-bold font-display mb-2">{h}</h3>
        <p className="mb-4 text-sm opacity-90">{s}</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="Your email"
            required
            className="w-full px-4 py-2 rounded-xl text-gray-900 mb-3"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-brand-accent text-white font-medium py-2 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : b}
          </button>
          {status === 'error' && (
            <p className="text-red-300 text-xs mt-2 text-center">Something went wrong. Try again.</p>
          )}
        </form>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-bold font-display text-gray-900 mb-1">{h}</h3>
        <p className="text-sm text-gray-600 mb-3">{s}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-brand-accent text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? '...' : b}
          </button>
        </form>
        {status === 'error' && (
          <p className="text-red-500 text-xs mt-2">Something went wrong. Try again.</p>
        )}
        <p className="text-xs text-gray-400 mt-2">No spam, unsubscribe anytime.</p>
      </div>
    );
  }

  // inline variant (default) — mid-article CTA
  return (
    <div className={`bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 border border-brand-primary/15 rounded-2xl p-6 my-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold font-display text-gray-900 mb-1">{h}</h3>
          <p className="text-sm text-gray-600">{s}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 sm:min-w-[320px]">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-brand-accent text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 whitespace-nowrap text-sm"
          >
            {status === 'loading' ? '...' : b}
          </button>
        </form>
      </div>
      {status === 'error' && (
        <p className="text-red-500 text-xs mt-2">Something went wrong. Try again.</p>
      )}
      <p className="text-xs text-gray-400 mt-2">Free forever. No spam, unsubscribe anytime.</p>
    </div>
  );
}
