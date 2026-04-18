import Link from 'next/link';
import SEOHead from '../../components/SEOHead';
import Breadcrumbs from '../../components/Breadcrumbs';
import { siteConfig } from '../../site.config';

export default function CancunCatamaranTourPage() {
  const whyCards = [
    {
      title: 'Calm Caribbean Sailing',
      body: 'The waters off Cancun and Isla Mujeres stay protected and flat most of the year, making catamarans smoother than speedboats for families and first-time sailors.',
    },
    {
      title: 'All-in-One Day Out',
      body: 'A typical tour stacks snorkeling, beach time, lunch and an open bar into one 6-7 hour package, so you skip planning 3 separate activities.',
    },
    {
      title: 'Best Value per Hour',
      body: 'At around $90 pp for a full-day with food and drinks included, a catamaran beats booking a beach club plus separate snorkel tour.',
    },
  ];

  const priceRows = [
    { tour: 'Isla Mujeres full-day catamaran', duration: '7-8 hours', price: '$70 to $130 pp', mxn: '(MXN 1,200 to MXN 2,200)', includes: 'Snorkel, lunch, open bar' },
    { tour: 'Sunset cruise', duration: '1.5 to 2 hours', price: '$50 to $100 pp', mxn: '(MXN 850 to MXN 1,700)', includes: 'Champagne, light bites' },
    { tour: 'Private charter (6 to 10 pax)', duration: '4 to 6 hours', price: '$800 to $2,000 total', mxn: '(MXN 13,500 to MXN 34,000)', includes: 'Captain, crew, full bar' },
    { tour: 'Cozumel ferry plus snorkel combo', duration: '6 to 7 hours', price: '$90 to $160 pp', mxn: '(MXN 1,550 to MXN 2,700)', includes: 'Ferry, 2 reef stops' },
    { tour: 'Xel-Ha eco park plus catamaran', duration: '9 to 10 hours', price: '$140 to $200 pp', mxn: '(MXN 2,400 to MXN 3,400)', includes: 'Park entry, transport, buffet' },
    { tour: 'Contoy Island wildlife tour', duration: '8 to 9 hours', price: '$130 to $180 pp', mxn: '(MXN 2,200 to MXN 3,050)', includes: 'Park fee, lunch, 2 stops' },
    { tour: 'Luxury crewed sailing yacht', duration: '4 hours', price: '$180 to $260 pp', mxn: '(MXN 3,050 to MXN 4,400)', includes: 'Gourmet menu, premium bar' },
  ];

  const providers = [
    {
      name: 'Viator',
      blurb: 'Best for instant confirmation and free cancellation up to 24 hours before. Largest catalog of Cancun catamaran options with verified reviews.',
      href: siteConfig.affiliateLinks.viator,
      best: 'Free cancellation',
    },
    {
      name: 'GetYourGuide',
      blurb: 'Clean mobile vouchers, honest review filtering and a strong selection of Isla Mujeres full-day catamarans. Reserve now, pay later on most listings.',
      href: siteConfig.affiliateLinks.getYourGuide,
      best: 'Reserve now, pay later',
    },
    {
      name: 'Klook',
      blurb: 'Frequent promo pricing on Asia-operated parks and combo tours. Good for Xel-Ha plus catamaran packages if you want one ticket for everything.',
      href: siteConfig.affiliateLinks.klook,
      best: 'Combo discounts',
    },
    {
      name: 'Direct operator',
      blurb: 'Marina Paraiso and local Puerto Juarez operators sell walk-up tickets 10 to 20 percent cheaper, but no free cancellation and Spanish-first service.',
      href: 'https://www.marinaparaiso.com',
      best: 'Lowest cash price',
    },
  ];

  const compareRoutes = [
    {
      name: 'Isla Mujeres',
      distance: '13 km from Cancun',
      sail: '45 to 60 min',
      water: 'Calm, turquoise',
      best: 'First-timers, families, snorkeling',
      downside: 'Crowded beach clubs at peak',
    },
    {
      name: 'Cozumel',
      distance: '70 km south plus ferry',
      sail: '90 min ferry then 2 hour sail',
      water: 'Crystal clear, drift currents',
      best: 'Serious snorkelers, reef divers',
      downside: 'Long travel day, higher price',
    },
    {
      name: 'Contoy Island',
      distance: '30 km north',
      sail: '2 to 2.5 hours',
      water: 'Protected nature reserve',
      best: 'Wildlife lovers, birders, no crowds',
      downside: 'Limited daily permits, books out',
    },
  ];

  const formatCompare = [
    {
      name: 'Full-day (7 to 8h)',
      price: '$70 to $130 pp',
      pros: 'Best value, snorkel plus lunch plus bar, time to relax',
      cons: 'Long sun exposure, busy boats in high season',
    },
    {
      name: 'Sunset (1.5 to 2h)',
      price: '$50 to $100 pp',
      pros: 'Romantic, cooler light, fast, champagne included',
      cons: 'No snorkeling, short, sometimes music-heavy party boats',
    },
    {
      name: 'Private (4 to 6h)',
      price: '$800 to $2,000 total',
      pros: 'Your schedule, your group, no strangers, custom menu',
      cons: 'Expensive for couples, fuel surcharges possible',
    },
  ];

  const bringList = [
    'Reef-safe sunscreen (SPF 50, the sun reflects off the deck)',
    'Swimsuit worn under clothes (changing rooms are tight)',
    'Quick-dry towel and light cover-up',
    'Waterproof phone pouch or GoPro',
    'Cash in small USD bills for tips (10 to 20 percent)',
    'Sunglasses with a strap, plus a hat that clips on',
    'Seasickness tablets if you are sensitive (take 30 min before boarding)',
    'Water shoes for rocky entry at Playa Norte',
  ];

  const mistakes = [
    'Booking the cheapest 2-hour "party" cruise and skipping the full-day. You pay for transfer time twice and miss the snorkel stop.',
    'Wearing regular sunscreen. Mexican marine parks confiscate non-reef-safe bottles at the dock.',
    'Arriving without cash. Marine park fees (around $15 at Isla Mujeres) and tips are cash only.',
    'Booking Cozumel from Cancun as a day trip. The ferry plus drive eats 4 hours and you will feel rushed.',
    'Skipping the hotel pickup option to save $10. Taxis to Marina Punta Nizuc run $25 to $40 one-way.',
    'Forgetting that "open bar" often starts after the snorkel stop, not at boarding.',
  ];

  const faqs = [
    {
      question: 'How much does a Cancun catamaran tour cost in 2026?',
      answer: 'A full-day Isla Mujeres catamaran runs $70 to $130 per person (MXN 1,200 to MXN 2,200) including snorkel gear, lunch and open bar. Sunset cruises are $50 to $100 pp. A private charter for 6 to 10 people costs $800 to $2,000 total. Expect to add roughly $15 in marine park fees and $10 to $20 in tips.',
    },
    {
      question: 'Who is the best Cancun catamaran operator?',
      answer: 'For booking platforms, Viator and GetYourGuide have the widest selection with free cancellation. Among direct operators, Marina Paraiso, Caribbean Carnaval and Sea Passion Catamaran consistently rank in the top reviews for safety, food quality and crew. Avoid any operator without verified insurance documentation.',
    },
    {
      question: 'Isla Mujeres or Cozumel catamaran, which is better?',
      answer: 'Isla Mujeres is better for 90 percent of travelers: it is closer (45 min sail), cheaper, and the water is calm enough for non-swimmers. Cozumel is only worth the extra cost and travel time if you are a serious snorkeler or diver chasing the Palancar and Columbia reefs. For a first catamaran day, pick Isla Mujeres.',
    },
    {
      question: 'Sunset cruise or full-day catamaran, which should I pick?',
      answer: 'Pick the full-day if you want to snorkel, eat lunch on board and get your money worth at $10 to $15 per hour. Pick the sunset cruise if you have already done a reef tour, want a romantic 2-hour outing, or only have a short evening window. Full-day delivers more per dollar; sunset delivers atmosphere.',
    },
    {
      question: 'Are kids allowed on Cancun catamaran tours?',
      answer: 'Yes. Most full-day tours accept children from age 4 or 5, with discounts for kids under 12 (usually 30 to 50 percent off). Infants under 4 often sail free but cannot snorkel. Sunset cruises with open bar sometimes set a minimum age of 18. Check the listing before booking.',
    },
    {
      question: 'What if I get seasick on a catamaran?',
      answer: 'Catamarans are far more stable than monohulls because of the twin hulls, so seasickness is rare on Cancun routes. If you are sensitive, take Dramamine or Bonine 30 minutes before boarding, stay on deck with eyes on the horizon, and avoid heavy food or alcohol until after the snorkel stop. November to April has the calmest seas.',
    },
    {
      question: 'What is included in a Cancun catamaran tour?',
      answer: 'Standard inclusions are: round-trip hotel pickup (on many tours), snorkel gear (mask, fins, vest), a light lunch or buffet, open bar (usually beer, margaritas, sodas, water), and a bilingual guide. Not included: marine park fees (around $15 pp at Isla Mujeres), tips (10 to 20 percent), and photos or videos sold on board.',
    },
    {
      question: 'Is a private catamaran charter worth it?',
      answer: 'A private charter makes sense for groups of 6 or more, special occasions, or travelers who dislike crowded boats. At $800 to $2,000 for up to 10 people, the per-person cost ($80 to $200) is competitive with shared tours once you add the flexibility of your own schedule, route and menu. For couples or parties of 2 to 4, a shared full-day is the smarter spend.',
    },
  ];

  const crossLinks = [
    {
      href: '/chichen-itza-tickets/',
      title: 'Chichen Itza Tickets 2026',
      body: 'Pair your beach day with the wonder of the world: real entry fees, skip-the-line passes and best day-trip operators from Cancun.',
    },
    {
      href: '/mexico-city-frida-kahlo-tour/',
      title: 'Mexico City Frida Kahlo Tour',
      body: 'Add a culture stopover before or after the coast: Casa Azul tickets, timed entry rules and curated art day tours in CDMX.',
    },
  ];

  const related = [
    {
      href: '/blog/cancun-vs-playa-del-carmen/',
      title: 'Cancun vs Playa del Carmen 2026',
      body: 'Which Riviera Maya base fits your trip: beaches, nightlife, day-trip reach and real hotel prices compared.',
    },
    {
      href: '/blog/is-tulum-worth-it-2026/',
      title: 'Is Tulum Worth It in 2026?',
      body: 'Honest take on Tulum pricing, sargassum, safety and whether the eco-chic scene still earns the hype.',
    },
    {
      href: '/blog/mexico-with-kids-2026/',
      title: 'Mexico With Kids 2026',
      body: 'Family-tested itinerary, which catamaran tours accept small children, safest beaches and where to skip.',
    },
    {
      href: '/blog/best-time-to-visit-mexico-2026/',
      title: 'Best Time to Visit Mexico 2026',
      body: 'Month-by-month weather, hurricane risk window, sargassum calendar and the cheapest months to fly.',
    },
  ];

  return (
    <>
      <SEOHead
        title="Cancun Catamaran Tour 2026: Real Prices + Isla Mujeres vs Cozumel | Go2Mexico"
        description="Real 2026 Cancun catamaran prices from $50 to $200 pp. Compare Isla Mujeres, Cozumel and Contoy routes, full-day vs sunset vs private charter, what is included, and where to book."
        canonicalUrl="/cancun-catamaran-tour/"
        article={{
          headline: 'Cancun Catamaran Tour 2026: Real Prices, Routes and Where to Book',
          description: 'Complete 2026 guide to Cancun catamaran tours: real USD prices, Isla Mujeres vs Cozumel vs Contoy, full-day vs sunset vs private, what to bring and 8 FAQs.',
          datePublished: '2026-04-18',
          dateModified: '2026-04-18',
          authorName: siteConfig.name,
        }}
        faq={faqs}
      />

      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <p className="uppercase tracking-widest text-xs sm:text-sm text-white/80 mb-3">Cancun, Mexico</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
            Cancun Catamaran Tour 2026: Real Prices, Routes and Where to Book
          </h1>
          <p className="text-lg sm:text-xl text-white/95 max-w-3xl">
            A full-day Isla Mujeres catamaran costs $70 to $130 per person in 2026, sunsets run $50 to $100, and
            private charters start around $800. Here is exactly what you pay, what is included and how to pick
            the right route.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/15 backdrop-blur rounded-full px-4 py-1.5">Updated April 2026</span>
            <span className="bg-white/15 backdrop-blur rounded-full px-4 py-1.5">USD primary, MXN shown</span>
            <span className="bg-white/15 backdrop-blur rounded-full px-4 py-1.5">Independent, no sponsored ranking</span>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Experiences', href: '/experiences' },
            { label: 'Cancun Catamaran Tour' },
          ]}
        />

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">What is a Cancun catamaran tour?</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A catamaran tour in Cancun is a guided day (or evening) sail on a twin-hulled sailboat that departs
            from one of three marinas: Puerto Juarez (closest to Isla Mujeres), Marina Punta Nizuc (inside the
            hotel zone) or Marina Paraiso. The standard package is a 7 to 8 hour full-day trip to Isla Mujeres
            with a snorkel stop at El Meco or MUSA underwater museum, a beach break at Playa Norte, a light
            lunch on board and an open bar.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Shorter formats exist too: 1.5 to 2 hour sunset cruises with champagne, private charters for groups
            of 6 to 10, and combo tours that bundle Xel-Ha eco park or a Cozumel ferry transfer. All run
            year-round, but November through April has the calmest seas.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Why book a catamaran day in Cancun</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {whyCards.map((c) => (
              <div key={c.title} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{c.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">2026 Cancun catamaran prices</h2>
          <p className="text-gray-700 mb-5">
            Prices in USD (primary) with Mexican peso equivalents in parentheses. Rates are per person unless
            marked total, and exclude marine park fees (around $15 at Isla Mujeres) and tips (10 to 20 percent).
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50 text-gray-900">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Tour type</th>
                  <th className="text-left px-4 py-3 font-semibold">Duration</th>
                  <th className="text-left px-4 py-3 font-semibold">Price (USD)</th>
                  <th className="text-left px-4 py-3 font-semibold">MXN</th>
                  <th className="text-left px-4 py-3 font-semibold">Typically includes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {priceRows.map((r) => (
                  <tr key={r.tour} className="text-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.tour}</td>
                    <td className="px-4 py-3">{r.duration}</td>
                    <td className="px-4 py-3">{r.price}</td>
                    <td className="px-4 py-3 text-gray-500">{r.mxn}</td>
                    <td className="px-4 py-3">{r.includes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Where to book a Cancun catamaran</h2>
          <p className="text-gray-700 mb-6">
            Four routes cover 99 percent of travelers. We use all four ourselves depending on the trip.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {providers.map((p) => (
              <div key={p.name} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">{p.name}</h3>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full px-3 py-1">
                    {p.best}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 flex-1">{p.blurb}</p>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex justify-center items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                >
                  Check {p.name} prices
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Some links are affiliate. We earn a small commission at no cost to you. We never sort by payout.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
            Isla Mujeres vs Cozumel vs Contoy
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {compareRoutes.map((r) => (
              <div key={r.name} className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">{r.name}</h3>
                <dl className="text-sm text-gray-700 space-y-2">
                  <div>
                    <dt className="font-medium text-gray-500">Distance</dt>
                    <dd>{r.distance}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Sailing time</dt>
                    <dd>{r.sail}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Water</dt>
                    <dd>{r.water}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Best for</dt>
                    <dd>{r.best}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Downside</dt>
                    <dd>{r.downside}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">
            Full-day vs sunset vs private charter
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {formatCompare.map((f) => (
              <div key={f.name} className="rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100 p-6 shadow-sm">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{f.name}</h3>
                <p className="text-emerald-700 font-semibold text-sm mb-3">{f.price}</p>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-medium text-gray-900">Pros:</span> {f.pros}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Cons:</span> {f.cons}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Best time to sail in Cancun</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The sweet spot is November through April: seas stay under 1 meter, trade winds blow a steady 10 to
            15 knots (ideal for sailing), and the sargassum seaweed is at its lowest. December to March also
            brings whale shark season near Isla Mujeres and Isla Contoy (June to September is technically the
            official swim-with window, but catamaran water clarity peaks in winter).
          </p>
          <p className="text-gray-700 leading-relaxed">
            Avoid September and October if you can: this is the peak hurricane and sargassum window, and many
            operators cancel full-day tours with less than 24 hours notice. If you must go in those months,
            book directly with a provider offering a "weather guarantee" rebook policy.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">What to bring and what to wear</h2>
          <ul className="grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
            {bringList.map((b) => (
              <li key={b} className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                {b}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Common mistakes to avoid</h2>
          <ol className="space-y-3 text-gray-700">
            {mistakes.map((m, i) => (
              <li key={i} className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm">
                <span className="font-semibold text-red-700 mr-2">{i + 1}.</span>
                {m}
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Cancun catamaran FAQ</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details
                key={f.question}
                className="group rounded-2xl bg-white border border-gray-200 p-5 shadow-sm"
              >
                <summary className="cursor-pointer list-none font-semibold text-gray-900 flex justify-between items-start gap-4">
                  <span>{f.question}</span>
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform text-2xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-gray-700 text-sm leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Pair it with</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {crossLinks.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="block rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">{c.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed">{c.body}</p>
                <span className="inline-block mt-4 text-sm font-semibold underline underline-offset-4">
                  Read the guide
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Related reading</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="block rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{r.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
