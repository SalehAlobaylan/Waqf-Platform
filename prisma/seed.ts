import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const skills = [
  // Frontend
  { name: "React", nameAr: "رياكت", category: "Frontend" },
  { name: "Vue.js", nameAr: "فيو جي اس", category: "Frontend" },
  { name: "Angular", nameAr: "أنجولار", category: "Frontend" },
  { name: "Next.js", nameAr: "نكست جي اس", category: "Frontend" },
  { name: "TypeScript", nameAr: "تايب سكريبت", category: "Frontend" },
  { name: "JavaScript", nameAr: "جافا سكريبت", category: "Frontend" },
  { name: "HTML/CSS", nameAr: "اتش تي ام ال / سي اس اس", category: "Frontend" },
  { name: "Tailwind CSS", nameAr: "تيلويند", category: "Frontend" },
  { name: "SASS/SCSS", nameAr: "ساس", category: "Frontend" },
  // Backend
  { name: "Node.js", nameAr: "نود جي اس", category: "Backend" },
  { name: "Python", nameAr: "بايثون", category: "Backend" },
  { name: "Go", nameAr: "جو", category: "Backend" },
  { name: "Java", nameAr: "جافا", category: "Backend" },
  { name: "PHP", nameAr: "بي اتش بي", category: "Backend" },
  { name: "Ruby", nameAr: "روبي", category: "Backend" },
  { name: "C#", nameAr: "سي شارب", category: "Backend" },
  { name: "Rust", nameAr: "رست", category: "Backend" },
  { name: "Express.js", nameAr: "اكسبريس", category: "Backend" },
  { name: "Django", nameAr: "جانغو", category: "Backend" },
  { name: "FastAPI", nameAr: "فاست ايه بي اي", category: "Backend" },
  // Mobile
  { name: "React Native", nameAr: "رياكت نيتيف", category: "Mobile" },
  { name: "Flutter", nameAr: "فلاتر", category: "Mobile" },
  { name: "Swift", nameAr: "سويفت", category: "Mobile" },
  { name: "Kotlin", nameAr: "كوتلن", category: "Mobile" },
  { name: "iOS Development", nameAr: "تطوير آي أو اس", category: "Mobile" },
  { name: "Android Development", nameAr: "تطوير أندرويد", category: "Mobile" },
  // DevOps
  { name: "Docker", nameAr: "دوكر", category: "DevOps" },
  { name: "Kubernetes", nameAr: "كوبرنيتس", category: "DevOps" },
  { name: "AWS", nameAr: "خدمات أمازون السحابية", category: "DevOps" },
  { name: "Google Cloud", nameAr: "جوجل كلاود", category: "DevOps" },
  { name: "Azure", nameAr: "أزور", category: "DevOps" },
  { name: "CI/CD", nameAr: "التكامل المستمر", category: "DevOps" },
  { name: "Linux", nameAr: "لينكس", category: "DevOps" },
  { name: "Nginx", nameAr: "إنجينكس", category: "DevOps" },
  // Database
  { name: "PostgreSQL", nameAr: "بوستجري اس كيو ال", category: "Database" },
  { name: "MySQL", nameAr: "ماي اس كيو ال", category: "Database" },
  { name: "MongoDB", nameAr: "مونجو دي بي", category: "Database" },
  { name: "Redis", nameAr: "ريديس", category: "Database" },
  { name: "Prisma", nameAr: "بريزما", category: "Database" },
  // Design
  { name: "Figma", nameAr: "فيجما", category: "Design" },
  { name: "UI/UX Design", nameAr: "تصميم واجهات المستخدم", category: "Design" },
  { name: "Graphic Design", nameAr: "التصميم الجرافيكي", category: "Design" },
  { name: "Adobe XD", nameAr: "أدوبي إكس دي", category: "Design" },
  // AI/ML
  { name: "Machine Learning", nameAr: "تعلم الآلة", category: "AI" },
  { name: "Deep Learning", nameAr: "التعلم العميق", category: "AI" },
  { name: "NLP", nameAr: "معالجة اللغات الطبيعية", category: "AI" },
  { name: "TensorFlow", nameAr: "تنسرفلو", category: "AI" },
  { name: "PyTorch", nameAr: "باي تورش", category: "AI" },
  // Other
  { name: "Technical Writing", nameAr: "الكتابة التقنية", category: "Other" },
  { name: "Arabic NLP", nameAr: "معالجة اللغة العربية", category: "Other" },
  { name: "Islamic Content", nameAr: "المحتوى الإسلامي", category: "Other" },
  { name: "Quran Tech", nameAr: "تقنيات القرآن", category: "Other" },
  { name: "Project Management", nameAr: "إدارة المشاريع", category: "Other" },
];

async function getSkill(name: string) {
  return prisma.skill.findUnique({ where: { name } });
}

