import { useState } from 'react';
import Image from 'next/image';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from '../hooks/useTranslation';
import { siteConfig } from '../site.config';

export default function Contact() {
  const { t } = useTranslation('common');
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to an API endpoint
    setSubmitted(true);
  };

  return (
    <>
      <SEOHead
        title={`Contact Us - ${siteConfig.name}`}
        description={`Get in touch with the ${siteConfig.name} team. Questions about Mexico travel, content partnerships, or feedback - we'd love to hear from you.`}
      />

      {/* Hero */}
      <section className="relative min-h-[25vh] flex items-center">
        <Image src="/images/heroes/contact-hero.webp" alt="Welcoming town scene in Mexico" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('nav.contact')}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Have a question about traveling in Mexico? We are here to help.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { name: t('nav.home'), href: '/' },
            { name: t('nav.contact'), href: '/contact/' },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-brand-primary-50 rounded-xl p-6">
              <Mail className="w-8 h-8 text-brand-primary mb-3" />
              <h3 className="font-bold text-brand-secondary mb-1">Email</h3>
              <p className="text-gray-600 text-sm">
                hello@{siteConfig.domain}
              </p>
            </div>

            <div className="bg-brand-accent-50 rounded-xl p-6">
              <MessageSquare className="w-8 h-8 text-brand-accent mb-3" />
              <h3 className="font-bold text-brand-secondary mb-1">
                Content Partnerships
              </h3>
              <p className="text-gray-600 text-sm">
                Interested in partnering with us? Reach out with your proposal.
              </p>
            </div>

            <div className="bg-brand-secondary-50 rounded-xl p-6">
              <MapPin className="w-8 h-8 text-brand-secondary mb-3" />
              <h3 className="font-bold text-brand-secondary mb-1">
                Corrections
              </h3>
              <p className="text-gray-600 text-sm">
                Found inaccurate information? Let us know and we will update it promptly.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Message Sent
                </h3>
                <p className="text-green-700">
                  Thank you for reaching out. We will get back to you within 1-2 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formState.name}
                      onChange={(e) =>
                        setFormState({ ...formState, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formState.email}
                      onChange={(e) =>
                        setFormState({ ...formState, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    required
                    value={formState.subject}
                    onChange={(e) =>
                      setFormState({ ...formState, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none appearance-none bg-white"
                  >
                    <option value="">Select a topic</option>
                    <option value="travel-question">Travel Question</option>
                    <option value="content-correction">Content Correction</option>
                    <option value="partnership">Content Partnership</option>
                    <option value="feedback">General Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formState.message}
                    onChange={(e) =>
                      setFormState({ ...formState, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all resize-y"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
