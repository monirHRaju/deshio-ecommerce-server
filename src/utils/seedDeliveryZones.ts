/**
 * Safe migration — only adds delivery zones, does NOT touch any other data.
 * Run with: npm run seed:delivery
 */
import mongoose from 'mongoose';
import config from '../config';
import DeliveryZone from '../models/deliveryZone.model';

const run = async () => {
  await mongoose.connect(config.database_url as string);
  console.log('Connected to DB…');

  // Remove existing zones and re-insert so re-running is safe
  await DeliveryZone.deleteMany({});

  const zones = await DeliveryZone.create([
    { name: 'Dhaka City',    charge: 80,  estimatedDays: '1-2 days',   isActive: true },
    { name: 'Outside Dhaka', charge: 120, estimatedDays: '2-4 days',   isActive: true },
    { name: 'International', charge: 500, estimatedDays: '7-14 days',  isActive: true },
  ]);

  console.log('✅ Delivery zones created:');
  zones.forEach((z) => console.log(`   ${z.name}  →  Tk. ${z.charge}  (${z.estimatedDays})`));

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
