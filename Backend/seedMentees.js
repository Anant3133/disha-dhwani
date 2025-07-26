// seedMentees.js
require('dotenv').config();
const db = require('./models');

async function seed() {
  try {
    await db.sequelize.sync();

    await db.Mentee.bulkCreate([
      {
        name: 'Test User 1',
        email: 'test1@example.com',
        password_hash: 'hashed_password_1',
        phone_number: '+919000000100',
        current_learning_interest: 'Agriculture',
        learning_level: 'beginner',
        language_preference: 'en-IN',
        status: 'active',
      },
      {
        name: 'Test User 2',
        email: 'test2@example.com',
        password_hash: 'hashed_password_2',
        phone_number: '+919000000101',
        current_learning_interest: 'Technology',
        learning_level: 'intermediate',
        language_preference: 'en-IN',
        status: 'active',
      },
    ]);

    console.log('Mentees seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding mentees:', err);
    process.exit(1);
  }
}

seed();
