import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { siteConfig } from '../../site.config';

const PUBLISHED = '2026-04-18';

const whyCards = [
  {
    title: 'Skip the 90 minute entry line',
    body: 'Chichen Itza draws 8,000 to 14,000 visitors a day in high season. Walk-up buyers queue twice, once for the INAH federal ticket and once for the Yucatan state ticket. Pre-booked combo tickets walk straight past both booths.',
  },
  {
    title: 'Lock in 2026 prices before hikes',
    body: 'The state of Yucatan quietly raised the foreigner surcharge in January 2026. Prebooked tickets honor the rate at checkout, so booking 2 to 4 weeks ahead protects you from last-minute price rises around equinox and peak Christmas weeks.',
  },
  {
    title: 'Transport is 70 percent of the stress',
    body: 'The site is 2.5 hours from Cancun and 1.5 hours from Merida. A combined tour folds entry, certified guide, air conditioned bus, cenote stop and buffet lunch into one price, which usually beats a DIY taxi by USD 40 to 80.',
  },
];

const priceRows = [
  { what: 'Foreigner entry (INAH + Yucatan state combo)', price: 'USD 32', local: '635 MXN', note: 'Paid at two windows if walk-up' },
  { what: 'Mexican national (with ID)', price: 'USD 5', local: '100 MXN', note: 'Free on Sundays for residents' },
  { what: 'Children under 13', price: 'Free', local: '0 MXN', note: 'Bring passport or birth certificate' },
  { what: 'Skip-the-line ticket plus certified guide', price: 'USD 50 to 90', local: '1,000 to 1,800 MXN', note: 'Per person, 2 hour walking tour' },
  { what: 'Group bus day tour from Cancun or Playa', price: 'USD 60 to 120', local: '1,200 to 2,400 MXN', note: 'Includes lunch, cenote, transport' },
  { what: 'Private tour from Cancun (up to 6 pax)', price: 'USD 200 to 400', local: '4,000 to 8,000 MXN', note: 'Flat vehicle rate, split across group' },
  { what: 'Group tour from Merida', price: 'USD 50 to 100', local: '1,000 to 2,000 MXN', note: '1.5h drive, cheaper and less rushed' },
  { what: 'Group tour from Valladolid', price: 'USD 25 to 50', local: '500 to 1,000 MXN', note: '30 minutes away, best local base' },
];

const providers = [
  {
    name: 'GetYourGuide',
    url: siteConfig.affiliateLinks.getYourGuide,
    pitch: 'Largest Chichen Itza inventory in Europe and North America. Free cancellation up to 24 hours on most day tours from Cancun, Playa del Carmen and Tulum. Live chat support in English, German, Spanish.',
    best: 'Best for flexible travelers who might shift dates.',
  },
  {
    name: 'Viator (TripAdvisor)',
    url: siteConfig.affiliateLinks.viator,
    pitch: 'Deepest pool of verified TripAdvisor reviews, often 4,000+ per tour. Price-match guarantee and 24 hour free cancellation on standard tours. Strong private tour selection from Merida.',
    best: 'Best for reading thousands of recent reviews before booking.',
  },
  {
    name: 'Klook',
    url: siteConfig.affiliateLinks.klook,
    pitch: 'Strong on Asian and Australian traveler inventory but also a full Yucatan catalog. Regular app-only promo codes 5 to 15 percent off. Bundles with Cenote Ik Kil and Valladolid cathedral built in.',
    best: 'Best for combo packages and app discounts.',
  },
  {
    name: 'INAH Official (walk-up only)',
    url: 'https://www.inah.gob.mx/',
    pitch: 'The Mexican federal institute INAH sells only the 90 MXN federal portion online in theory, but the booking system is Spanish-only and flaky. The Yucatan state surcharge still has to be paid cash at the gate.',
    best: 'Only worth it if you are fluent in Spanish and want to save USD 10.',
    official: true,
  },
];

const mistakes = [
  'Arriving at 11am when tour buses from Cancun have already dumped 5,000 people at the main plaza.',
  'Wearing flip flops on the limestone paths. They are uneven, sun-baked and slippery after rain.',
  'Skipping water. There is one small shop inside and prices triple what Valladolid charges.',
  'Tipping the "free" guides who latch onto you near the entrance. They are not INAH certified and often rushed.',
  'Trying to climb El Castillo. Climbing has been banned since 2006 after a tourist fell and died.',
  'Leaving the cenote for last. Ik Kil closes at 5pm and lines at 4pm are brutal. Do it before Chichen Itza if your tour allows.',
];

