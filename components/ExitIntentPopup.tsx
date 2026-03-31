import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

const ExitIntentPopup = () => {
  const { locale } = useRouter();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !sessionStorage.getItem('exitPopupShown')) {
      sessionStorage.setItem('exitPopupShown', '1');
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    // Only on desktop, and only if not already shown this session
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('exitPopupShown')) return;
    if (window.innerWidth < 768) return;

    // Delay binding so it doesn't trigger on page load
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleSubscribe = async (e: React.FormEvent) => {
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
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const close = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={close}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-2">You&apos;re in!</h3>
            <p className="text-gray-600 text-sm">Check your inbox for Mexico travel tips.</p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="w-14 h-14 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h3 className="font-display text-xl font-bold text-gray-900 text-center mb-2">
              Wait — don&apos;t miss out!
            </h3>
            <p className="text-gray-600 text-sm text-center mb-6">
              Get free Mexico travel tips, hidden gems, and budget hacks straight to your inbox. No spam, unsubscribe anytime.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                autoFocus
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-brand-accent text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Subscribing...' : 'Get Free Travel Tips'}
              </button>
              {status === 'error' && (
                <p className="text-red-500 text-xs text-center">Something went wrong. Please try again.</p>
              )}
            </form>

            <p className="text-gray-400 text-xs text-center mt-4">
              Join 1,000+ Mexico travelers. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        .animate-in {
          animation: popIn 0.3s ease-out;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ExitIntentPopup;
