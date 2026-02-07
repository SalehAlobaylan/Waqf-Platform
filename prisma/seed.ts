import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  {
    name: "Technical Writing",
    nameAr: "الكتابة التقنية",
    category: "Other",
  },
  { name: "Arabic NLP", nameAr: "معالجة اللغة العربية", category: "Other" },
  {
    name: "Islamic Content",
    nameAr: "المحتوى الإسلامي",
    category: "Other",
  },
  { name: "Quran Tech", nameAr: "تقنيات القرآن", category: "Other" },
  { name: "Project Management", nameAr: "إدارة المشاريع", category: "Other" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing skills
  await prisma.skill.deleteMany();

  // Insert skills
  for (const skill of skills) {
    await prisma.skill.create({
      data: skill,
    });
  }

  console.log(`✅ Seeded ${skills.length} skills`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
