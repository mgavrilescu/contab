import { PrismaClient, Frequency, ConditionOperator } from "@/lib/generated/prisma-client";
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  // ==== USERS ====
  await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', name: 'Alice' },
      { email: 'bob@example.com', name: 'Bob' },
      { email: 'charlie@example.com', name: 'Charlie' },
      { email: 'diana@example.com', name: 'Diana' },
      { email: 'edward@example.com', name: 'Edward' },
    ],
    skipDuplicates: true,
  });

  // Demo user
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo',
      password: await hash('demo1234', 10),
    },
  });

  // Admin user (configurable via env)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin',
      rol: 'ADMIN',
      password: await hash(adminPassword, 10),
    },
    create: {
      email: adminEmail,
      name: 'Admin',
      rol: 'ADMIN',
      password: await hash(adminPassword, 10),
    },
  });

  console.log('✅ Users seeded');

  // ==== RULES ====
  console.log('🌱 Seeding rules...');

  const rulesData = [
    {
      name: 'Declaratii 300 si 394 - TVA Lunar',
      description: 'Platitor de TVA lunar',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratiile 300 si 394',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'DA_LUNAR' }],
    },
    {
      name: 'Declaratii 300 si 394 - TVA Trimestrial',
      description: 'Platitor de TVA trimestrial',
      frequency: 'QUARTERLY',
      taskTitle: 'Depunere declaratiile 300 si 394',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'DA_TRIM' }],
    },
    {
      name: 'Declaratia 112 - Salarii',
      description: 'Platitor de taxe salariale',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia 112',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'salariati', operator: 'IN', value: 'DA_LUNAR,DA_TRIM' }],
    },
    {
      name: 'Declaratia 100 - Impozit pe profit',
      description: 'Platitor de impozit pe profit',
      frequency: 'QUARTERLY',
      taskTitle: 'Depunere declaratia 100',
      taskNotes: 'Pentru trimestrul IV se depune declaratia 101',
      active: true,
      conditions: [{ field: 'impozit', operator: 'EQUALS', value: 'PROFIT' }],
    },
    {
      name: 'Declaratia 100 - Microintreprindere',
      description: 'Platitor de impozit microintreprindere',
      frequency: 'QUARTERLY',
      taskTitle: 'Depunere declaratia 100',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [
        { field: 'impozit', operator: 'IN', value: 'MICRO_1,MICRO_3' },
        { field: 'salariati', operator: 'IN', value: 'DA_LUNAR,DA_TRIM' },
      ],
    },
    {
      name: 'Declaratia 100 - Dividende',
      description: 'Impozit pe dividende',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia 100',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'dividende', operator: 'IS_TRUE', value: '' }],
    },
    {
      name: 'Declaratia 390 - Achizitii intracomunitare TVA',
      description: 'Achizitii intracomunitare - platitor TVA',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia 390',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'IN', value: 'DA_LUNAR,DA_TRIM' }],
    },
    {
      name: 'Declaratiile 301 si 390 - Achizitii intracomunitare neplatitori',
      description: 'Achizitii intracomunitare - neplatitor TVA',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratiile 301 si 390',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'NU' }],
    },
    {
      name: 'Declaratia 301 - Achizitii din afara UE',
      description: 'Achizitii din afara Uniunii - neplatitor TVA',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia 301',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'NU' }],
    },
    {
      name: 'Bilant interimar',
      description: 'Bilant interimar pentru dividende curente',
      frequency: 'QUARTERLY',
      taskTitle: 'Bilant interimar',
      active: true,
      conditions: [{ field: 'dividende', operator: 'IS_TRUE', value: '' }],
    },
    {
      name: 'Declaratia F4109 - Case de marcat fara operatii',
      description: 'Case de marcat fara operatii',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia F4109',
      taskNotes: 'in fiecare luna fara operatii',
      active: true,
      conditions: [{ field: 'casaDeMarcat', operator: 'IS_TRUE', value: '' }],
    },
    {
      name: 'Declaratia 100 - Impozit nerezidenti',
      description: 'Impozit nerezidenti (ex: Bolt)',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia 100',
      taskNotes: 'cu ordin de plata (OP)',
      active: true,
      conditions: [{ field: 'operatiuneUE', operator: 'IS_TRUE', value: '' }],
    },
    {
      name: 'Declaratia 406 - SAF-T TVA lunar',
      description: 'SAF-T pentru platitor TVA lunar',
      frequency: 'MONTHLY',
      taskTitle: 'Depunere declaratia 406',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'DA_LUNAR' }],
    },
    {
      name: 'Declaratia 406 - SAF-T TVA trimestrial',
      description: 'SAF-T pentru platitor TVA trimestrial',
      frequency: 'QUARTERLY',
      taskTitle: 'Depunere declaratia 406',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'DA_TRIM' }],
    },
    {
      name: 'Declaratia 406 - SAF-T neplatitori TVA',
      description: 'SAF-T pentru neplatitori TVA',
      frequency: 'QUARTERLY',
      taskTitle: 'Depunere declaratia 406',
      active: true,
      conditions: [{ field: 'platitorTVA', operator: 'EQUALS', value: 'NU' }],
    },
  ];

  for (const rule of rulesData) {
    await prisma.rule.upsert({
      where: { name: rule.name },
      update: {
        description: rule.description,
        frequency: Frequency[rule.frequency as keyof typeof Frequency],
        taskTitle: rule.taskTitle,
        taskNotes: rule.taskNotes,
        active: rule.active,
        conditions: {
          deleteMany: {},
          create: rule.conditions.map((c) => ({
            field: c.field,
            operator: ConditionOperator[c.operator as keyof typeof ConditionOperator],
            value: c.value,
          })),
        },
      },
      create: {
        name: rule.name,
        description: rule.description,
        frequency: Frequency[rule.frequency as keyof typeof Frequency],
        taskTitle: rule.taskTitle,
        taskNotes: rule.taskNotes,
        active: rule.active,
        conditions: {
          create: rule.conditions.map((c) => ({
            field: c.field,
            operator: ConditionOperator[c.operator as keyof typeof ConditionOperator],
            value: c.value,
          })),
        },
      },
    });
  }

  console.log('✅ Rules seeded');
}

main()
  .then(async () => {
    console.log('🎉 Seed completed successfully!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
