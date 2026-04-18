import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { siteConfig } from '../../site.config';

const faqs = [
  {
    question: 'How much does a Casa Azul ticket cost in 2026?',
    answer:
      'Basic admission to the Frida Kahlo Museum (Casa Azul) is 280 MXN (about $14 USD). Add a 70 MXN photo permit for 350 MXN total (about $17.50 USD). Tickets are timed entry and must be purchased online in advance via museofridakahlo.org.mx.',
  },
  {
    question: 'How far in advance should I book Casa Azul tickets?',
    answer:
      'Book 2 to 4 weeks ahead. Casa Azul is one of the most visited museums in Mexico City and regularly sells out for the weekend slots. In peak season (Dec, Mar, Jul, Oct) weekday morning slots also disappear fast, so aim for 4 weeks out.',
  },
  {
    question: 'Is a guided Frida Kahlo tour worth the money?',
    answer:
      'Yes, if it is your first visit. The Casa Azul exhibits have minimal English signage, and a good guide adds biographical context about Frida, Diego, and Leon Trotsky. Expect $40 to $80 USD per person for a small-group tour that includes skip-the-line entry.',
  },
  {
    question: 'Is Casa Azul really closed on Mondays?',
    answer:
      'Yes. The Frida Kahlo Museum is closed every Monday without exception. Opening hours are Tuesday through Sunday, 10:00 am to 5:45 pm (last entry 5:00 pm). On Wednesdays the museum opens slightly later at 11:00 am.',
  },
  {
    question: 'What is a good Coyoacan day itinerary?',
    answer:
      'Morning: timed entry at Casa Azul (10:00 am slot). Walk 10 minutes to the Leon Trotsky Museum. Lunch around Plaza Centenario or Mercado de Coyoacan. Afternoon coffee at Cafe El Jarocho. Leave Coyoacan by 4:00 pm if you are combining with Xochimilco.',
  },
  {
    question: 'Can I combine Casa Azul with Xochimilco in one day?',
    answer:
      'Yes, and it is one of the most popular full-day tours in Mexico City. Start at Casa Azul in the morning, then drive or Uber 30 minutes south to Xochimilco for a trajinera boat ride in the afternoon. Full-day combo tours run $75 to $150 USD per person.',
  },
  {
    question: 'Can I take photos inside Casa Azul?',
    answer:
      'Only with a paid photo permit (70 MXN). Video recording and flash are not allowed anywhere in the museum. Tripods, selfie sticks, and large bags must be left at the entrance cloakroom. The photo permit does not cover the temporary exhibition rooms.',
  },
  {
    question: 'What is the best time of day to visit Casa Azul?',
    answer:
      'The 10:00 am opening slot on Tuesday, Wednesday, or Thursday is quietest. Avoid weekends if possible. The courtyard and kitchen are the most crowded areas, so head there first and loop back to the studio and bedroom at the end of your visit.',
  },
];

const priceRows = [
  { item: 'Casa Azul basic ticket', price: '$14 USD (280 MXN)' },
  { item: 'Casa Azul + photo permit', price: '$17.50 USD (350 MXN)' },
  { item: 'Small-group guided tour + entry', price: '$40 to $80 USD' },
  { item: 'Full-day Coyoacan + Xochimilco', price: '$75 to $150 USD' },
  { item: 'Private Coyoacan walking tour', price: '$150 to $300 USD' },
  { item: 'Casa Azul + Diego Rivera Mural combo', price: '$50 to $90 USD' },
  { item: 'Uber from Polanco (one way)', price: '$7.50 to $12.50 USD (150 to 250 MXN)' },
];

const whyCards = [
  {
    title: 'Tickets sell out 2 to 4 weeks ahead',
    body: 'Weekend slots disappear first. Walk-up visitors are regularly turned away at the gate. Buy online on museofridakahlo.org.mx the moment your dates are confirmed.',
  },
  {
    title: 'Monday closure catches everyone',
    body: 'Casa Azul is closed every Monday. If your Mexico City trip is short, map your Coyoacan day onto any Tuesday through Sunday before you book flights.',
  },
  {
    title: 'A guide unlocks the context',
    body: 'English signage is thin. A local guide explains Frida, Diego, Trotsky, and the house itself so the rooms make sense instead of feeling like a passive walk-through.',
  },
];