const faqs = [
  {
    question: 'How much does a Chichen Itza ticket cost in 2026?',
    answer: 'The total foreigner entry fee is 635 MXN, roughly USD 32. That is made up of a 90 MXN federal INAH ticket plus a 545 MXN Yucatan state surcharge, paid at two separate windows if you buy on the day. Mexican nationals pay 100 MXN and children under 13 enter free.',
  },
  {
    question: 'Should I buy my Chichen Itza ticket in advance?',
    answer: 'Yes, especially between December and April and around both equinoxes. A prebooked skip-the-line ticket from GetYourGuide, Viator or Klook saves 60 to 90 minutes of queuing and locks in the 2026 price. On quiet weekdays in September or October you can buy at the gate without much waiting.',
  },
  {
    question: 'Is it better to visit Chichen Itza from Cancun, Merida or Valladolid?',
    answer: 'Valladolid is the calmest base at only 30 minutes from the ruins, ideal if you want early entry at 8am. Merida is 1.5 hours away and pairs well with a city break. Cancun is the priciest and longest option at 2.5 hours each way, but has the most tour choice and 5am pickups.',
  },
  {
    question: 'Is a guide at Chichen Itza worth it?',
    answer: 'A certified guide is worth it once. The site has almost no signage and the Mayan astronomy context is the whole point of going. Expect to pay 800 to 1,500 MXN for a private guide at the entrance or USD 15 to 25 per person as part of a prebooked group tour.',
  },
  {
    question: 'Can you climb El Castillo pyramid at Chichen Itza?',
    answer: 'No. Climbing the Kukulkan pyramid has been banned since 2006 after a fatal fall. You can walk up close and photograph it, but ropes keep visitors off the steps. Some smaller structures at Coba or Ek Balam still allow climbing if that is important to you.',
  },
  {
    question: 'Is the spring equinox worth visiting Chichen Itza for?',
    answer: 'The Kukulkan serpent shadow on March 20 and September 22 2026 is a genuine archaeoastronomical event, but crowds triple, hotels in Piste fill months out and the shadow is only clearly visible for about 45 minutes. If you hate crowds, visit two or three days before or after, when the shadow still appears at 80 percent strength.',
  },
  {
    question: 'What is the best time of day to visit Chichen Itza?',
    answer: 'Be at the gate when it opens at 8am. The first 90 minutes are 10 degrees cooler, mostly empty, and produce the best photos of El Castillo without people in them. Last entry is 4pm and the site closes at 5pm, so 3pm arrivals are rushed and the light is harsh.',
  },
  {
    question: 'Can I combine Chichen Itza with Cenote Ik Kil?',
    answer: 'Yes, and you should. Cenote Ik Kil is 3 km south of the ruins and almost every Cancun or Merida tour bundles them. Expect 60 to 90 minutes of swim time. Bring a quick-dry towel and biodegradable sunscreen. Standard tours also include a buffet lunch between the two stops.',
  },
];

const crossLinks = [
  {
    href: '/cancun-catamaran-tour/',
    title: 'Cancun catamaran tours 2026',
    blurb: 'Pair your Chichen Itza day with a half-day Isla Mujeres sail. Real prices, which boats avoid the cattle-car crowd.',
  },
  {
    href: '/mexico-city-frida-kahlo-tour/',
    title: 'Frida Kahlo museum tours in Mexico City',
    blurb: 'Heading west after Yucatan? Skip the Casa Azul walk-up line with a prebooked Coyoacan and Xochimilco combo.',
  },
];

const relatedReading = [
  { href: '/blog/is-mexico-safe-for-tourists-2026/', title: 'Is Mexico safe for tourists in 2026?' },
  { href: '/blog/is-mexico-expensive-2026/', title: 'Is Mexico expensive in 2026? Real daily budgets' },
  { href: '/blog/best-time-to-visit-mexico-2026/', title: 'Best time to visit Mexico in 2026' },
  { href: '/blog/cancun-vs-playa-del-carmen/', title: 'Cancun vs Playa del Carmen: which base is right?' },
];

