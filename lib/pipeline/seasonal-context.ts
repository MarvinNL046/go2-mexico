/**
 * Seasonal + Dutch-traveler context generator.
 *
 * Returns hooks the prompt builder can inject so the writer references the
 * actual current month, weather window, and whichever festival/event is
 * upcoming for Dutch readers.
 */

export interface SeasonalHook {
  monthNl: string;        // "april"
  monthEn: string;        // "April"
  seasonNl: string;       // "hoogseizoen / koel-droog"
  seasonEn: string;       // "high season / cool-dry"
  weatherSummary: string; // human paragraph
  upcomingEvents: string; // markdown bullet list
  ndlAngle: string;       // why a Dutch reader cares right now
}

const MONTH_NAMES_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];
const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Thailand's three-season calendar (broad strokes — varies per region).
//  Cool-dry:  November – February  (peak tourist season)
//  Hot:       March – May          (extreme heat, Songkran in April)
//  Wet:       June – October       (rainy / monsoon, cheaper)
function seasonForMonth(month: number): { nl: string; en: string } {
  if (month >= 10 || month <= 1) return { nl: 'koel-droog seizoen (hoogseizoen)', en: 'cool-dry season (high season)' };
  if (month >= 2 && month <= 4) return { nl: 'heet seizoen', en: 'hot season' };
  return { nl: 'regenseizoen / moesson', en: 'wet / monsoon season' };
}

// Major Thai festivals + Dutch-school-holiday windows worth flagging in the
// next ~60 days. Keep this list short and curated; the writer fills in detail.
const EVENT_CALENDAR: Record<number, string[]> = {
  1: [
    'Chinese New Year (eind januari/begin februari) — Yaowarat / Chinatown Bangkok komt tot leven.',
    'Krijtstreepje hoogseizoen — droog en koel, ideaal voor Bangkok/Chiang Mai.',
  ],
  2: [
    'Make Bucha (volle maan, februari) — boeddhistische feestdag, mooie tempelceremonies in Chiang Mai.',
    'Chiang Mai Flower Festival (eerste weekend februari).',
  ],
  3: [
    'Einde hoogseizoen — droog maar de hitte begint op te lopen.',
    'Pattaya International Music Festival meestal medio maart.',
  ],
  4: [
    'Songkran (13–15 april) — Thais nieuwjaar met landelijk waterfeest. Sluit hotels vroeg.',
    'Voor Nederlandse reizigers: meivakantie sluit aan op Songkran — vroeg boeken.',
  ],
  5: [
    'Visakha Bucha (volle maan in mei) — belangrijke boeddhistische feestdag.',
    'Royal Ploughing Ceremony (begin mei, Bangkok).',
    'Begin van het regenseizoen — minder drukte, lagere prijzen.',
  ],
  6: [
    'Phi Ta Khon ghost festival (Loei, eind juni) — kleurrijke maskers, off-the-beaten-path.',
    'Regenseizoen begint serieus in het centrum/oosten.',
  ],
  7: [
    'Asahna Bucha + Khao Phansa (volle maan juli) — start boeddhistische vasten.',
    'Kandelaarsfestival in Ubon Ratchathani.',
  ],
  8: [
    'Verjaardag van de Koningin (12 augustus) — Thailand Moederdag, parades in Bangkok.',
    'Regen pieken in zuiden Andaman-kant — Krabi/Phuket weersafhankelijk.',
  ],
  9: [
    'Sart Thai (volle maan september) — Thais voorouderfeest, traditionele snoepjes.',
    'Einde regenseizoen in zicht voor centrum/noord.',
  ],
  10: [
    'Vegetarisch Festival in Phuket (begin oktober, 9 dagen) — straatprocessies.',
    'Begin van het hoogseizoen — herfstvakantie populair voor NL-reizigers.',
  ],
  11: [
    'Loi Krathong + Yi Peng (volle maan november) — lampionnen, vooral spectaculair in Chiang Mai.',
    'Drukke periode — boek vroeg voor Chiang Mai.',
  ],
  12: [
    'Kerst + Oudejaarsavond — Bangkok rooftop bars, eilanden vol Europese reizigers.',
    'Voor NL-publiek: kerstvakantie + kantoorgesloten maakt 2-3 weken trips populair.',
  ],
};

export function getSeasonalHook(now: Date = new Date()): SeasonalHook {
  const m = now.getMonth(); // 0-11
  const monthNl = MONTH_NAMES_NL[m];
  const monthEn = MONTH_NAMES_EN[m];
  const season = seasonForMonth(m + 1);

  const events = EVENT_CALENDAR[m + 1] || [];
  // Also peek at next month so writers can flag "boek nu voor X"
  const nextEvents = EVENT_CALENDAR[((m + 1) % 12) + 1] || [];

  const upcomingEvents = [
    ...events.map(e => `- (${monthNl}) ${e}`),
    ...nextEvents.slice(0, 1).map(e => `- (volgende maand) ${e}`),
  ].join('\n');

  const weatherSummary =
    `Het is nu ${monthNl} — ${season.nl}. ` +
    (m >= 10 || m <= 1
      ? 'Verwacht dagtemperaturen rond 28-32°C met koele avonden, weinig regen. Drukker en duurder, maar het beste reisweer.'
      : m >= 2 && m <= 4
        ? 'Verwacht hitte tot 35°C+ en hoge luchtvochtigheid. Bangkok kan extreem voelen; eilanden en bergen iets aangenamer.'
        : 'Verwacht stevige middagbuien (vooral in zuiden), maar vaak met zonnige ochtenden. Lagere prijzen en minder toeristen — vooral in noorden goed te doen.');

  const ndlAngle =
    'Voor reizigers vanuit Nederland: ' +
    (m >= 10 || m === 0
      ? 'kerst- en herfstvakantie zijn populair, KLM/Schiphol direct naar Bangkok zit dan vol — vroeg boeken loont.'
      : m === 1 || m === 2
        ? 'krokusvakantie geeft een mooie Thailand-window; vluchten zijn doorgaans iets goedkoper dan december.'
        : m === 3 || m === 4
          ? 'meivakantie + Songkran combineren is een Nederlandse klassieker; reken op drukke vluchten Schiphol-Bangkok.'
          : m === 5 || m === 6
            ? 'het regenseizoen schrikt veel reizigers af, maar prijzen en rust zijn op hun best — vooral noord/centraal.'
            : m === 7 || m === 8
              ? 'zomervakantie is hoog regenseizoen in zuiden Andaman-kust; oost-eilanden (Koh Samui, Koh Tao) hebben dan beter weer.'
              : 'najaarsvakantie valt rond einde regenseizoen — eerste twee weken oktober is gokken, daarna stabiliseert het weer.');

  return {
    monthNl,
    monthEn,
    seasonNl: season.nl,
    seasonEn: season.en,
    weatherSummary,
    upcomingEvents,
    ndlAngle,
  };
}

/**
 * Render the hook as a Markdown block for direct prompt injection.
 */
export function renderSeasonalContextForPrompt(hook: SeasonalHook = getSeasonalHook()): string {
  return `\nSEASONAL CONTEXT (use this to ground the article in the actual current moment):
- Current month: ${hook.monthNl} (${hook.monthEn})
- Season in Thailand: ${hook.seasonNl}
- Weather: ${hook.weatherSummary}
- Dutch-traveler angle: ${hook.ndlAngle}
- Relevant events / hooks to mention if natural:
${hook.upcomingEvents}

Where it makes sense, anchor advice in the current season (e.g. "in ${hook.monthNl}, you can expect..."). Do NOT force seasonal references into topics where they don't belong.\n`;
}