const providers = [
  {
    name: 'Viator',
    href: siteConfig.affiliateLinks.viator,
    note: 'Best for small-group Casa Azul + Coyoacan half-day tours with skip-the-line entry.',
  },
  {
    name: 'GetYourGuide',
    href: siteConfig.affiliateLinks.getYourGuide,
    note: 'Strong selection of Casa Azul + Xochimilco full-day combos with hotel pickup.',
  },
  {
    name: 'Klook',
    href: siteConfig.affiliateLinks.klook,
    note: 'Good for bundled Mexico City passes that include Casa Azul and the Diego Rivera Mural Museum.',
  },
  {
    name: 'Official museum site',
    href: 'https://museofridakahlo.org.mx',
    note: 'Only place to buy the base 280 MXN timed-entry ticket and 70 MXN photo permit.',
  },
];

const mistakes = [
  'Showing up on a Monday. The museum is closed and there are no exceptions.',
  'Buying tickets at the gate. The on-site window is usually closed and online slots sell out ahead.',
  'Skipping the photo permit, then regretting it inside. The extra 70 MXN is worth it.',
  'Booking a 9:00 am slot. The museum opens at 10:00 am (11:00 am on Wednesdays).',
  'Leaving luggage on your back. Large bags must go to the cloakroom before you enter.',
  'Underestimating Coyoacan. Budget at least 4 hours to enjoy the plaza, market, and cafes properly.',
];

const crossLinks = [
  {
    href: '/chichen-itza-tickets/',
    title: 'Chichen Itza Tickets 2026',
    body: 'Timed-entry pricing, the new CHC airport, and how to avoid the Cancun day-trip crush.',
  },
  {
    href: '/cancun-catamaran-tour/',
    title: 'Cancun Catamaran Tours',
    body: 'Isla Mujeres sailing trips with snorkeling, open bar, and what the 2026 pricing actually looks like.',
  },
];

const relatedLinks = [
  {
    href: '/blog/is-mexico-safe-for-tourists-2026/',
    title: 'Is Mexico Safe for Tourists in 2026?',
  },
  {
    href: '/blog/best-time-to-visit-mexico-2026/',
    title: 'Best Time to Visit Mexico in 2026',
  },
  {
    href: '/blog/mexico-with-kids-2026/',
    title: 'Mexico with Kids: Family Travel Guide 2026',
  },
  {
    href: '/blog/is-mexico-expensive-2026/',
    title: 'Is Mexico Expensive in 2026? Real Prices',
  },
];

