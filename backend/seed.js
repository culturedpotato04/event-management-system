/**
 * Seed Script - Development Demo Data
 * Run: node seed.js
 * Run with clear: node seed.js --clear
 * 
 * Demo Accounts:
 * admin@eventix.com     / Admin@123456
 * organizer@eventix.com / Organizer@123456
 * user1@eventix.com     / User@123456
 * user2@eventix.com     / User@123456
 * user3@eventix.com     / User@123456
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Category = require('./models/Category');
const Venue = require('./models/Venue');
const Event = require('./models/Event');
const TicketType = require('./models/TicketType');

const MONGO_URI = process.env.MONGO_URI;
const shouldClear = process.argv.includes('--clear');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    if (shouldClear) {
      console.log('Clearing existing seed collections...');
      await User.deleteMany({});
      await Category.deleteMany({});
      await Venue.deleteMany({});
      await Event.deleteMany({});
      await TicketType.deleteMany({});
      console.log('Collections cleared.');
    }

    // ===========================
    // USERS
    // ===========================
    const hashedAdminPass = await bcrypt.hash('Admin@123456', 10);
    const hashedOrgPass   = await bcrypt.hash('Organizer@123456', 10);
    const hashedUserPass  = await bcrypt.hash('User@123456', 10);

    let admin = await User.findOne({ email: 'admin@eventix.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@eventix.com',
        password: hashedAdminPass,
        role: 'admin',
        status: 'active'
      });
      console.log('Admin user created.');
    } else {
      console.log('Admin user already exists, skipping.');
    }

    let organizer = await User.findOne({ email: 'organizer@eventix.com' });
    if (!organizer) {
      organizer = await User.create({
        name: 'Event Organizer',
        email: 'organizer@eventix.com',
        password: hashedOrgPass,
        role: 'organizer',
        status: 'active'
      });
      console.log('Organizer user created.');
    } else {
      console.log('Organizer user already exists, skipping.');
    }

    let user1 = await User.findOne({ email: 'user1@eventix.com' });
    if (!user1) {
      user1 = await User.create({
        name: 'Alice Johnson',
        email: 'user1@eventix.com',
        password: hashedUserPass,
        role: 'user',
        status: 'active'
      });
      console.log('User1 created.');
    }

    let user2 = await User.findOne({ email: 'user2@eventix.com' });
    if (!user2) {
      user2 = await User.create({
        name: 'Bob Smith',
        email: 'user2@eventix.com',
        password: hashedUserPass,
        role: 'user',
        status: 'active'
      });
      console.log('User2 created.');
    }

    let user3 = await User.findOne({ email: 'user3@eventix.com' });
    if (!user3) {
      user3 = await User.create({
        name: 'Charlie Brown',
        email: 'user3@eventix.com',
        password: hashedUserPass,
        role: 'user',
        status: 'active'
      });
      console.log('User3 created.');
    }

    // ===========================
    // CATEGORIES
    // ===========================
    const categoryData = [
      { name: 'Music & Concerts', description: 'Live performances and music events' },
      { name: 'Technology & Innovation', description: 'Tech conferences, hackathons and workshops' },
      { name: 'Sports & Fitness', description: 'Athletic events, marathons and fitness programs' },
      { name: 'Food & Beverage', description: 'Food festivals, tastings and culinary events' },
      { name: 'Art & Culture', description: 'Exhibitions, theatre and cultural programs' },
    ];

    const categories = {};
    for (const cat of categoryData) {
      let existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        existing = await Category.create({ ...cat, createdBy: admin._id, isActive: true });
        console.log(`Category created: ${cat.name}`);
      }
      categories[cat.name] = existing;
    }

    // ===========================
    // VENUES
    // ===========================
    let venue1 = await Venue.findOne({ name: 'Bangalore International Convention Centre' });
    if (!venue1) {
      venue1 = await Venue.create({
        name: 'Bangalore International Convention Centre',
        description: 'A world-class convention center in the heart of Bangalore.',
        address: { street: 'Near Gayatri Vihar', city: 'Bangalore', state: 'Karnataka', country: 'India', zipCode: '560001' },
        capacity: 5000,
        amenities: ['WiFi', 'Parking', 'AC', 'Stage', 'PA System'],
        createdBy: organizer._id
      });
      console.log('Venue 1 created.');
    }

    let venue2 = await Venue.findOne({ name: 'Mumbai Open Air Grounds' });
    if (!venue2) {
      venue2 = await Venue.create({
        name: 'Mumbai Open Air Grounds',
        description: 'A large outdoor venue for festivals and concerts.',
        address: { street: 'Andheri Sports Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India', zipCode: '400053' },
        capacity: 10000,
        amenities: ['Parking', 'Security', 'Food Stalls'],
        createdBy: organizer._id
      });
      console.log('Venue 2 created.');
    }

    let venue3 = await Venue.findOne({ name: 'Delhi Tech Hub' });
    if (!venue3) {
      venue3 = await Venue.create({
        name: 'Delhi Tech Hub',
        description: 'Premier technology conference venue with world-class facilities.',
        address: { street: '14 Innovation Drive', city: 'Delhi', state: 'Delhi', country: 'India', zipCode: '110001' },
        capacity: 2000,
        amenities: ['WiFi', 'Projectors', 'Recording Studio', 'Cafeteria'],
        createdBy: organizer._id
      });
      console.log('Venue 3 created.');
    }

    // ===========================
    // EVENTS
    // ===========================
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 2);
    const pastEndDate = new Date(pastDate);
    pastEndDate.setDate(pastEndDate.getDate() + 1);

    const upcomingDate = new Date();
    upcomingDate.setMonth(upcomingDate.getMonth() + 1);
    const upcomingEndDate = new Date(upcomingDate);
    upcomingEndDate.setDate(upcomingEndDate.getDate() + 1);

    const farFutureDate = new Date();
    farFutureDate.setMonth(farFutureDate.getMonth() + 3);
    const farFutureEndDate = new Date(farFutureDate);
    farFutureEndDate.setDate(farFutureEndDate.getDate() + 2);

    // Past event (completed) - eligible for reviews
    let pastEvent = await Event.findOne({ title: 'Bangalore Summer Music Fest 2026' });
    if (!pastEvent) {
      pastEvent = await Event.create({
        title: 'Bangalore Summer Music Fest 2026',
        description: 'A spectacular music festival featuring top indie artists from across India. Three stages, 12 bands, endless good vibes.',
        organizer: organizer._id,
        category: categories['Music & Concerts']._id,
        venue: venue1._id,
        startDateTime: pastDate,
        endDateTime: pastEndDate,
        maxAttendees: 500,
        status: 'completed',
        tags: ['music', 'festival', 'indie', 'bangalore']
      });
      console.log('Past event created.');
    }

    // Published upcoming event
    let upcomingEvent = await Event.findOne({ title: 'TechIndia Summit 2027' });
    if (!upcomingEvent) {
      upcomingEvent = await Event.create({
        title: 'TechIndia Summit 2027',
        description: 'India\'s premier technology conference bringing together 500+ tech leaders, innovators, and entrepreneurs. Keynotes, workshops, and networking sessions.',
        organizer: organizer._id,
        category: categories['Technology & Innovation']._id,
        venue: venue3._id,
        startDateTime: upcomingDate,
        endDateTime: upcomingEndDate,
        maxAttendees: 1000,
        status: 'published',
        tags: ['tech', 'conference', 'ai', 'startups', 'delhi']
      });
      console.log('Upcoming event created.');
    }

    // Another published event - Mumbai
    let mumbaiEvent = await Event.findOne({ title: 'Mumbai Food & Culture Festival' });
    if (!mumbaiEvent) {
      mumbaiEvent = await Event.create({
        title: 'Mumbai Food & Culture Festival',
        description: 'Experience the rich culinary culture of India with 50+ food stalls, live cooking shows, cultural performances and more.',
        organizer: organizer._id,
        category: categories['Food & Beverage']._id,
        venue: venue2._id,
        startDateTime: farFutureDate,
        endDateTime: farFutureEndDate,
        maxAttendees: 2000,
        status: 'published',
        tags: ['food', 'culture', 'festival', 'mumbai']
      });
      console.log('Mumbai event created.');
    }

    // Draft event
    let draftEvent = await Event.findOne({ title: 'Delhi Marathon 2027 (Upcoming)' });
    if (!draftEvent) {
      const draftDate = new Date();
      draftDate.setMonth(draftDate.getMonth() + 5);
      const draftEnd = new Date(draftDate);
      draftEnd.setDate(draftEnd.getDate() + 1);
      draftEvent = await Event.create({
        title: 'Delhi Marathon 2027 (Upcoming)',
        description: 'The biggest marathon in North India. Run through Delhi\'s iconic landmarks in a 5K, 10K, or 42K category.',
        organizer: organizer._id,
        category: categories['Sports & Fitness']._id,
        venue: venue3._id,
        startDateTime: draftDate,
        endDateTime: draftEnd,
        maxAttendees: 5000,
        status: 'draft',
        tags: ['marathon', 'sports', 'fitness', 'delhi']
      });
      console.log('Draft event created.');
    }

    // ===========================
    // TICKET TYPES
    // ===========================

    // Past event tickets
    const pastTickets = [
      { event: pastEvent._id, name: 'General Admission', price: 499, totalQuantity: 300, soldQuantity: 300 },
      { event: pastEvent._id, name: 'VIP', price: 1499, totalQuantity: 100, soldQuantity: 95 },
    ];
    for (const t of pastTickets) {
      const existing = await TicketType.findOne({ event: t.event, name: t.name });
      if (!existing) {
        await TicketType.create({ ...t, currency: 'INR', isActive: false, createdBy: organizer._id });
        console.log(`Ticket type created: ${t.name} for past event`);
      }
    }

    // Tech summit tickets
    const techTickets = [
      { event: upcomingEvent._id, name: 'General Pass', description: 'Access to all keynotes and expo', price: 999, totalQuantity: 600, soldQuantity: 0 },
      { event: upcomingEvent._id, name: 'Workshop Pass', description: 'Includes hands-on workshops', price: 2499, totalQuantity: 200, soldQuantity: 0 },
      { event: upcomingEvent._id, name: 'VIP All-Access', description: 'All sessions + speaker dinner', price: 5999, totalQuantity: 50, soldQuantity: 0 },
    ];
    for (const t of techTickets) {
      const existing = await TicketType.findOne({ event: t.event, name: t.name });
      if (!existing) {
        await TicketType.create({ ...t, currency: 'INR', isActive: true, maxPerBooking: 5, createdBy: organizer._id });
        console.log(`Ticket type created: ${t.name} for tech summit`);
      }
    }

    // Mumbai food festival tickets
    const mumbaiTickets = [
      { event: mumbaiEvent._id, name: 'Day Pass', description: 'Single day entry', price: 299, totalQuantity: 1000, soldQuantity: 0 },
      { event: mumbaiEvent._id, name: 'Weekend Pass', description: 'Full 2-day access', price: 499, totalQuantity: 500, soldQuantity: 0 },
    ];
    for (const t of mumbaiTickets) {
      const existing = await TicketType.findOne({ event: t.event, name: t.name });
      if (!existing) {
        await TicketType.create({ ...t, currency: 'INR', isActive: true, createdBy: organizer._id });
        console.log(`Ticket type created: ${t.name} for Mumbai event`);
      }
    }

    console.log('\n============================');
    console.log('SEED COMPLETED SUCCESSFULLY');
    console.log('============================');
    console.log('\nDemo Credentials:');
    console.log('  Admin:     admin@eventix.com     / Admin@123456');
    console.log('  Organizer: organizer@eventix.com / Organizer@123456');
    console.log('  User 1:    user1@eventix.com     / User@123456');
    console.log('  User 2:    user2@eventix.com     / User@123456');
    console.log('  User 3:    user3@eventix.com     / User@123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
