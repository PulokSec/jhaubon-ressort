import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

const fact = (labelEn: string, labelBn: string, valueEn: string, valueBn: string) => ({ labelEn, labelBn, valueEn, valueBn });

const spaces: Prisma.SpaceCreateInput[] = [
  {
    slug: "garden-suite",
    kind: "SUITE",
    sortOrder: 1,
    nameEn: "Wisteria Garden Suite",
    nameBn: "উইস্টেরিয়া গার্ডেন স্যুট",
    summaryEn: "A stone courtyard of your own, opening onto the living room and bedroom.",
    summaryBn: "নিজস্ব পাথরের উঠোন, যেখান থেকে সরাসরি বসার ঘর আর শোবার ঘরে যাওয়া যায়।",
    descriptionEn:
      "The suite wraps around a private courtyard planted with wisteria. Glass doors fold back so the lounge, the living room and the courtyard become one space in the evening.",
    descriptionBn:
      "স্যুটটি উইস্টেরিয়া লতায় ঘেরা একটি ব্যক্তিগত উঠোন জুড়ে। কাচের দরজা ভাঁজ করে খুলে দিলে সন্ধ্যায় লাউঞ্জ, বসার ঘর আর উঠোন এক হয়ে যায়।",
    facts: [
      fact("Size", "আয়তন", "68 m² including courtyard", "উঠোনসহ ৬৮ বর্গমিটার"),
      fact("Sleeps", "থাকতে পারবেন", "2 adults, 1 child", "২ জন প্রাপ্তবয়স্ক, ১ শিশু"),
      fact("Bed", "খাট", "King", "কিং সাইজ"),
    ],
    bookable: true,
    units: 4,
    maxGuests: 3,
    nightlyRate: 18500,
    weekendRate: 22000,
    splatUrl: "/splats/garden-suite.sog",
    splatRotation: [180, 0, 0],
    posterUrl: "/posters/garden-suite.webp",
    startPose: { position: [-1.96, 1.56, 1.38], target: [-2.2, 1.26, 2.88] },
    viewpoints: [
      {
        id: "courtyard",
        titleEn: "Courtyard lounge",
        titleBn: "উঠোনের লাউঞ্জ",
        bodyEn: "Low sofa, rattan chairs and a living wall of wisteria. Shaded until early afternoon.",
        bodyBn: "নিচু সোফা, বেতের চেয়ার আর উইস্টেরিয়ার সবুজ দেয়াল। দুপুর পর্যন্ত ছায়া থাকে।",
        pose: { position: [-1.96, 1.56, 1.38], target: [-2.2, 1.26, 2.88] },
        marker: [-2.45, 1.05, 3.15],
      },
      {
        id: "living",
        titleEn: "Living room",
        titleBn: "বসার ঘর",
        bodyEn: "Behind the folding glass wall: a lounge chair, TV and shelving, with a dining table for four by the arched door.",
        bodyBn: "ভাঁজ করা কাচের দেয়ালের ওপাশে লাউঞ্জ চেয়ার, টিভি আর তাক, খিলান দরজার পাশে চারজনের খাবার টেবিল।",
        pose: { position: [-2.6, 1.0, 4.0], target: [-4.5, 0.9, 5.5] },
      },
      {
        id: "bedroom",
        titleEn: "Bedroom door",
        titleBn: "শোবার ঘরের দরজা",
        bodyEn: "The bedroom sits off the courtyard, so you can leave the glass open at night and still have privacy.",
        bodyBn: "শোবার ঘরটি উঠোনের পাশে, তাই রাতে কাচ খোলা রেখেও গোপনীয়তা থাকে।",
        pose: { position: [-1.96, 1.4, 2.2], target: [-2.6, 1.1, 4.6] },
      },
    ],
    credit: {
      title: "SA3D_R&D_XP47",
      author: "Stephane Agullo (sa3d.fr)",
      url: "https://superspl.at/view?id=cdcec084",
      license: "CC BY 4.0",
    },
  },
  {
    slug: "lobby",
    kind: "LOBBY",
    sortOrder: 2,
    nameEn: "Gathering Hall",
    nameBn: "গ্যাদারিং হল",
    summaryEn: "The timber hall where check-in, tea and evening events happen.",
    summaryBn: "কাঠের হলঘর, যেখানে চেক-ইন, চা আর সন্ধ্যার আয়োজন হয়।",
    descriptionEn: "Arrivals start here. In the day it is the lobby and tea room; after dinner the chairs come out for music and talks.",
    descriptionBn: "অতিথিদের যাত্রা শুরু এখান থেকে। দিনে এটি লবি আর চায়ের ঘর; রাতের খাবারের পর গান আর আড্ডার জন্য চেয়ার সাজানো হয়।",
    facts: [
      fact("Seats", "আসন", "Up to 80 for events", "অনুষ্ঠানে ৮০ জন পর্যন্ত"),
      fact("Open", "খোলা", "24 hours", "২৪ ঘণ্টা"),
    ],
    splatUrl: "/splats/lobby.sog",
    splatRotation: [0, 0, 180],
    posterUrl: "/posters/lobby.webp",
    startPose: { position: [-4, 1.1, 0], target: [-1.5, 0.7, 0] },
    viewpoints: [
      {
        id: "arrivals",
        titleEn: "Arrivals",
        titleBn: "অভ্যর্থনা",
        bodyEn: "Check-in is at the far end, by the main doors. Tea comes to your table while we sort the paperwork.",
        bodyBn: "চেক-ইন হয় হলের শেষ প্রান্তে, মূল দরজার পাশে। কাগজপত্র তৈরি হতে হতে আপনার টেবিলে চা চলে আসে।",
        pose: { position: [0, 1.1, 0], target: [2.5, 0.8, 0] },
      },
      {
        id: "tea-windows",
        titleEn: "Tea by the windows",
        titleBn: "জানালার পাশে চা",
        bodyEn: "Round tables along the glass wall look straight onto the garden. Tea is served here all day.",
        bodyBn: "কাচের দেয়াল ঘেঁষে গোল টেবিল, সোজা বাগানের দিকে মুখ করা। সারাদিন এখানে চা পরিবেশন করা হয়।",
        pose: { position: [0, 1.1, -0.5], target: [0, 0.7, 2.5] },
      },
      {
        id: "roof",
        titleEn: "Timber roof",
        titleBn: "কাঠের ছাদ",
        bodyEn: "Curved timber ribs hold up the roof, and skylights keep the hall bright through the day.",
        bodyBn: "বাঁকানো কাঠের কাঠামো ছাদ ধরে রেখেছে, আর স্কাইলাইটের আলোয় সারাদিন হল উজ্জ্বল থাকে।",
        pose: { position: [-3, 0.8, 0], target: [-1, 2.4, 0] },
      },
    ],
    credit: {
      title: "Theas Dining Hall",
      author: "saintnyakweba",
      url: "https://superspl.at/view?id=30ae3d93",
      license: "CC BY 4.0",
    },
  },
  {
    slug: "pool",
    kind: "POOL",
    sortOrder: 3,
    nameEn: "Casuarina Pool",
    nameBn: "ঝাউবন পুল",
    summaryEn: "A 25 m pool under the casuarina trees, a short walk from the beach.",
    summaryBn: "ঝাউগাছের নিচে ২৫ মিটারের সুইমিং পুল, সৈকত থেকে অল্প হাঁটা পথ।",
    descriptionEn: "Loungers on the shaded side, a shallow ledge for children, and towels and cold water at the pool hut.",
    descriptionBn: "ছায়ার দিকে লাউঞ্জার, শিশুদের জন্য অগভীর অংশ, আর পুল ঘরে তোয়ালে ও ঠান্ডা পানি।",
    facts: [
      fact("Length", "দৈর্ঘ্য", "25 m", "২৫ মিটার"),
      fact("Depth", "গভীরতা", "0.5 – 1.6 m", "০.৫ – ১.৬ মিটার"),
      fact("Open", "খোলা", "6 am – 9 pm", "সকাল ৬টা – রাত ৯টা"),
    ],
    splatUrl: "/splats/pool.sog",
    splatRotation: [0, 0, 180],
    posterUrl: "/posters/pool.webp",
    startPose: { position: [2.46, 1.06, 5.79], target: [0.63, 0.46, 2.9] },
    viewpoints: [
      {
        id: "shallow-end",
        titleEn: "Children’s pool",
        titleBn: "শিশুদের পুল",
        bodyEn: "A round, shallow pool with wide steps, set apart from the main pool so little ones can splash safely.",
        bodyBn: "চওড়া সিঁড়িসহ গোল অগভীর পুল, মূল পুল থেকে আলাদা, তাই ছোটরা নিশ্চিন্তে পানিতে খেলতে পারে।",
        pose: { position: [2.65, 0.5, -0.9], target: [2.45, 0.1, 0.9] },
      },
      {
        id: "pool-hut",
        titleEn: "Pool hut",
        titleBn: "পুল ঘর",
        bodyEn: "The thatched hut by the deep end has towels, cold water and a shady seat.",
        bodyBn: "গভীর দিকের খড়ের ছাউনির ঘরে তোয়ালে, ঠান্ডা পানি আর ছায়ায় বসার জায়গা।",
        pose: { position: [-0.98, 0.5, -1.22], target: [-4.4, 0.25, -0.8] },
      },
      {
        id: "shaded-side",
        titleEn: "Shaded side",
        titleBn: "ছায়ার দিক",
        bodyEn: "Loungers under the trees, out of the afternoon sun.",
        bodyBn: "গাছের ছায়ায় লাউঞ্জার, বিকেলের রোদ থেকে দূরে।",
        pose: { position: [1.2, 0.53, -3.61], target: [0.98, 0.42, -2.22] },
      },
    ],
    credit: {
      title: "Manica SkyView Hotel pool",
      author: "jindantesparda",
      url: "https://superspl.at/view?id=a40705be",
      license: "CC BY 4.0",
    },
  },
  {
    slug: "spa-bath",
    kind: "BATH",
    sortOrder: 4,
    nameEn: "Suite Bathroom",
    nameBn: "স্যুটের বাথরুম",
    summaryEn: "Rain shower, deep stone basin and a window onto the garden.",
    summaryBn: "রেইন শাওয়ার, পাথরের গভীর বেসিন আর বাগানমুখী জানালা।",
    descriptionEn: "Every suite has the same bathroom: walk-in rain shower, double vanity and natural ventilation.",
    descriptionBn: "প্রতিটি স্যুটে একই রকম বাথরুম: ওয়াক-ইন রেইন শাওয়ার, দুটি বেসিন আর প্রাকৃতিক বাতাস চলাচল।",
    facts: [
      fact("Shower", "শাওয়ার", "Walk-in rain shower", "ওয়াক-ইন রেইন শাওয়ার"),
      fact("Vanity", "বেসিন", "Double basin", "দুটি বেসিন"),
    ],
    splatUrl: "/splats/spa-bath.sog",
    splatRotation: [0, 0, 180],
    posterUrl: "/posters/spa-bath.webp",
    startPose: { position: [-0.18, 0.42, 2.01], target: [-0.13, 0.25, 0.26] },
    viewpoints: [
      {
        id: "vanity",
        titleEn: "Double vanity",
        titleBn: "দুটি বেসিন",
        bodyEn: "Two basins in one slab of veined stone, beside a window onto the garden.",
        bodyBn: "নকশাদার পাথরের একটি স্ল্যাবে দুটি বেসিন, পাশেই বাগানমুখী জানালা।",
        pose: { position: [-0.95, 0.45, 0.98], target: [-0.1, 0.16, 0.41] },
      },
      {
        id: "shower",
        titleEn: "Walk-in shower",
        titleBn: "ওয়াক-ইন শাওয়ার",
        bodyEn: "Frameless glass, a rain head and a hand shower, with a niche for toiletries.",
        bodyBn: "ফ্রেমহীন কাচ, রেইন শাওয়ার আর হ্যান্ড শাওয়ার, প্রসাধনী রাখার তাকসহ।",
        pose: { position: [0.1, 0.57, -0.28], target: [-0.29, 0.39, -0.05] },
      },
    ],
    credit: {
      title: "Modlinek Villa 01-bathroom",
      author: "andriishramko",
      url: "https://superspl.at/view?id=131874fa",
      license: "CC BY 4.0",
    },
  },
];

async function main() {
  for (const s of spaces) {
    await db.space.upsert({ where: { slug: s.slug }, update: {}, create: s });
    // Add captures to spaces seeded before they existed; never overwrite a splat already set in admin.
    if (s.splatUrl) {
      const { splatUrl, splatRotation, posterUrl, startPose, viewpoints, credit } = s;
      await db.space.updateMany({
        where: { slug: s.slug, splatUrl: null },
        data: { splatUrl, splatRotation, posterUrl, startPose, viewpoints, credit },
      });
    }
  }
  await db.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bkashNumber: process.env.SEED_BKASH_NUMBER ?? null,
      nagadNumber: process.env.SEED_NAGAD_NUMBER ?? null,
    },
  });

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await db.adminUser.upsert({
      where: { email },
      update: {},
      create: { email, name: "Owner", role: "OWNER", passwordHash: await bcrypt.hash(password, 12) },
    });
    console.log(`Admin user ready: ${email}`);
  } else {
    console.log("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create the first admin user.");
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