export default function FridaKahloTourPage() {
  const pageTitle = 'Frida Kahlo Museum Tickets 2026: Casa Azul + Coyoacan Tours | Go2Mexico';
  const pageDescription =
    'Book Casa Azul (Frida Kahlo Museum) tickets for 2026 without the rookie mistakes. Real prices, Monday closure warning, Coyoacan day plan, and Xochimilco combo tour options.';

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="/mexico-city-frida-kahlo-tour/"
        article={{
          headline: 'Frida Kahlo Museum Tickets 2026: Casa Azul and Coyoacan Tours',
          description: pageDescription,
          datePublished: '2026-04-18',
          dateModified: '2026-04-18',
          authorName: siteConfig.name,
        }}
        faq={faqs}
      />

      {/* Hero */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Frida Kahlo Museum Tour: Casa Azul and Coyoacan in 2026
          </h1>
          <p className="text-lg sm:text-xl text-pink-100 max-w-3xl">
            Casa Azul is $14 USD (280 MXN), timed-entry, and sells out 2 to 4 weeks ahead. Here is how to
            book it, pair it with Coyoacan or Xochimilco, and avoid the Monday-closure trap.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Mexico City', href: '/cities/' },
            { label: 'Frida Kahlo Museum Tour' },
          ]}
        />

        {/* What is Casa Azul */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What is Casa Azul?</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Casa Azul, literally the Blue House, is the lifelong home of Mexican painter Frida Kahlo. It
            sits in Coyoacan, a leafy colonial neighborhood about 30 minutes south of central CDMX. Frida
            was born here in 1907, lived here with Diego Rivera, briefly hosted Leon Trotsky in the
            1930s, and died here in 1954. The museum opened in 1958 and keeps the house almost exactly as
            she left it.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            You walk through the kitchen, the studio, the wheelchair beside her easel, the day bed where
            she painted self-portraits facing a mirror. It is not a big museum. An unhurried visit takes
            60 to 90 minutes. The magic is how personal it feels, which is why timed entry is essential
            and why everyone who skips it regrets it.
          </p>
        </section>

        {/* Why book ahead */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why you must book ahead</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((card) => (
              <div key={card.title} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-700">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2026 prices */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">2026 prices at a glance</h2>
          <p className="text-gray-700 mb-4">
            USD figures are approximate at 20 MXN per USD. Always confirm current pricing on the
            official museum site before booking.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price (2026)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {priceRows.map((row) => (
                  <tr key={row.item}>
                    <td className="px-4 py-3 text-gray-800">{row.item}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Where to book */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Where to book Casa Azul tours</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {providers.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                <p className="text-gray-700 mb-4">{p.note}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
                >
                  Check availability
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Coyoacan half-day */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Coyoacan half-day on foot</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Casa Azul is the anchor, but Coyoacan rewards a slow afternoon. After the museum, walk to
            these four spots in order:
          </p>
          <ol className="list-decimal list-inside text-gray-800 space-y-2 text-lg">
            <li>
              <strong>Casa Azul</strong> (10:00 am timed entry, 90 minutes).
            </li>
            <li>
              <strong>Leon Trotsky Museum</strong>, 10-minute walk, the house where Trotsky was
              assassinated in 1940. Separate 80 MXN ticket.
            </li>
            <li>
              <strong>Plaza Centenario and Plaza Hidalgo</strong>, the twin squares with street food,
              fountains, and the San Juan Bautista church.
            </li>
            <li>
              <strong>Cafe El Jarocho</strong>, a Coyoacan institution since 1953. Order a cafe de olla
              and a concha to close the day.
            </li>
          </ol>
        </section>

        {/* Xochimilco combo */}
        <section className="mb-12 bg-purple-50 border border-purple-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Casa Azul + Xochimilco full day</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-3">
            Xochimilco is the network of canals and floating gardens 30 minutes south of Coyoacan. The
            standard combo is Casa Azul in the morning, then a trajinera boat ride on the canals in the
            afternoon with mariachis, micheladas, and floating taco vendors.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Full-day combo tours run $75 to $150 USD per person including transport, Casa Azul entry,
            and a shared trajinera. Book through{' '}
            <a
              href={siteConfig.affiliateLinks.getYourGuide}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-pink-700 underline font-medium"
            >
              GetYourGuide
            </a>{' '}
            for the widest small-group inventory.
          </p>
        </section>

        {/* Opening hours */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Opening hours: Tuesday to Sunday</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl mb-4">
            <p className="text-red-900 font-semibold text-lg">
              Warning: Casa Azul is closed every Monday. No exceptions.
            </p>
          </div>
          <ul className="list-disc list-inside text-gray-800 space-y-1 text-lg">
            <li>Tuesday: 10:00 am to 5:45 pm (last entry 5:00 pm)</li>
            <li>Wednesday: 11:00 am to 5:45 pm (note the later opening)</li>
            <li>Thursday to Sunday: 10:00 am to 5:45 pm</li>
            <li>Monday: Closed</li>
          </ul>
        </section>

        {/* Getting there */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting to Casa Azul</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Metro Line 3 (budget)</h3>
              <p className="text-gray-700">
                Take Metro Line 3 to Coyoacan station, then walk 15 minutes south to Londres 247. Fare is
                5 MXN (about $0.25 USD). Busy at rush hour, fine midday. Keep your phone in your front
                pocket.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Uber from Polanco (easy)</h3>
              <p className="text-gray-700">
                Around 30 minutes, 150 to 250 MXN ($7.50 to $12.50 USD). Set drop-off at Museo Frida
                Kahlo so the driver does not leave you at Coyoacan plaza. Didi works too and is often
                10 to 20 percent cheaper.
              </p>
            </div>
          </div>
        </section>

        {/* Photo permit */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Photo permit rules</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            The 70 MXN photo permit lets you take stills in the permanent exhibition only. A few
            practical notes:
          </p>
          <ul className="list-disc list-inside text-gray-800 space-y-2 text-lg">
            <li>No flash. No video. No tripods.</li>
            <li>No photos in the temporary exhibition rooms or the gift shop.</li>
            <li>Selfie sticks must be left at the cloakroom with your bag.</li>
            <li>Staff watch closely in the studio and bedroom. Respect the ropes.</li>
            <li>Buy the permit at the same time as your entry ticket online, not at the gate.</li>
          </ul>
        </section>

        {/* Common mistakes */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Common mistakes to avoid</h2>
          <ol className="list-decimal list-inside text-gray-800 space-y-2 text-lg">
            {mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
              >
                <summary className="font-semibold text-gray-900 cursor-pointer text-lg">
                  {faq.question}
                </summary>
                <p className="mt-3 text-gray-700 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">More Mexico money guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {crossLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-pink-300 transition"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{link.title}</h3>
                <p className="text-gray-700">{link.body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Related */}
        <section className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Related reading</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition"
              >
                <h3 className="text-base font-semibold text-gray-900">{link.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