async function main() {
  console.log("🌱 جاري تهيئة قاعدة البيانات...\n");

  // ===================== المهارات =====================
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }
  console.log(`✅ تم إضافة ${skills.length} مهارة`);

  // ===================== المستخدمون =====================
  const passwordHash = hashPassword("test");

  const usersData = [
    { name: "مدير النظام", email: "admin@gmail.com", role: "ADMIN", lang: "ar" },
    { name: "عمر الفارسي", email: "omar@example.com", role: "USER", lang: "ar" },
    { name: "فاطمة حسن", email: "fatima@example.com", role: "USER", lang: "ar" },
    { name: "يوسف إبراهيم", email: "yusuf@example.com", role: "USER", lang: "ar" },
    { name: "عائشة خان", email: "aisha@example.com", role: "USER", lang: "ar" },
    { name: "خالد منصور", email: "khalid@example.com", role: "USER", lang: "ar" },
    { name: "نورة سالم", email: "noura@example.com", role: "USER", lang: "ar" },
    { name: "أحمد زكي", email: "ahmed@example.com", role: "USER", lang: "ar" },
    { name: "ليلى راشد", email: "layla@example.com", role: "USER", lang: "ar" },
  ];

  const users: Record<string, any> = {};

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        emailVerified: true,
        role: u.role,
        preferredLanguage: u.lang,
      },
    });
    users[u.email] = user;

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: user.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: passwordHash,
      },
    });
  }
  console.log(`✅ تم إضافة ${usersData.length} مستخدم (كلمة المرور: "test")`);

  const admin = users["admin@gmail.com"];
  const omar = users["omar@example.com"];
  const fatima = users["fatima@example.com"];
  const yusuf = users["yusuf@example.com"];
  const aisha = users["aisha@example.com"];
  const khalid = users["khalid@example.com"];
  const noura = users["noura@example.com"];
  const ahmed = users["ahmed@example.com"];
  const layla = users["layla@example.com"];

  // ===================== ملفات المساهمين =====================
  const profiles = [
    {
      userId: omar.id,
      bio: "مطور Full-stack شغوف ببناء أدوات تقنية تخدم المجتمع المسلم.",
      intentionStatement: "أريد استخدام مهاراتي في بناء أدوات تساعد المسلمين حول العالم.",
      timezone: "Asia/Riyadh",
      hoursPerWeek: 15,
      isAvailable: true,
      spokenLanguages: ["ar", "en"],
      discord: "omar_dev#1234",
      preferredCategories: ["QURAN", "PRAYER"] as any,
    },
    {
      userId: fatima.id,
      bio: "مصممة واجهات مستخدم متخصصة في إنشاء تطبيقات إسلامية جميلة وسهلة الاستخدام.",
      intentionStatement: "التصميم هو وسيلتي للمساهمة في خدمة المجتمع.",
      timezone: "Africa/Cairo",
      hoursPerWeek: 10,
      isAvailable: true,
      spokenLanguages: ["ar", "en", "fr"],
      preferredCategories: ["EDUCATION", "COMMUNITY"] as any,
    },
    {
      userId: yusuf.id,
      bio: "مهندس Backend متخصص في بناء واجهات برمجية قابلة للتوسع والبنية التحتية السحابية.",
      intentionStatement: "بناء البنية التحتية الرقمية لمستقبل المجتمع.",
      timezone: "Europe/London",
      hoursPerWeek: 20,
      isAvailable: true,
      spokenLanguages: ["en", "ar"],
      whatsapp: "+447700900000",
      preferredCategories: ["TOOLS", "PRAYER"] as any,
    },
    {
      userId: aisha.id,
      bio: "مطورة تطبيقات جوال متخصصة في Flutter و React Native للتطبيقات الإسلامية.",
      intentionStatement: "كل تطبيق أبنيه هو خطوة نحو تأثير مستمر.",
      timezone: "America/Toronto",
      hoursPerWeek: 12,
      isAvailable: true,
      spokenLanguages: ["en", "ur"],
      preferredCategories: ["QURAN", "CHARITY"] as any,
    },
    {
      userId: khalid.id,
      bio: "عالم بيانات وباحث ذكاء اصطناعي يعمل على معالجة اللغة العربية وتحليل النصوص الإسلامية.",
      intentionStatement: "تطبيق الذكاء الاصطناعي لخدمة العلم والتعليم الإسلامي.",
      timezone: "Asia/Dubai",
      hoursPerWeek: 8,
      isAvailable: false,
      spokenLanguages: ["ar", "en"],
      preferredCategories: ["EDUCATION", "TOOLS"] as any,
    },
    {
      userId: noura.id,
      bio: "كاتبة تقنية ومنشئة محتوى متخصصة في منصات التعليم الإسلامي.",
      intentionStatement: "جعل المعرفة الإسلامية متاحة للجميع من خلال التوثيق الواضح.",
      timezone: "Asia/Riyadh",
      hoursPerWeek: 10,
      isAvailable: true,
      spokenLanguages: ["ar"],
      preferredCategories: ["EDUCATION", "QURAN"] as any,
    },
  ];

  for (const profile of profiles) {
    await prisma.contributorProfile.upsert({
      where: { userId: profile.userId },
      update: {},
      create: profile,
    });
  }
  console.log(`✅ تم إضافة ${profiles.length} ملف مساهم`);

  // ===================== مهارات المساهمين =====================
  const react = await getSkill("React");
  const nextjs = await getSkill("Next.js");
  const ts = await getSkill("TypeScript");
  const python = await getSkill("Python");
  const arabicNlp = await getSkill("Arabic NLP");
  const flutter = await getSkill("Flutter");
  const figma = await getSkill("Figma");
  const uiux = await getSkill("UI/UX Design");
  const nodejs = await getSkill("Node.js");
  const docker = await getSkill("Docker");
  const postgresql = await getSkill("PostgreSQL");
  const tailwind = await getSkill("Tailwind CSS");
  const ml = await getSkill("Machine Learning");
  const reactNative = await getSkill("React Native");
  const techWriting = await getSkill("Technical Writing");
  const go = await getSkill("Go");
  const aws = await getSkill("AWS");
  const fastapi = await getSkill("FastAPI");

  const omarProfile = await prisma.contributorProfile.findUnique({ where: { userId: omar.id } });
  const fatimaProfile = await prisma.contributorProfile.findUnique({ where: { userId: fatima.id } });
  const yusufProfile = await prisma.contributorProfile.findUnique({ where: { userId: yusuf.id } });
  const aishaProfile = await prisma.contributorProfile.findUnique({ where: { userId: aisha.id } });
  const khalidProfile = await prisma.contributorProfile.findUnique({ where: { userId: khalid.id } });
  const nouraProfile = await prisma.contributorProfile.findUnique({ where: { userId: noura.id } });

  const contributorSkills = [
    { contributorId: omarProfile!.id, skillId: react!.id, level: "ADVANCED" as const, yearsExperience: 4 },
    { contributorId: omarProfile!.id, skillId: nextjs!.id, level: "ADVANCED" as const, yearsExperience: 3 },
    { contributorId: omarProfile!.id, skillId: ts!.id, level: "ADVANCED" as const, yearsExperience: 3 },
    { contributorId: omarProfile!.id, skillId: nodejs!.id, level: "INTERMEDIATE" as const, yearsExperience: 4 },
    { contributorId: fatimaProfile!.id, skillId: figma!.id, level: "EXPERT" as const, yearsExperience: 5 },
    { contributorId: fatimaProfile!.id, skillId: uiux!.id, level: "EXPERT" as const, yearsExperience: 6 },
    { contributorId: fatimaProfile!.id, skillId: tailwind!.id, level: "ADVANCED" as const, yearsExperience: 3 },
    { contributorId: yusufProfile!.id, skillId: go!.id, level: "ADVANCED" as const, yearsExperience: 4 },
    { contributorId: yusufProfile!.id, skillId: docker!.id, level: "ADVANCED" as const, yearsExperience: 5 },
    { contributorId: yusufProfile!.id, skillId: aws!.id, level: "INTERMEDIATE" as const, yearsExperience: 3 },
    { contributorId: yusufProfile!.id, skillId: postgresql!.id, level: "ADVANCED" as const, yearsExperience: 4 },
    { contributorId: aishaProfile!.id, skillId: flutter!.id, level: "ADVANCED" as const, yearsExperience: 3 },
    { contributorId: aishaProfile!.id, skillId: reactNative!.id, level: "INTERMEDIATE" as const, yearsExperience: 2 },
    { contributorId: aishaProfile!.id, skillId: ts!.id, level: "INTERMEDIATE" as const, yearsExperience: 2 },
    { contributorId: khalidProfile!.id, skillId: python!.id, level: "EXPERT" as const, yearsExperience: 7 },
    { contributorId: khalidProfile!.id, skillId: ml!.id, level: "ADVANCED" as const, yearsExperience: 4 },
    { contributorId: khalidProfile!.id, skillId: arabicNlp!.id, level: "EXPERT" as const, yearsExperience: 5 },
    { contributorId: nouraProfile!.id, skillId: techWriting!.id, level: "EXPERT" as const, yearsExperience: 4 },
  ];

  for (const cs of contributorSkills) {
    await prisma.contributorSkill.upsert({
      where: { contributorId_skillId: { contributorId: cs.contributorId, skillId: cs.skillId } },
      update: {},
      create: cs,
    });
  }
  console.log(`✅ تم إضافة ${contributorSkills.length} مهارة للمساهمين`);

  // ===================== أعمال سابقة =====================
  const portfolioItems = [
    { contributorId: omarProfile!.id, title: "تطبيق قراءة القرآن", description: "تطبيق حديث لقراءة القرآن مع دعم التلاوة.", url: "https://github.com/example/quran-reader", order: 0 },
    { contributorId: omarProfile!.id, title: "رفيق الصلاة", description: "تطبيق لتتبع الصلوات مع تنبيهات.", url: "https://github.com/example/prayer-companion", order: 1 },
    { contributorId: fatimaProfile!.id, title: "نظام تصميم التطبيقات الإسلامية", description: "نظام تصميم في فيجما للتطبيقات الإسلامية.", url: "https://figma.com/example/islamic-ds", order: 0 },
    { contributorId: aishaProfile!.id, title: "تطبيق عداد الأذكار", description: "تطبيق Flutter لتتبع الأذكار اليومية.", url: "https://github.com/example/dhikr-counter", order: 0 },
    { contributorId: khalidProfile!.id, title: "محلل المشاعر العربية", description: "نموذج NLP لتحليل مشاعر النصوص العربية.", url: "https://github.com/example/arabic-sentiment", order: 0 },
  ];

  for (const item of portfolioItems) {
    const existing = await prisma.portfolioItem.findFirst({
      where: { contributorId: item.contributorId, title: item.title },
    });
    if (!existing) {
      await prisma.portfolioItem.create({ data: item });
    }
  }
  console.log(`✅ تم إضافة ${portfolioItems.length} عمل سابق`);

  // ===================== المنظمات =====================
  const orgs = [
    {
      userId: admin.id,
      name: "مؤسسة بركة التقنية",
      slug: "barakah-tech",
      description: "مؤسسة غير ربحية تبني تقنيات مفتوحة المصدر لخدمة المجتمع المسلم.",
      website: "https://barakahtech.org",
      verified: true,
    },
    {
      userId: omar.id,
      name: "نور الرقمية",
      slug: "noor-digital",
      description: "حلول رقمية للتعليم الإسلامي وبناء المجتمع.",
      website: "https://noordigital.io",
      verified: true,
    },
    {
      userId: fatima.id,
      name: "مصممو الأمة",
      slug: "ummah-designers",
      description: "مجموعة من المصممين المسلمين يبتكرون تجارب رقمية إسلامية جميلة.",
      verified: false,
    },
  ];

  const organizations: Record<string, any> = {};
  for (const org of orgs) {
    const o = await prisma.organization.upsert({
      where: { slug: org.slug },
      update: {},
      create: org,
    });
    organizations[org.slug] = o;
  }
  console.log(`✅ تم إضافة ${orgs.length} منظمة`);

  // ===================== المشاريع =====================
  const projectsData = [
    // قرآن
    {
      ownerId: admin.id,
      title: "متتبع حفظ القرآن",
      slug: "quran-memorization-tracker",
      description: "تطبيق ويب لمساعدة المستخدمين على تتبع تقدمهم في حفظ القرآن مع تذكيرات التكرار المتباعد وتحليلات التقدم.",
      impact: "مساعدة الملايين في الحفاظ على عادات حفظ القرآن المنتظمة باستخدام تقنيات تعلم مثبتة.",
      category: "QURAN" as const,
      language: "BOTH" as const,
      country: "SA",
      status: "OPEN" as const,
      timeCommitment: "١٠-١٥ ساعة/أسبوع",
      duration: "٣ أشهر",
      featured: true,
      tags: ["mock-test", "تطبيق-ويب", "تكرار-متباعد", "حفظ"],
      skills: [
        { name: "React", required: true },
        { name: "Next.js", required: true },
        { name: "TypeScript", required: true },
        { name: "Tailwind CSS", required: false },
      ],
    },
    {
      ownerId: omar.id,
      title: "منصة تعلم التجويد",
      slug: "tajweed-learning-platform",
      description: "منصة تفاعلية لتعلم أحكام تلاوة القرآن مع التعرف على الصوت والملاحظات الفورية.",
      impact: "جعل تعليم التجويد متاحًا لأي شخص لديه اتصال بالإنترنت.",
      category: "QURAN" as const,
      language: "ARABIC" as const,
      country: "EG",
      status: "OPEN" as const,
      timeCommitment: "١٥-٢٠ ساعة/أسبوع",
      duration: "٦ أشهر",
      featured: true,
      tags: ["mock-test", "صوتيات", "تعليم-إلكتروني", "تلاوة"],
      skills: [
        { name: "React", required: true },
        { name: "Python", required: true },
        { name: "Machine Learning", required: false },
      ],
    },
    {
      ownerId: omar.id,
      organizationId: organizations["noor-digital"].id,
      title: "محرك بحث التفسير",
      slug: "quran-tafsir-search",
      description: "محرك بحث دلالي للتفسير يدعم البحث عبر كتب التفسير الكلاسيكية والحديثة المتعددة.",
      impact: "جعل قرون من العلم الإسلامي قابلة للبحث ومتاحة للباحثين والطلاب.",
      category: "QURAN" as const,
      language: "BOTH" as const,
      country: "SA",
      status: "IN_PROGRESS" as const,
      timeCommitment: "١٠-١٥ ساعة/أسبوع",
      duration: "٤ أشهر",
      tags: ["mock-test", "محرك-بحث", "تفسير", "معالجة-لغة"],
      skills: [
        { name: "Python", required: true },
        { name: "Arabic NLP", required: true },
        { name: "PostgreSQL", required: true },
        { name: "Next.js", required: false },
      ],
    },
    // صلاة
    {
      ownerId: yusuf.id,
      title: "واجهة مواقيت الصلاة",
      slug: "islamic-prayer-times-api",
      description: "واجهة برمجية مفتوحة المصدر ودقيقة لحساب مواقيت الصلاة تدعم طرق حساب متعددة.",
      impact: "توفير بيانات مواقيت صلاة موثوقة للتطبيقات حول العالم.",
      category: "PRAYER" as const,
      language: "ENGLISH" as const,
      country: "US",
      status: "OPEN" as const,
      timeCommitment: "٥-١٠ ساعات/أسبوع",
      duration: "شهران",
      tags: ["mock-test", "واجهة-برمجية", "مفتوح-المصدر", "حسابات"],
      skills: [
        { name: "Python", required: true },
        { name: "FastAPI", required: true },
        { name: "Docker", required: false },
      ],
    },
    {
      ownerId: admin.id,
      organizationId: organizations["barakah-tech"].id,
      title: "تطبيق البحث عن المساجد",
      slug: "mosque-finder-app",
      description: "تطبيق جوال للعثور على المساجد القريبة مع مواقيت الصلاة وجداول الجمعة والفعاليات المجتمعية.",
      impact: "مساعدة المستخدمين في العثور على المساجد وأماكن الصلاة أينما سافروا.",
      category: "PRAYER" as const,
      language: "BOTH" as const,
      country: "US",
      status: "OPEN" as const,
      timeCommitment: "١٠-١٥ ساعة/أسبوع",
      duration: "٤ أشهر",
      featured: true,
      tags: ["mock-test", "جوال", "موقع-جغرافي", "مساجد"],
      skills: [
        { name: "Flutter", required: true },
        { name: "Node.js", required: true },
        { name: "Google Cloud", required: false },
      ],
    },
    {
      ownerId: yusuf.id,
      title: "خدمة تنبيهات الأذان",
      slug: "adhan-notification-service",
      description: "خدمة تنبيهات متعددة المنصات تقدم تنبيهات أذان دقيقة مع طرق حساب قابلة للتخصيص.",
      impact: "عدم تفويت أي صلاة مع تنبيهات موثوقة على أي جهاز.",
      category: "PRAYER" as const,
      language: "ENGLISH" as const,
      country: "UK",
      status: "DRAFT" as const,
      timeCommitment: "٥-٨ ساعات/أسبوع",
      duration: "شهران",
      tags: ["mock-test", "تنبيهات", "متعدد-المنصات", "أذان"],
      skills: [
        { name: "Node.js", required: true },
        { name: "TypeScript", required: true },
        { name: "Redis", required: false },
      ],
    },
    // إحسان
    {
      ownerId: fatima.id,
      title: "مصنف الأعمال الخيرية العربية",
      slug: "arabic-charity-classifier",
      description: "نموذج تعلم آلي لتصنيف وتنظيم المحتوى الخيري العربي لتحسين إمكانية الاكتشاف.",
      impact: "تحسين قابلية اكتشاف المشاريع الخيرية في العالم العربي.",
      category: "CHARITY" as const,
      language: "ARABIC" as const,
      country: "EG",
      status: "OPEN" as const,
      timeCommitment: "١٠-٢٠ ساعة/أسبوع",
      duration: "٤ أشهر",
      featured: true,
      tags: ["mock-test", "تعلم-آلي", "عربي", "تصنيف"],
      skills: [
        { name: "Python", required: true },
        { name: "Arabic NLP", required: true },
        { name: "TensorFlow", required: false },
      ],
    },
    {
      ownerId: admin.id,
      title: "حاسبة الزكاة الاحترافية",
      slug: "zakat-calculator-pro",
      description: "أداة شاملة لحساب الزكاة تدعم أنواع أصول متعددة وعملات ومذاهب فقهية.",
      impact: "مساعدة المستخدمين في حساب التزاماتهم الزكوية بدقة.",
      category: "CHARITY" as const,
      language: "BOTH" as const,
      country: "MY",
      status: "OPEN" as const,
      timeCommitment: "٨-١٢ ساعة/أسبوع",
      duration: "٣ أشهر",
      tags: ["mock-test", "مالية", "زكاة", "حاسبة"],
      skills: [
        { name: "React", required: true },
        { name: "TypeScript", required: true },
        { name: "Node.js", required: false },
      ],
    },
    {
      ownerId: khalid.id,
      title: "متتبع الأوقاف",
      slug: "waqf-endowment-tracker",
      description: "نظام تتبع أوقاف شفاف باستخدام البلوكتشين للمنظمات التي تدير الأوقاف الخيرية.",
      impact: "تعزيز الشفافية والثقة في الأوقاف الخيرية حول العالم.",
      category: "CHARITY" as const,
      language: "ENGLISH" as const,
      country: "AE",
      status: "PENDING" as const,
      timeCommitment: "١٥-٢٠ ساعة/أسبوع",
      duration: "٦ أشهر",
      tags: ["mock-test", "بلوكتشين", "شفافية", "أوقاف"],
      skills: [
        { name: "TypeScript", required: true },
        { name: "Node.js", required: true },
        { name: "PostgreSQL", required: true },
      ],
    },
    // تعليم
    {
      ownerId: noura.id,
      title: "نظام إدارة الدراسات الإسلامية",
      slug: "islamic-studies-lms",
      description: "نظام إدارة تعلم مصمم لمؤسسات الدراسات الإسلامية مع إدارة الدورات والتقييمات وتتبع الشهادات.",
      impact: "تحديث مؤسسات التعليم الإسلامي بأدوات رقمية مخصصة.",
      category: "EDUCATION" as const,
      language: "ARABIC" as const,
      country: "SA",
      status: "OPEN" as const,
      timeCommitment: "١٥-٢٠ ساعة/أسبوع",
      duration: "٦ أشهر",
      tags: ["mock-test", "نظام-تعلم", "تعليم", "دورات"],
      skills: [
        { name: "Next.js", required: true },
        { name: "PostgreSQL", required: true },
        { name: "TypeScript", required: true },
        { name: "Prisma", required: false },
      ],
    },
    {
      ownerId: ahmed.id,
      title: "الحروف العربية للأطفال",
      slug: "arabic-alphabet-kids",
      description: "تطبيق جوال تفاعلي ومسلي لتعليم الحروف العربية وأساسيات قراءة القرآن للأطفال من ٣ إلى ٨ سنوات.",
      impact: "منح كل طفل بداية ممتعة وجذابة لتعلم العربية وقراءة القرآن.",
      category: "EDUCATION" as const,
      language: "BOTH" as const,
      country: "US",
      status: "OPEN" as const,
      timeCommitment: "١٠-١٥ ساعة/أسبوع",
      duration: "٥ أشهر",
      featured: true,
      tags: ["mock-test", "ألعاب-تعليمية", "أطفال", "تعلم-العربية"],
      skills: [
        { name: "Flutter", required: true },
        { name: "UI/UX Design", required: true },
        { name: "Figma", required: false },
      ],
    },
    {
      ownerId: khalid.id,
      title: "أداة التحقق من الأحاديث",
      slug: "hadith-authentication-tool",
      description: "أداة مدعومة بالذكاء الاصطناعي لمساعدة طلاب العلم في التحقق من صحة الأحاديث والعثور على الروايات ذات الصلة عبر المجموعات الرئيسية.",
      impact: "جعل التحقق من الأحاديث متاحًا ودقيقًا للباحثين والطلاب.",
      category: "EDUCATION" as const,
      language: "BOTH" as const,
      country: "JO",
      status: "OPEN" as const,
      timeCommitment: "١٠-١٥ ساعة/أسبوع",
      duration: "٤ أشهر",
      tags: ["mock-test", "ذكاء-اصطناعي", "أحاديث", "تحقق"],
      skills: [
        { name: "Python", required: true },
        { name: "Arabic NLP", required: true },
        { name: "Next.js", required: false },
        { name: "Machine Learning", required: true },
      ],
    },
    // مجتمع
    {
      ownerId: aisha.id,
      title: "مركز المجتمع المسلم",
      slug: "muslim-community-hub",
      description: "تطبيق جوال يربط المجتمعات المسلمة المحلية للفعاليات والتطوع ومشاركة المعرفة.",
      impact: "تقوية الروابط المجتمعية عالميًا من خلال الاتصال الرقمي.",
      category: "COMMUNITY" as const,
      language: "BOTH" as const,
      country: "UK",
      status: "OPEN" as const,
      timeCommitment: "١٥-٢٠ ساعة/أسبوع",
      duration: "٦ أشهر",
      tags: ["mock-test", "اجتماعي", "فعاليات", "بناء-مجتمع"],
      skills: [
        { name: "Flutter", required: true },
        { name: "Node.js", required: true },
        { name: "TypeScript", required: false },
      ],
    },
    {
      ownerId: layla.id,
      title: "شبكة المسلمات في التقنية",
      slug: "muslimah-tech-network",
      description: "منصة تربط المسلمات العاملات في التقنية للإرشاد والتعاون والتطوير المهني.",
      impact: "تمكين المسلمات في مجال التقنية من خلال المجتمع والإرشاد والفرص.",
      category: "COMMUNITY" as const,
      language: "ENGLISH" as const,
      country: "US",
      status: "OPEN" as const,
      timeCommitment: "٨-١٢ ساعة/أسبوع",
      duration: "٣ أشهر",
      tags: ["mock-test", "شبكات", "إرشاد", "نساء-في-التقنية"],
      skills: [
        { name: "React", required: true },
        { name: "Next.js", required: true },
        { name: "UI/UX Design", required: false },
      ],
    },
    {
      ownerId: ahmed.id,
      organizationId: organizations["noor-digital"].id,
      title: "نظام إدارة المساجد",
      slug: "mosque-management-system",
      description: "نظام إدارة شامل للمساجد يشمل تتبع التبرعات وجدولة الفعاليات وإعلانات المجتمع.",
      impact: "مساعدة إداريي المساجد على التركيز على المجتمع بدلاً من الأعمال الورقية.",
      category: "COMMUNITY" as const,
      language: "BOTH" as const,
      country: "CA",
      status: "COMPLETED" as const,
      timeCommitment: "١٠-١٥ ساعة/أسبوع",
      duration: "٤ أشهر",
      tags: ["mock-test", "إدارة", "مساجد", "تبرعات"],
      skills: [
        { name: "Next.js", required: true },
        { name: "PostgreSQL", required: true },
        { name: "TypeScript", required: true },
      ],
    },
    // أدوات
    {
      ownerId: yusuf.id,
      title: "واجهة التقويم الهجري",
      slug: "hijri-calendar-api",
      description: "واجهة برمجية سريعة ودقيقة لتحويل التقويم الهجري مع دعم تعديل رؤية الهلال.",
      impact: "توفير أدق تحويلات التاريخ الهجري للتطبيقات والمواقع حول العالم.",
      category: "TOOLS" as const,
      language: "ENGLISH" as const,
      country: "UK",
      status: "OPEN" as const,
      timeCommitment: "٥-٨ ساعات/أسبوع",
      duration: "شهران",
      tags: ["mock-test", "واجهة-برمجية", "تقويم", "تحويل"],
      skills: [
        { name: "Go", required: true },
        { name: "Docker", required: false },
        { name: "AWS", required: false },
      ],
    },
    {
      ownerId: omar.id,
      title: "نظام التصميم الإسلامي",
      slug: "islamic-design-system",
      description: "مكتبة مكونات واجهة مستخدم مفتوحة المصدر مع أنماط هندسية ودعم الخط العربي ومكونات RTL أولاً.",
      impact: "تزويد المطورين بمكونات جميلة وجاهزة للاستخدام في التطبيقات الإسلامية.",
      category: "TOOLS" as const,
      language: "BOTH" as const,
      country: "SA",
      status: "OPEN" as const,
      timeCommitment: "١٠-١٢ ساعة/أسبوع",
      duration: "٤ أشهر",
      tags: ["mock-test", "نظام-تصميم", "مكتبة-واجهات", "RTL"],
      skills: [
        { name: "React", required: true },
        { name: "TypeScript", required: true },
        { name: "Tailwind CSS", required: true },
        { name: "Figma", required: false },
      ],
    },
    {
      ownerId: admin.id,
      organizationId: organizations["barakah-tech"].id,
      title: "ماسح الأطعمة الحلال",
      slug: "halal-food-scanner",
      description: "تطبيق جوال يمسح باركود الأطعمة وقوائم المكونات لتحديد حالة الحلال باستخدام قاعدة بيانات يديرها المجتمع.",
      impact: "جعل التحقق من الأطعمة الحلال فوريًا وموثوقًا للمستخدمين في كل مكان.",
      category: "TOOLS" as const,
      language: "BOTH" as const,
      country: "US",
      status: "OPEN" as const,
      timeCommitment: "١٢-١٥ ساعة/أسبوع",
      duration: "٥ أشهر",
      featured: true,
      tags: ["mock-test", "جوال", "ماسح-باركود", "حلال"],
      skills: [
        { name: "React Native", required: true },
        { name: "Node.js", required: true },
        { name: "MongoDB", required: false },
        { name: "Machine Learning", required: false },
      ],
    },
    {
      ownerId: khalid.id,
      title: "واجهة معجم المصطلحات الإسلامية",
      slug: "islamic-terms-glossary-api",
      description: "واجهة برمجية متعددة اللغات توفر تعريفات ونقحرة ونطق صوتي للمصطلحات الإسلامية.",
      impact: "مساعدة المسلمين الجدد والطلاب على فهم المصطلحات الإسلامية بدقة.",
      category: "TOOLS" as const,
      language: "BOTH" as const,
      country: "AE",
      status: "CANCELLED" as const,
      timeCommitment: "٥-٨ ساعات/أسبوع",
      duration: "شهران",
      tags: ["mock-test", "واجهة-برمجية", "معجم", "متعدد-اللغات"],
      skills: [
        { name: "FastAPI", required: true },
        { name: "Python", required: true },
        { name: "PostgreSQL", required: false },
      ],
    },
  ];

  for (const { skills: projectSkills, ...projectData } of projectsData) {
    const project = await prisma.project.upsert({
      where: { slug: projectData.slug },
      update: {},
      create: projectData,
    });

    for (const ps of projectSkills) {
      const skill = await getSkill(ps.name);
      if (skill) {
        await prisma.projectSkill.upsert({
          where: { projectId_skillId: { projectId: project.id, skillId: skill.id } },
          update: {},
          create: { projectId: project.id, skillId: skill.id, isRequired: ps.required },
        });
      }
    }
  }
  console.log(`✅ تم إضافة ${projectsData.length} مشروع`);

  // ===================== الطلبات =====================
  const quranTracker = await prisma.project.findUnique({ where: { slug: "quran-memorization-tracker" } });
  const prayerApi = await prisma.project.findUnique({ where: { slug: "islamic-prayer-times-api" } });
  const charityClassifier = await prisma.project.findUnique({ where: { slug: "arabic-charity-classifier" } });
  const communityHub = await prisma.project.findUnique({ where: { slug: "muslim-community-hub" } });
  const mosqueFinder = await prisma.project.findUnique({ where: { slug: "mosque-finder-app" } });
  const islamicLms = await prisma.project.findUnique({ where: { slug: "islamic-studies-lms" } });
  const designSystem = await prisma.project.findUnique({ where: { slug: "islamic-design-system" } });
  const halalScanner = await prisma.project.findUnique({ where: { slug: "halal-food-scanner" } });
  const zakatCalc = await prisma.project.findUnique({ where: { slug: "zakat-calculator-pro" } });
  const hijriApi = await prisma.project.findUnique({ where: { slug: "hijri-calendar-api" } });

  const applicationsData = [
    { projectId: quranTracker!.id, contributorId: omar.id, status: "ACCEPTED" as const, message: "لدي خبرة في بناء أدوات تعليمية باستخدام React و Next.js. أرغب في المساهمة!", hoursPerWeek: 12 },
    { projectId: quranTracker!.id, contributorId: fatima.id, status: "PENDING" as const, message: "يمكنني المساعدة في تصميم واجهة المستخدم. لدي معرض أعمال في هذا المجال.", hoursPerWeek: 8 },
    { projectId: prayerApi!.id, contributorId: yusuf.id, status: "ACCEPTED" as const, message: "بنيت واجهات برمجية مشابهة من قبل. سعيد بالمساهمة بخبرتي.", hoursPerWeek: 10 },
    { projectId: prayerApi!.id, contributorId: khalid.id, status: "PENDING" as const, message: "يمكنني المساعدة في خوارزميات الحساب والاختبار.", hoursPerWeek: 5 },
    { projectId: charityClassifier!.id, contributorId: khalid.id, status: "ACCEPTED" as const, message: "معالجة اللغة العربية تخصصي. عملت على مهام تصنيف مشابهة.", hoursPerWeek: 15 },
    { projectId: communityHub!.id, contributorId: omar.id, status: "PENDING" as const, message: "أرغب في المساعدة في بناء واجهة هذه المنصة المجتمعية.", hoursPerWeek: 10 },
    { projectId: communityHub!.id, contributorId: noura.id, status: "REJECTED" as const, message: "يمكنني المساهمة في جانب المحتوى والتوثيق.", hoursPerWeek: 6 },
    { projectId: mosqueFinder!.id, contributorId: aisha.id, status: "ACCEPTED" as const, message: "Flutter نقطة قوتي. يمكنني بناء التطبيق من الصفر.", hoursPerWeek: 15 },
    { projectId: mosqueFinder!.id, contributorId: ahmed.id, status: "PENDING" as const, message: "يمكنني المساعدة في تطوير الواجهة البرمجية الخلفية لبيانات المساجد.", hoursPerWeek: 8 },
    { projectId: islamicLms!.id, contributorId: omar.id, status: "PENDING" as const, message: "لدي خبرة في منصات إدارة التعلم وأرغب في المساعدة.", hoursPerWeek: 12 },
    { projectId: islamicLms!.id, contributorId: fatima.id, status: "ACCEPTED" as const, message: "يمكنني تصميم واجهة المستخدم الكاملة لنظام إدارة التعلم.", hoursPerWeek: 10 },
    { projectId: designSystem!.id, contributorId: fatima.id, status: "ACCEPTED" as const, message: "هذا تخصصي بالضبط! أرغب في تصميم مكتبة المكونات.", hoursPerWeek: 12 },
    { projectId: designSystem!.id, contributorId: aisha.id, status: "PENDING" as const, message: "يمكنني المساعدة في تنفيذ مكونات React.", hoursPerWeek: 8 },
    { projectId: halalScanner!.id, contributorId: aisha.id, status: "PENDING" as const, message: "تطوير تطبيقات React Native الجوالة نقطة قوتي!", hoursPerWeek: 12 },
    { projectId: halalScanner!.id, contributorId: yusuf.id, status: "ACCEPTED" as const, message: "يمكنني بناء الواجهة البرمجية الخلفية وإدارة قاعدة بيانات الباركود.", hoursPerWeek: 10 },
    { projectId: zakatCalc!.id, contributorId: omar.id, status: "ACCEPTED" as const, message: "سأتولى واجهة React ومنطق الحساب.", hoursPerWeek: 10 },
    { projectId: hijriApi!.id, contributorId: yusuf.id, status: "ACCEPTED" as const, message: "واجهات Go البرمجية تخصصي. سأجعلها سريعة جدًا.", hoursPerWeek: 8 },
    { projectId: hijriApi!.id, contributorId: ahmed.id, status: "WITHDRAWN" as const, message: "مهتم لكن قد لا يكون لدي وقت كافٍ هذا الربع.", hoursPerWeek: 5 },
  ];

  const applications: Record<string, any> = {};
  for (const app of applicationsData) {
    const key = `${app.projectId}-${app.contributorId}`;
    const a = await prisma.application.upsert({
      where: { projectId_contributorId: { projectId: app.projectId, contributorId: app.contributorId } },
      update: {},
      create: app,
    });
    applications[key] = a;
  }
  console.log(`✅ تم إضافة ${applicationsData.length} طلب`);

  // ===================== الرسائل =====================
  const messagesData = [
    { appKey: `${quranTracker!.id}-${omar.id}`, senderId: admin.id, content: "أهلاً عمر! لنبدأ بميزة تتبع الحفظ." },
    { appKey: `${quranTracker!.id}-${omar.id}`, senderId: omar.id, content: "شكرًا! سأبدأ بإعداد هيكل مشروع Next.js." },
    { appKey: `${quranTracker!.id}-${omar.id}`, senderId: admin.id, content: "ممتاز. يرجى الاطلاع على تصاميم Figma التي شاركتها للوحة التحكم." },
    { appKey: `${prayerApi!.id}-${yusuf.id}`, senderId: admin.id, content: "يوسف، هل يمكنك البدء بتطبيق طريقة حساب أم القرى؟" },
    { appKey: `${prayerApi!.id}-${yusuf.id}`, senderId: yusuf.id, content: "بالتأكيد، سأجهز طلب المراجعة بنهاية هذا الأسبوع." },
    { appKey: `${charityClassifier!.id}-${khalid.id}`, senderId: fatima.id, content: "خالد، جهزت مجموعة البيانات. هل يمكنك البدء بتدريب النموذج؟" },
    { appKey: `${charityClassifier!.id}-${khalid.id}`, senderId: khalid.id, content: "مجموعة البيانات شاملة. سأبدأ المعالجة المسبقة الآن." },
    { appKey: `${designSystem!.id}-${fatima.id}`, senderId: omar.id, content: "فاطمة، لنتفق على لوحة الألوان. أفكر بدرجات الزمرد والذهبي." },
    { appKey: `${designSystem!.id}-${fatima.id}`, senderId: fatima.id, content: "رائع! سأحضر بعض النماذج بتلك الألوان." },
    { appKey: `${designSystem!.id}-${fatima.id}`, senderId: omar.id, content: "ممتاز. لنخطط أيضًا لمكتبة الأنماط الهندسية." },
    { appKey: `${mosqueFinder!.id}-${aisha.id}`, senderId: admin.id, content: "عائشة، تطبيق Flutter يجب أن يدعم iOS و Android. أي ملاحظات؟" },
    { appKey: `${mosqueFinder!.id}-${aisha.id}`, senderId: aisha.id, content: "لا مشاكل! Flutter يتعامل مع المنصتين بشكل ممتاز. سأجهز المشروع اليوم." },
  ];

  let msgCount = 0;
  for (const msg of messagesData) {
    const app = applications[msg.appKey];
    if (app) {
      await prisma.message.create({
        data: {
          applicationId: app.id,
          senderId: msg.senderId,
          content: msg.content,
        },
      });
      msgCount++;
    }
  }
  console.log(`✅ تم إضافة ${msgCount} رسالة`);

  // ===================== الإشعارات =====================
  const notificationsData = [
    { userId: admin.id, type: "NEW_APPLICATION", title: "طلب جديد", content: "تقدمت فاطمة حسن لمشروع متتبع حفظ القرآن", link: "/dashboard/applications" },
    { userId: admin.id, type: "NEW_APPLICATION", title: "طلب جديد", content: "تقدم خالد منصور لمشروع واجهة مواقيت الصلاة", link: "/dashboard/applications" },
    { userId: admin.id, type: "NEW_APPLICATION", title: "طلب جديد", content: "تقدم أحمد زكي لمشروع البحث عن المساجد", link: "/dashboard/applications" },
    { userId: omar.id, type: "APPLICATION_ACCEPTED", title: "تم قبول طلبك!", content: "تم قبول طلبك في مشروع متتبع حفظ القرآن", link: "/dashboard/applications", read: true },
    { userId: omar.id, type: "NEW_MESSAGE", title: "رسالة جديدة", content: "أرسل لك المدير رسالة حول متتبع حفظ القرآن", link: "/dashboard/messages" },
    { userId: fatima.id, type: "APPLICATION_ACCEPTED", title: "تم قبول طلبك!", content: "تم قبول طلبك في نظام إدارة الدراسات الإسلامية", link: "/dashboard/applications", read: true },
    { userId: fatima.id, type: "APPLICATION_ACCEPTED", title: "تم قبول طلبك!", content: "تم قبول طلبك في نظام التصميم الإسلامي", link: "/dashboard/applications" },
    { userId: yusuf.id, type: "APPLICATION_ACCEPTED", title: "تم قبول طلبك!", content: "تم قبول طلبك في واجهة مواقيت الصلاة", link: "/dashboard/applications", read: true },
    { userId: yusuf.id, type: "NEW_MESSAGE", title: "رسالة جديدة", content: "أرسل لك المدير رسالة حول واجهة مواقيت الصلاة", link: "/dashboard/messages" },
    { userId: aisha.id, type: "APPLICATION_ACCEPTED", title: "تم قبول طلبك!", content: "تم قبول طلبك في تطبيق البحث عن المساجد", link: "/dashboard/applications" },
    { userId: khalid.id, type: "APPLICATION_ACCEPTED", title: "تم قبول طلبك!", content: "تم قبول طلبك في مصنف الأعمال الخيرية العربية", link: "/dashboard/applications", read: true },
    { userId: khalid.id, type: "NEW_MESSAGE", title: "رسالة جديدة", content: "أرسلت لك فاطمة رسالة حول مجموعة بيانات المصنف", link: "/dashboard/messages" },
    { userId: noura.id, type: "APPLICATION_REJECTED", title: "تحديث الطلب", content: "لم يتم قبول طلبك في مركز المجتمع المسلم في هذا الوقت", link: "/dashboard/applications" },
    { userId: ahmed.id, type: "NEW_APPLICATION", title: "طلب جديد", content: "تقدم أحمد زكي لمشروع البحث عن المساجد", link: "/dashboard/applications" },
    { userId: aisha.id, type: "NEW_MESSAGE", title: "رسالة جديدة", content: "أرسل لك المدير رسالة حول تطبيق البحث عن المساجد", link: "/dashboard/messages" },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }
  console.log(`✅ تم إضافة ${notificationsData.length} إشعار`);

  // ===================== البلاغات =====================
  const reportsData = [
    { reporterId: omar.id, targetType: "PROJECT", targetId: "fake-project-id", reason: "محتوى مزعج", details: "هذا المشروع يبدو محتوى مزعج بدون محتوى حقيقي.", status: "PENDING" as const },
    { reporterId: fatima.id, targetType: "USER", targetId: "fake-user-id", reason: "محتوى غير لائق", details: "المستخدم لديه صورة ملف شخصي غير لائقة.", status: "REVIEWED" as const },
    { reporterId: yusuf.id, targetType: "PROJECT", targetId: "fake-project-id-2", reason: "وصف مضلل", details: "وصف المشروع لا يتطابق مع العمل الفعلي.", status: "RESOLVED" as const, resolvedBy: admin.id },
  ];

  for (const r of reportsData) {
    await prisma.report.create({ data: r });
  }
  console.log(`✅ تم إضافة ${reportsData.length} بلاغ`);

  console.log("\n🎉 اكتملت التهيئة! جميع أقسام المحتوى مغطاة.");
  console.log("\n📋 بيانات تسجيل الدخول (كلمة المرور: 'test'):");
  console.log("   المدير:     admin@gmail.com");
  console.log("   المستخدمون: omar@example.com, fatima@example.com, yusuf@example.com,");
  console.log("               aisha@example.com, khalid@example.com, noura@example.com,");
  console.log("               ahmed@example.com, layla@example.com");
}

main()
  .catch((e) => {
    console.error("❌ خطأ في التهيئة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