export default function ChichenItzaTicketsPage() {
  const title = 'Chichen Itza Tickets 2026: Real Prices + Where to Book from Cancun | Go2Mexico';
  const description =
    'Real 2026 Chichen Itza ticket prices (635 MXN foreigner entry, USD 32), where to book skip-the-line tours from Cancun, Merida and Valladolid, and the equinox dates to plan around.';
  const canonical = '/chichen-itza-tickets/';

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonicalUrl={canonical}
        article={{
          headline: 'Chichen Itza Tickets 2026: Real Prices and Where to Book',
          description,
          datePublished: PUBLISHED,
          dateModified: PUBLISHED,
          authorName: siteConfig.name,
        }}
        faq={faqs}
      />

      {/* Hero */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <p className="uppercase tracking-wider text-emerald-100 text-sm font-semibold mb-4">
            Yucatan Peninsula, Mexico
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Chichen Itza Tickets 2026: Real Prices and Where to Book
          </h1>
          <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl leading-relaxed">
            Foreigner entry is USD 32 (635 MXN) for 2026, made up of the INAH federal ticket plus a Yucatan state
            surcharge. This guide breaks down every real price, the four places worth booking, the two equinox dates to
            plan around, and how to combine your visit with Cenote Ik Kil without wasting a full day on buses.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/15 backdrop-blur rounded-full px-4 py-2">Open 8am to 5pm daily</span>
            <span className="bg-white/15 backdrop-blur rounded-full px-4 py-2">Last entry 4pm</span>
            <span className="bg-white/15 backdrop-blur rounded-full px-4 py-2">Updated April 2026</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Experiences', href: '/experiences' },
            { label: 'Chichen Itza tickets' },
          ]}
        />

        {/* What is Chichen Itza */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">What is Chichen Itza?</h2>
          <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed space-y-4">
            <p>
              Chichen Itza is the largest and most photographed Mayan archaeological site in Mexico, covering roughly 5
              square kilometres in the north of the Yucatan Peninsula. The site dates from around 600 to 1200 AD and is
              anchored by El Castillo, the 30 metre step pyramid dedicated to the feathered serpent Kukulkan. UNESCO
              listed it as a World Heritage Site in 1988 and it was voted one of the New 7 Wonders of the World in
              2007.
            </p>
            <p>
              Entry is controlled jointly by INAH (Mexico&rsquo;s federal institute of anthropology) and the state of
              Yucatan, which is why foreigners pay two tickets rolled into one at the gate. You get access to the
              pyramid, the Great Ball Court, the Temple of the Warriors, the Sacred Cenote and the observatory known as
              El Caracol. Expect to spend 2.5 to 4 hours inside.
            </p>
          </div>
        </section>

        {/* Why book ahead */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Why book your Chichen Itza ticket ahead</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {whyCards.map((card) => (
              <div key={card.title} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2026 Prices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">2026 Chichen Itza prices at a glance</h2>
          <p className="text-slate-600 mb-6 max-w-3xl">
            All prices verified April 2026. USD figures use a 19.8 MXN to USD 1 exchange rate and will move a few
            percent either way during the year.
          </p>
          <div className="overflow-x-auto rounded-2xl shadow-lg border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-900 text-sm uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-4 font-semibold">Ticket or tour</th>
                  <th className="px-6 py-4 font-semibold">USD</th>
                  <th className="px-6 py-4 font-semibold">MXN</th>
                  <th className="px-6 py-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {priceRows.map((row) => (
                  <tr key={row.what} className="text-slate-600">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.what}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{row.local}</td>
                    <td className="px-6 py-4">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Where to book */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Where to book Chichen Itza tickets</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {providers.map((p) => (
              <div key={p.name} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{p.name}</h3>
                <p className="text-slate-600 leading-relaxed flex-1">{p.pitch}</p>
                <p className="text-sm text-emerald-700 font-medium mt-4">{p.best}</p>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-center"
                >
                  {p.official ? 'Visit INAH official site' : `Check ${p.name} prices`}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Equinox */}
        <section className="mb-16 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Equinox 2026: the Kukulkan serpent shadow</h2>
          <div className="grid md:grid-cols-2 gap-6 text-slate-600 leading-relaxed">
            <div>
              <p className="mb-4">
                Twice a year the setting sun hits the north staircase of El Castillo at exactly the right angle to cast
                seven triangular shadows. Linked to the stone serpent heads at the base of the pyramid, the effect
                creates the illusion of Kukulkan slithering down the steps.
              </p>
              <p>
                The Mayans built this into the architecture 1,200 years ago, and it still happens on the same two days
                every year.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Dates to plan around</h3>
              <ul className="space-y-2 text-slate-700">
                <li><strong>Spring equinox:</strong> Friday 20 March 2026</li>
                <li><strong>Autumn equinox:</strong> Tuesday 22 September 2026</li>
                <li><strong>Visibility window:</strong> 3:30pm to 5pm local time</li>
                <li><strong>Crowd impact:</strong> 3x normal visitors, book hotels in Piste or Valladolid 3+ months ahead</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Best time */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Best time of day to visit Chichen Itza</h2>
          <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed space-y-4">
            <p>
              The site opens at 8am. Be in the line by 7:45. The first 90 minutes are cool (25 to 28 C), quiet, and
              produce the best photos of El Castillo without people in front of it. Mid-morning temperatures climb
              past 35 C on the limestone plaza and feel hotter with no shade.
            </p>
            <p>
              Tour buses from Cancun start dumping passengers around 10:30am. By noon there can be 8,000 people on
              site. If you cannot make an 8am start, aim for 2:30pm instead. Last entry is 4pm, the site closes at 5pm,
              and the afternoon light is better for the Temple of the Warriors.
            </p>
          </div>
        </section>

        {/* Getting there */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Getting to Chichen Itza from each base</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">From Cancun</h3>
              <p className="text-slate-600 leading-relaxed">
                2.5 hours each way on the 180D toll road. Group bus tours leave from the Hotel Zone at 5am to 7am and
                cost USD 60 to 120 including cenote and lunch. ADO bus is cheaper at USD 25 round trip but drops you
                at Piste, still a 1.5 km walk from the entrance.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">From Merida</h3>
              <p className="text-slate-600 leading-relaxed">
                1.5 hours east on the 180D. Cheaper and far less rushed than Cancun. A group tour runs USD 50 to 100.
                Self-drive rental car is about USD 35 plus 500 MXN in tolls. Parking at the site is 80 MXN.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">From Valladolid</h3>
              <p className="text-slate-600 leading-relaxed">
                30 minutes by colectivo (40 MXN) or taxi (400 MXN). This is the smart base: sleep in Valladolid the
                night before, be at the gate at 7:45am and beat every Cancun tour bus by 2 hours. Group tours from
                Valladolid cost USD 25 to 50.
              </p>
            </div>
          </div>
        </section>

        {/* Combine with cenote */}
        <section className="mb-16 bg-slate-50 rounded-2xl p-8 border border-slate-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Combine it with Cenote Ik Kil</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-4">
            Cenote Ik Kil is 3 km south of the ruins and is the single most natural add-on to a Chichen Itza day.
            It is a vertical-walled sinkhole 26 metres deep with vines hanging from the rim, and you can swim inside.
            Entry is 150 MXN (USD 8) if you arrive independently, but most bus tours fold it in.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            Arrive before 11am if you want the cenote to yourself. By 1pm there are 200 swimmers in the water and the
            changing rooms back up. Bring biodegradable sunscreen (reef-safe is required), a quick-dry towel and
            sandals with grip for the wet stone stairs.
          </p>
        </section>

        {/* No climb rule */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Why you cannot climb El Castillo</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Climbing the main pyramid was permanently banned in 2006 after a San Diego tourist, Adeline Black, fell to
            her death from the staircase on Christmas Day 2005. Ropes now keep visitors at a 5 metre perimeter. If
            climbing a Mayan pyramid is on your list, head to Coba (Nohoch Mul pyramid, 42 metres) or Ek Balam (El
            Torre, 30 metres) instead, both within 2 hours of Chichen Itza and still open to climbers.
          </p>
        </section>

        {/* Guide pressure */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">The guide pressure at the entrance</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-4">
            Once you pass the ticket booth you will walk through a gauntlet of freelance guides offering tours from
            800 to 1,500 MXN (USD 40 to 75) for a group of up to 20. Many are excellent, some are not INAH certified
            and a few repeat half-remembered theories about aliens and blood sacrifice.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            If you want a guide, ask to see the INAH credential before paying, agree the price in writing on a phone
            note, and confirm the language. The safer option is to prebook a certified guide as part of a GetYourGuide
            or Viator tour, where reviews keep quality consistent.
          </p>
        </section>

        {/* Common mistakes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Common Chichen Itza mistakes to avoid</h2>
          <ul className="space-y-3">
            {mistakes.map((m, i) => (
              <li key={i} className="flex gap-4 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-slate-600 leading-relaxed pt-1">{m}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 group"
              >
                <summary className="text-lg font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  <span>{f.question}</span>
                  <span className="text-emerald-600 text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-slate-600 leading-relaxed mt-4">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Pair it with another Mexico experience</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {crossLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group bg-gradient-to-br from-emerald-600 to-blue-700 text-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-2xl font-bold mb-3 group-hover:underline">{c.title}</h3>
                <p className="text-emerald-50 leading-relaxed">{c.blurb}</p>
                <span className="inline-block mt-4 font-semibold">Read the guide &rarr;</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Related reading */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Related reading</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedReading.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl hover:border-emerald-200 transition-all"
              >
                <h3 className="text-base font-semibold text-slate-900 leading-snug">{r.title}</h3>
                <span className="inline-block mt-3 text-sm text-emerald-700 font-semibold">Read more &rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
