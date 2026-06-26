const pool = require('../config/db');

const PLACEHOLDER_ROOM_PHOTOS = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
];

const rooms = [
  { room_number: '01', price: 45000, description: 'Deluxe room with garden view, queen bed, and free breakfast.' },
  { room_number: '02', price: 65000, description: 'Executive suite with city view, king bed, and lounge access.' },
  { room_number: '03', price: 38000, description: 'Standard room, twin beds, ideal for short stays.' },
  { room_number: '04', price: 95000, description: 'Presidential suite with private balcony and butler service.' },
  { room_number: '05', price: 45000, description: 'Deluxe room with pool view, queen bed, and complimentary minibar.' },
  { room_number: '06', price: 52000, description: 'Family room with two queen beds, fits up to 4 guests.' },
];

const services = [
  { category: 'drink', name: 'Fresh Juice', price: 5000, description: 'Mango, passion, or pineapple, freshly squeezed.' },
  { category: 'drink', name: 'Coffee', price: 4000, description: 'Locally sourced Kilimanjaro coffee, brewed to order.' },
  { category: 'drink', name: 'Soft Drink', price: 3000, description: 'Chilled sodas and sparkling water.' },
  { category: 'food', name: 'Grilled Chicken', price: 18000, description: 'Served with rice and seasonal vegetables.' },
  { category: 'food', name: 'Fish Platter', price: 22000, description: 'Fresh catch of the day, grilled with local spices.' },
  { category: 'food', name: 'Breakfast Combo', price: 12000, description: 'Eggs, toast, sausage, and fresh fruit.' },
];

const news = [
  { title: 'GS Hotel launches online booking', body: 'You can now reserve a room and order food directly from our website.' },
  { title: 'New rooftop lounge opening soon', body: 'A new space for drinks and evening relaxation, opening next month.' },
];

async function seed() {
  try {
    console.log('Seeding rooms...');
    for (const room of rooms) {
      await pool.query(
        `INSERT INTO rooms (room_number, price, description, photo_urls, status)
         VALUES ($1, $2, $3, $4, 'free')
         ON CONFLICT (room_number) DO NOTHING`,
        [room.room_number, room.price, room.description, PLACEHOLDER_ROOM_PHOTOS]
      );
    }

    console.log('Seeding services...');
    for (const service of services) {
      await pool.query(
        `INSERT INTO services (category, name, price, description)
         VALUES ($1, $2, $3, $4)`,
        [service.category, service.name, service.price, service.description]
      );
    }

    console.log('Seeding news...');
    for (const post of news) {
      await pool.query(
        `INSERT INTO news_posts (title, body) VALUES ($1, $2)`,
        [post.title, post.body]
      );
    }

    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
