export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

/** ৳18,500 in English, ১৮,৫০০৳ (lakh grouping, Bengali digits) in Bengali. */
export function formatTaka(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD").format(n);
}

export function formatDate(d: Date | string, locale: Locale) {
  const date = typeof d === "string" ? new Date(`${d}T00:00:00Z`) : d;
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const en = {
  langName: "English",
  otherLang: "বাংলা",
  place: "Inani beach, Cox’s Bazar",
  nav: { requestStay: "Book a stay", allSpaces: "All spaces" },
  hero: {
    title: "You’re standing in the garden suite.",
    body: "A small resort of courtyard suites under the casuarina trees. Look around, then walk through the rest of it.",
    tour: (name: string) => `Tour the ${name.toLowerCase()}`,
    seeAll: "See every space",
    drag: "Drag the scene to look around",
  },
  spaces: {
    title: "Walk the suite before you book.",
    body: "Walkthroughs are 3D captures of real rooms, not renders. Drag to look around, or press play for a guided tour. The lobby, pool and bathrooms are next on the capture list.",
    ready: (n: string) => `3D walkthrough · ${n} stops`,
    pending: "3D capture coming soon",
    from: (price: string) => `From ${price} a night`,
  },
  kinds: { SUITE: "Suite", LOBBY: "Lobby", POOL: "Pool", BATH: "Bathroom" },
  stay: {
    title: "Eleven suites, one garden, a five-minute walk to the sea.",
    body: "Check-in from 2 pm, breakfast in the gathering hall, airport pickup from Cox’s Bazar on request.",
    facts: [
      ["Airport", "45 min from Cox’s Bazar"],
      ["Beach", "5 min on foot"],
      ["Breakfast", "Included, 7–10 am"],
      ["Check-out", "Noon"],
    ] as [string, string][],
  },
  footer: { demo: "Demo site: the name, prices and facts are placeholders.", captures: "3D captures", shownAs: "shown as" },
  viewer: {
    loading: "Loading the 3D scene…",
    noWebgl: "3D isn’t supported in this browser, so this is a photo of the space.",
    goTo: (t: string) => `Go to ${t}`,
  },
  space: {
    play: "Play guided tour",
    pause: "Pause tour",
    about: (n: string) => `About the ${n}`,
    hint: "Drag to look around · scroll or pinch to move closer · tap a numbered marker to jump there",
    viewpoints: "Viewpoints",
    bookThis: "Book this suite",
    pendingTitle: "The 3D walkthrough is on its way",
    pendingBody: "We haven’t captured this space yet. Meanwhile, these ones are ready to explore:",
  },
  book: {
    title: "Book a stay",
    lead: "Pick your dates and pay a small advance by bKash, Nagad or Rocket — or pay everything at the hotel. The front desk confirms every booking by phone.",
    suite: "Suite",
    checkIn: "Check-in",
    checkOut: "Check-out",
    adults: "Adults",
    children: "Children (under 12)",
    name: "Full name",
    phone: "Mobile number",
    phoneHint: "Bangladeshi number, e.g. 01712-345678",
    email: "Email (optional)",
    note: "Anything we should know? (optional)",
    payHow: "How would you like to pay?",
    methods: {
      BKASH: "bKash advance",
      NAGAD: "Nagad advance",
      ROCKET: "Rocket advance",
      BANK_TRANSFER: "Bank transfer",
      PAY_AT_HOTEL: "Pay at the hotel",
    },
    wallets: { BKASH: "bKash", NAGAD: "Nagad", ROCKET: "Rocket" } as Record<string, string>,
    advanceShort: "Advance",
    payAtHotelNote: "We hold the room until 6 pm on your arrival day. Unconfirmed bookings may be released on busy weekends.",
    summary: "Your stay",
    nights: (n: string) => `Room, ${n} night(s)`,
    weekendIncl: (n: string) => `incl. ${n} weekend night(s)`,
    serviceCharge: (p: string) => `Service charge (${p}%)`,
    vat: (p: string) => `VAT (${p}%)`,
    total: "Total",
    advance: (p: string) => `Advance to confirm (${p}%)`,
    payLater: "Due at check-in",
    submit: "Request booking",
    submitting: "Sending…",
    pickDates: "Choose your dates to see the price.",
    unavailable: "This suite is fully booked for those dates. Try other dates or call the hotline.",
    available: (n: string) => `${n} room(s) free for these dates`,
    errors: {
      generic: "The booking didn’t go through. Check your connection and try again.",
      name: "Enter your full name.",
      phone: "Enter a Bangladeshi mobile number, e.g. 01712-345678.",
      email: "That email address doesn’t look right.",
      dates: "Choose a check-out date after check-in, up to 30 nights, within the next year.",
      unavailable: "Someone just booked the last room for those dates. Try other dates.",
      too_many_guests: "Too many guests for this suite. Book a second suite or call the hotline.",
      not_bookable: "This space can’t be booked online. Call the hotline.",
      not_found: "We couldn’t find a booking with that reference and phone number.",
      trx: "A TrxID is 8–12 letters and numbers, e.g. 9K7HX2MQ4T.",
      not_payable: "This booking doesn’t need an advance, or it’s already been paid.",
    },
    guestsMax: (n: string) => `Up to ${n} guests in this suite.`,
    done: {
      title: "Booking received",
      ref: "Your booking reference",
      sms: "Keep this reference. The front desk will call you to confirm.",
      payTitle: (method: string, amount: string) => `Send the ${amount} advance by ${method}`,
      steps: (num: string, ref: string) => [
        `Open the app and choose Send Money (or Payment) to ${num}.`,
        `Write ${ref} in the reference.`,
        "Enter the Transaction ID (TrxID) from the confirmation SMS below.",
      ],
      trxLabel: "Transaction ID (TrxID)",
      payerLabel: "The number you paid from",
      trxSubmit: "Submit payment",
      trxDone: "Thanks — we’ll verify the payment and confirm your booking.",
      bank: "Bank details",
      hotline: "Hotline",
      payAtHotel: "Nothing to pay now. Bring your NID or passport at check-in.",
      noNumber: "The payment number isn’t set up yet. Call the hotline to pay the advance.",
    },
  },
  notFound: "That page doesn’t exist.",
};

export type Dictionary = typeof en;

const bn: Dictionary = {
  langName: "বাংলা",
  otherLang: "English",
  place: "ইনানী সৈকত, কক্সবাজার",
  nav: { requestStay: "বুকিং করুন", allSpaces: "সব জায়গা" },
  hero: {
    title: "আপনি এখন গার্ডেন স্যুটের ভেতরে দাঁড়িয়ে।",
    body: "ঝাউবনের নিচে উঠোনঘেরা কয়েকটি স্যুট নিয়ে ছোট্ট একটি রিসোর্ট। চারপাশ ঘুরে দেখুন, তারপর বাকিটা হেঁটে দেখুন।",
    tour: (name: string) => `${name} ঘুরে দেখুন`,
    seeAll: "সব জায়গা দেখুন",
    drag: "ঘুরিয়ে দেখতে দৃশ্যটি টানুন",
  },
  spaces: {
    title: "বুকিংয়ের আগেই স্যুটটি ঘুরে দেখুন।",
    body: "এগুলো আসল ঘরের থ্রিডি ক্যাপচার, কম্পিউটারে বানানো ছবি নয়। টেনে চারপাশ দেখুন, অথবা গাইডেড ট্যুর চালু করুন। লবি, পুল আর বাথরুমের ক্যাপচার শিগগিরই আসছে।",
    ready: (n: string) => `থ্রিডি ওয়াকথ্রু · ${n}টি জায়গা`,
    pending: "থ্রিডি ক্যাপচার শিগগিরই আসছে",
    from: (price: string) => `প্রতি রাত ${price} থেকে`,
  },
  kinds: { SUITE: "স্যুট", LOBBY: "লবি", POOL: "সুইমিং পুল", BATH: "বাথরুম" },
  stay: {
    title: "এগারোটি স্যুট, একটি বাগান, সমুদ্র মাত্র পাঁচ মিনিটের হাঁটা পথ।",
    body: "চেক-ইন দুপুর ২টা থেকে, সকালের নাশতা গ্যাদারিং হলে, অনুরোধে কক্সবাজার বিমানবন্দর থেকে পিকআপ।",
    facts: [
      ["বিমানবন্দর", "কক্সবাজার থেকে ৪৫ মিনিট"],
      ["সৈকত", "হেঁটে ৫ মিনিট"],
      ["নাশতা", "অন্তর্ভুক্ত, সকাল ৭–১০টা"],
      ["চেক-আউট", "দুপুর ১২টা"],
    ],
  },
  footer: { demo: "ডেমো সাইট: নাম, দাম ও তথ্যগুলো উদাহরণ মাত্র।", captures: "থ্রিডি ক্যাপচার", shownAs: "দেখানো হয়েছে" },
  viewer: {
    loading: "থ্রিডি দৃশ্য লোড হচ্ছে…",
    noWebgl: "এই ব্রাউজারে থ্রিডি চলে না, তাই জায়গাটির একটি ছবি দেখানো হচ্ছে।",
    goTo: (t: string) => `${t}-এ যান`,
  },
  space: {
    play: "গাইডেড ট্যুর চালু করুন",
    pause: "ট্যুর থামান",
    about: (n: string) => `${n} সম্পর্কে`,
    hint: "টেনে চারপাশ দেখুন · কাছে যেতে স্ক্রল বা পিঞ্চ করুন · নম্বর চিহ্নে চাপ দিয়ে সেখানে যান",
    viewpoints: "দেখার জায়গা",
    bookThis: "এই স্যুট বুক করুন",
    pendingTitle: "থ্রিডি ওয়াকথ্রু আসছে",
    pendingBody: "এই জায়গাটির ক্যাপচার এখনো হয়নি। ততক্ষণ এগুলো ঘুরে দেখুন:",
  },
  book: {
    title: "বুকিং করুন",
    lead: "তারিখ বেছে নিন, তারপর বিকাশ, নগদ বা রকেটে সামান্য অগ্রিম দিন — অথবা পুরো টাকা হোটেলে এসে দিন। ফ্রন্ট ডেস্ক প্রতিটি বুকিং ফোনে নিশ্চিত করে।",
    suite: "স্যুট",
    checkIn: "চেক-ইন",
    checkOut: "চেক-আউট",
    adults: "প্রাপ্তবয়স্ক",
    children: "শিশু (১২ বছরের নিচে)",
    name: "পুরো নাম",
    phone: "মোবাইল নম্বর",
    phoneHint: "বাংলাদেশি নম্বর, যেমন ০১৭১২-৩৪৫৬৭৮",
    email: "ইমেইল (ঐচ্ছিক)",
    note: "আমাদের কিছু জানাতে চান? (ঐচ্ছিক)",
    payHow: "কীভাবে পেমেন্ট করবেন?",
    methods: {
      BKASH: "বিকাশে অগ্রিম",
      NAGAD: "নগদে অগ্রিম",
      ROCKET: "রকেটে অগ্রিম",
      BANK_TRANSFER: "ব্যাংক ট্রান্সফার",
      PAY_AT_HOTEL: "হোটেলে এসে পেমেন্ট",
    },
    wallets: { BKASH: "বিকাশ", NAGAD: "নগদ", ROCKET: "রকেট" },
    advanceShort: "অগ্রিম",
    payAtHotelNote: "আগমনের দিন সন্ধ্যা ৬টা পর্যন্ত রুম রাখা হবে। ব্যস্ত সাপ্তাহিক ছুটিতে অনিশ্চিত বুকিং বাতিল হতে পারে।",
    summary: "আপনার থাকা",
    nights: (n: string) => `রুম, ${n} রাত`,
    weekendIncl: (n: string) => `এর মধ্যে ${n} রাত সাপ্তাহিক ছুটির রেট`,
    serviceCharge: (p: string) => `সার্ভিস চার্জ (${p}%)`,
    vat: (p: string) => `ভ্যাট (${p}%)`,
    total: "মোট",
    advance: (p: string) => `নিশ্চিত করতে অগ্রিম (${p}%)`,
    payLater: "চেক-ইনের সময় দেবেন",
    submit: "বুকিংয়ের অনুরোধ পাঠান",
    submitting: "পাঠানো হচ্ছে…",
    pickDates: "দাম দেখতে তারিখ বেছে নিন।",
    unavailable: "এই তারিখগুলোতে স্যুটটি খালি নেই। অন্য তারিখ দেখুন বা হটলাইনে ফোন করুন।",
    available: (n: string) => `এই তারিখে ${n}টি রুম খালি আছে`,
    errors: {
      generic: "বুকিং সম্পন্ন হয়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
      name: "আপনার পুরো নাম লিখুন।",
      phone: "বাংলাদেশি মোবাইল নম্বর লিখুন, যেমন ০১৭১২-৩৪৫৬৭৮।",
      email: "ইমেইল ঠিকানাটি সঠিক মনে হচ্ছে না।",
      dates: "চেক-ইনের পরের একটি চেক-আউট তারিখ বেছে নিন, সর্বোচ্চ ৩০ রাত, এক বছরের মধ্যে।",
      unavailable: "এইমাত্র ওই তারিখের শেষ রুমটি বুক হয়ে গেছে। অন্য তারিখ দেখুন।",
      too_many_guests: "এই স্যুটের জন্য অতিথি বেশি। আরেকটি স্যুট বুক করুন বা হটলাইনে ফোন করুন।",
      not_bookable: "এই জায়গাটি অনলাইনে বুক করা যায় না। হটলাইনে ফোন করুন।",
      not_found: "এই রেফারেন্স ও ফোন নম্বরে কোনো বুকিং পাওয়া যায়নি।",
      trx: "TrxID-তে ৮–১২টি অক্ষর ও সংখ্যা থাকে, যেমন 9K7HX2MQ4T।",
      not_payable: "এই বুকিংয়ে অগ্রিম লাগবে না, অথবা আগেই পরিশোধ করা হয়েছে।",
    },
    guestsMax: (n: string) => `এই স্যুটে সর্বোচ্চ ${n} জন অতিথি।`,
    done: {
      title: "বুকিং পাওয়া গেছে",
      ref: "আপনার বুকিং রেফারেন্স",
      sms: "রেফারেন্সটি সংরক্ষণ করুন। ফ্রন্ট ডেস্ক ফোন করে নিশ্চিত করবে।",
      payTitle: (method: string, amount: string) => `${method}-এ ${amount} অগ্রিম পাঠান`,
      steps: (num: string, ref: string) => [
        `অ্যাপ খুলে ${num} নম্বরে সেন্ড মানি (বা পেমেন্ট) করুন।`,
        `রেফারেন্সে ${ref} লিখুন।`,
        "নিশ্চিতকরণ এসএমএস থেকে ট্রানজেকশন আইডি (TrxID) নিচে লিখুন।",
      ],
      trxLabel: "ট্রানজেকশন আইডি (TrxID)",
      payerLabel: "যে নম্বর থেকে টাকা পাঠিয়েছেন",
      trxSubmit: "পেমেন্ট জমা দিন",
      trxDone: "ধন্যবাদ — পেমেন্ট যাচাই করে আমরা আপনার বুকিং নিশ্চিত করব।",
      bank: "ব্যাংকের তথ্য",
      hotline: "হটলাইন",
      payAtHotel: "এখন কিছু দিতে হবে না। চেক-ইনের সময় এনআইডি বা পাসপোর্ট সঙ্গে আনুন।",
      noNumber: "পেমেন্ট নম্বর এখনো যোগ করা হয়নি। অগ্রিম দিতে হটলাইনে ফোন করুন।",
    },
  },
  notFound: "এই পাতাটি পাওয়া যায়নি।",
};

const dictionaries: Record<Locale, Dictionary> = { en, bn };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Pick the English or Bengali column of a bilingual DB field. */
export function pick<T extends Record<string, unknown>, K extends string>(row: T, base: K, locale: Locale) {
  return row[`${base}${locale === "bn" ? "Bn" : "En"}` as keyof T] as string;
}
