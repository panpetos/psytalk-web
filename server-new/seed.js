// Seed database with demo data
const bcrypt = require('bcrypt');
const { MySQLStorage } = require('./storage');
const { testConnection, initDatabase } = require('./db');

async function seedDatabase() {
  console.log('\n=== Starting Database Seeding ===\n');

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Cannot seed database - connection failed');
    process.exit(1);
  }

  // Initialize database schema
  await initDatabase();

  const storage = new MySQLStorage();

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminUser = await storage.createUser({
      email: 'admin@psychplatform.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      firstName: 'Администратор',
      lastName: 'Системы',
    });
    console.log('✓ Admin user created:', adminUser.email);

    // Create sample psychologists
    console.log('\nCreating psychologist 1...');
    const psychologist1User = await storage.createUser({
      email: 'anna.petrova@psychplatform.com',
      password: await bcrypt.hash('psychologist123', 10),
      role: 'psychologist',
      firstName: 'Анна',
      lastName: 'Петрова',
    });
    console.log('✓ Psychologist user created:', psychologist1User.email);

    const psychologist1 = await storage.createPsychologist({
      userId: psychologist1User.id,
      specialization: 'Семейная терапия',
      experience: 8,
      education: 'МГУ, факультет психологии',
      certifications: ['Семейная терапия', 'Когнитивно-поведенческая терапия'],
      description: 'Специализируюсь на семейных отношениях, конфликтах в паре и детско-родительских отношениях',
      price: '2500.00',
      formats: ['video', 'audio', 'chat'],
    });
    console.log('✓ Psychologist profile created:', psychologist1.id);
    
    // Approve psychologist 1
    await storage.approvePsychologist(psychologist1.id);
    console.log('✓ Psychologist 1 approved');

    console.log('\nCreating psychologist 2...');
    const psychologist2User = await storage.createUser({
      email: 'mikhail.sidorov@psychplatform.com',
      password: await bcrypt.hash('psychologist123', 10),
      role: 'psychologist',
      firstName: 'Михаил',
      lastName: 'Сидоров',
    });
    console.log('✓ Psychologist user created:', psychologist2User.email);

    const psychologist2 = await storage.createPsychologist({
      userId: psychologist2User.id,
      specialization: 'Когнитивно-поведенческая терапия',
      experience: 12,
      education: 'СПбГУ, клиническая психология',
      certifications: ['КПТ', 'Работа с тревожными расстройствами'],
      description: 'Работаю с тревожными расстройствами, депрессией и паническими атаками',
      price: '3000.00',
      formats: ['video', 'audio'],
    });
    console.log('✓ Psychologist profile created:', psychologist2.id);

    await storage.approvePsychologist(psychologist2.id);
    console.log('✓ Psychologist 2 approved');

    // Create sample client
    console.log('\nCreating client user...');
    const clientUser = await storage.createUser({
      email: 'maria.ivanova@example.com',
      password: await bcrypt.hash('client123', 10),
      role: 'client',
      firstName: 'Мария',
      lastName: 'Иванова',
    });
    console.log('✓ Client user created:', clientUser.email);

    console.log('\n=== Database Seeding Completed Successfully! ===\n');
    console.log('Demo accounts:');
    console.log('Admin:        admin@psychplatform.com / admin123');
    console.log('Psychologist: anna.petrova@psychplatform.com / psychologist123');
    console.log('Psychologist: mikhail.sidorov@psychplatform.com / psychologist123');
    console.log('Client:       maria.ivanova@example.com / client123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
