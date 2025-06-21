// backend/seedAdmin.js
require('dotenv').config();            // loads MONGO_URI from your .env
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Admin    = require('./models/Admin');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // replace these credentials as you like
    const username = "admin";
    const password = "12345";

    // hash the password
    const hash = await bcrypt.hash(password, 12);

    // create or upsert the admin user
    const existing = await Admin.findOne({ username });
    if (existing) {
      console.log('⚠️  Admin already exists – skipping creation');
    } else {
      await Admin.create({ username, password: hash });
      console.log(`✅ Admin user "${username}" created with password "${password}"`);
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
