import mongoose from 'mongoose';
import config from '../config';
import Category from '../models/category.model';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Review from '../models/review.model';
import User from '../models/user.model';

const seed = async () => {
  await mongoose.connect(config.database_url as string);
  console.log('Connected to DB for seeding...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // ─── Users ───────────────────────────────────────────────────────────
  const [adminUser, demoUser] = await User.create([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456',
      role: 'admin',
      avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=admin',
      phone: '+1234567890',
      isVerified: true,
    },
    {
      name: 'Demo User',
      email: 'user@example.com',
      password: '123456',
      role: 'user',
      avatar: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=user',
      phone: '+0987654321',
      isVerified: true,
    },
  ]);
  console.log('Users created');

  // ─── Categories (Main) ────────────────────────────────────────────────
  const mainCategoryData = [
    { name: 'Smartphones', slug: 'smartphones', description: 'Latest mobile phones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400' },
    { name: 'Laptops',     slug: 'laptops',     description: 'Laptops for work and gaming', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
    { name: 'Headphones',  slug: 'headphones',  description: 'Premium audio devices', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { name: 'Cameras',     slug: 'cameras',     description: 'Photography equipment', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400' },
    { name: 'Tablets',     slug: 'tablets',     description: 'Tablets and e-readers', image: 'https://images.unsplash.com/photo-1544244015-0df4592c21b6?w=400' },
    { name: 'Smart Watches', slug: 'smart-watches', description: 'Fitness trackers and smartwatches', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
  ];

  const mainCategories = await Category.create(mainCategoryData);
  const catMap = Object.fromEntries(mainCategories.map((c) => [c.slug, c._id]));

  // ─── Sub-Categories ────────────────────────────────────────────────────
  await Category.create([
    // Smartphones
    { name: 'iPhones',        slug: 'iphones',         parentCategory: catMap['smartphones'] },
    { name: 'Android Phones', slug: 'android-phones',  parentCategory: catMap['smartphones'] },
    { name: 'Feature Phones', slug: 'feature-phones',  parentCategory: catMap['smartphones'] },
    // Laptops
    { name: 'Gaming Laptops',   slug: 'gaming-laptops',   parentCategory: catMap['laptops'] },
    { name: 'Ultrabooks',       slug: 'ultrabooks',        parentCategory: catMap['laptops'] },
    { name: 'Business Laptops', slug: 'business-laptops',  parentCategory: catMap['laptops'] },
    // Headphones
    { name: 'Over-Ear',      slug: 'over-ear',       parentCategory: catMap['headphones'] },
    { name: 'Earbuds',       slug: 'earbuds',         parentCategory: catMap['headphones'] },
    { name: 'Neckbands',     slug: 'neckbands',       parentCategory: catMap['headphones'] },
    // Cameras
    { name: 'Mirrorless',    slug: 'mirrorless',      parentCategory: catMap['cameras'] },
    { name: 'DSLR',          slug: 'dslr',            parentCategory: catMap['cameras'] },
    { name: 'Action Cameras', slug: 'action-cameras', parentCategory: catMap['cameras'] },
    // Tablets
    { name: 'iPads',            slug: 'ipads',            parentCategory: catMap['tablets'] },
    { name: 'Android Tablets',  slug: 'android-tablets',  parentCategory: catMap['tablets'] },
    { name: 'E-Readers',        slug: 'e-readers',         parentCategory: catMap['tablets'] },
    // Smart Watches
    { name: 'Smartwatches',    slug: 'smartwatches',     parentCategory: catMap['smart-watches'] },
    { name: 'Fitness Trackers', slug: 'fitness-trackers', parentCategory: catMap['smart-watches'] },
    { name: 'Smart Bands',     slug: 'smart-bands',      parentCategory: catMap['smart-watches'] },
  ]);
  console.log('Categories created');

  // ─── Products ─────────────────────────────────────────────────────────
  const productData = [
    // Smartphones
    {
      title: 'iPhone 16 Pro Max',
      description: 'The latest flagship iPhone with A18 Pro chip, titanium design, and advanced camera system.',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600'],
      price: 1199,
      category: catMap['smartphones'],
      brand: 'Apple',
      discount: 5,
      isFeatured: true,
      tags: ['iphone', 'apple', 'flagship', '5g'],
      rating: 4.9,
      reviewCount: 0,
      stock: 50,
      specifications: new Map([['Storage', '256GB'], ['RAM', '8GB'], ['Battery', '4685mAh'], ['Display', '6.9" Super Retina XDR']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Samsung Galaxy S25 Ultra',
      description: 'Samsung\'s most powerful phone with 200MP camera and built-in S Pen.',
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600'],
      price: 1299,
      category: catMap['smartphones'],
      brand: 'Samsung',
      discount: 10,
      isFeatured: true,
      tags: ['samsung', 'galaxy', 'android', 's-pen'],
      rating: 4.8,
      reviewCount: 0,
      stock: 35,
      specifications: new Map([['Storage', '512GB'], ['RAM', '12GB'], ['Camera', '200MP'], ['Battery', '5000mAh']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Google Pixel 9 Pro',
      description: 'Pure Android experience with exceptional computational photography powered by Google Tensor.',
      images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600'],
      price: 999,
      category: catMap['smartphones'],
      brand: 'Google',
      discount: 0,
      isFeatured: false,
      tags: ['google', 'pixel', 'android', 'ai-camera'],
      rating: 4.7,
      reviewCount: 0,
      stock: 40,
      specifications: new Map([['Storage', '128GB'], ['RAM', '12GB'], ['Battery', '4700mAh']]),
      createdBy: adminUser._id,
    },
    {
      title: 'OnePlus 12',
      description: 'Flagship killer with Snapdragon 8 Gen 3 and 100W fast charging.',
      images: ['https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600'],
      price: 799,
      category: catMap['smartphones'],
      brand: 'OnePlus',
      discount: 15,
      isFeatured: false,
      tags: ['oneplus', 'android', 'fast-charging', 'flagship'],
      rating: 4.6,
      reviewCount: 0,
      stock: 60,
      specifications: new Map([['Storage', '256GB'], ['RAM', '16GB'], ['Charging', '100W SuperVOOC']]),
      createdBy: adminUser._id,
    },
    // Laptops
    {
      title: 'MacBook Pro 16" M4 Max',
      description: 'The most powerful MacBook ever with M4 Max chip, perfect for professionals.',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'],
      price: 3499,
      category: catMap['laptops'],
      brand: 'Apple',
      discount: 0,
      isFeatured: true,
      tags: ['apple', 'macbook', 'laptop', 'm4', 'professional'],
      rating: 4.9,
      reviewCount: 0,
      stock: 20,
      specifications: new Map([['Chip', 'M4 Max'], ['RAM', '48GB'], ['Storage', '1TB SSD'], ['Display', '16.2" Liquid Retina XDR']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Dell XPS 15',
      description: 'Premium Windows laptop with OLED display and Intel Core Ultra 9 processor.',
      images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600'],
      price: 1899,
      category: catMap['laptops'],
      brand: 'Dell',
      discount: 8,
      isFeatured: true,
      tags: ['dell', 'windows', 'oled', 'laptop'],
      rating: 4.7,
      reviewCount: 0,
      stock: 25,
      specifications: new Map([['Processor', 'Intel Core Ultra 9'], ['RAM', '32GB'], ['Storage', '1TB SSD'], ['Display', '15.6" OLED 3.5K']]),
      createdBy: adminUser._id,
    },
    {
      title: 'ASUS ROG Zephyrus G16',
      description: 'Ultimate gaming laptop with RTX 4090 and 240Hz OLED display.',
      images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600'],
      price: 2499,
      category: catMap['laptops'],
      brand: 'ASUS',
      discount: 12,
      isFeatured: false,
      tags: ['asus', 'gaming', 'rog', 'rtx', 'laptop'],
      rating: 4.8,
      reviewCount: 0,
      stock: 15,
      specifications: new Map([['GPU', 'RTX 4090'], ['Processor', 'Intel Core i9'], ['RAM', '32GB DDR5'], ['Display', '16" OLED 240Hz']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Lenovo ThinkPad X1 Carbon Gen 12',
      description: 'Ultra-lightweight business laptop with legendary ThinkPad keyboard.',
      images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600'],
      price: 1599,
      category: catMap['laptops'],
      brand: 'Lenovo',
      discount: 5,
      isFeatured: false,
      tags: ['lenovo', 'thinkpad', 'business', 'ultrabook'],
      rating: 4.6,
      reviewCount: 0,
      stock: 30,
      specifications: new Map([['Weight', '1.12kg'], ['Processor', 'Intel Core Ultra 7'], ['RAM', '16GB'], ['Battery', '57Wh, 15hr']]),
      createdBy: adminUser._id,
    },
    // Headphones
    {
      title: 'Sony WH-1000XM6',
      description: 'Industry-leading noise cancelling headphones with 40-hour battery life.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
      price: 399,
      category: catMap['headphones'],
      brand: 'Sony',
      discount: 10,
      isFeatured: true,
      tags: ['sony', 'noise-cancelling', 'wireless', 'headphones'],
      rating: 4.9,
      reviewCount: 0,
      stock: 80,
      specifications: new Map([['Battery', '40 hours'], ['Driver', '40mm'], ['ANC', 'Industry Leading'], ['Weight', '250g']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Apple AirPods Pro (3rd Gen)',
      description: 'Premium earbuds with adaptive noise cancellation and spatial audio.',
      images: ['https://images.unsplash.com/photo-1606741965429-02919f54a5af?w=600'],
      price: 249,
      category: catMap['headphones'],
      brand: 'Apple',
      discount: 0,
      isFeatured: true,
      tags: ['apple', 'airpods', 'earbuds', 'wireless', 'anc'],
      rating: 4.8,
      reviewCount: 0,
      stock: 100,
      specifications: new Map([['Battery (buds)', '6 hours'], ['Battery (case)', '30 hours'], ['Chip', 'H2'], ['Water Resistant', 'IPX4']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Bose QuietComfort Ultra',
      description: 'Premium over-ear headphones with immersive audio and best-in-class comfort.',
      images: ['https://images.unsplash.com/photo-1545127398-14699f92334b?w=600'],
      price: 429,
      category: catMap['headphones'],
      brand: 'Bose',
      discount: 15,
      isFeatured: false,
      tags: ['bose', 'noise-cancelling', 'premium', 'headphones'],
      rating: 4.7,
      reviewCount: 0,
      stock: 45,
      specifications: new Map([['Battery', '24 hours'], ['Immersive Audio', 'Yes'], ['Weight', '240g']]),
      createdBy: adminUser._id,
    },
    // Cameras
    {
      title: 'Sony A7R V',
      description: '61MP full-frame mirrorless camera with AI-powered autofocus system.',
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'],
      price: 3899,
      category: catMap['cameras'],
      brand: 'Sony',
      discount: 0,
      isFeatured: true,
      tags: ['sony', 'mirrorless', 'full-frame', 'photography'],
      rating: 4.9,
      reviewCount: 0,
      stock: 10,
      specifications: new Map([['Megapixels', '61MP'], ['Sensor', 'Full-Frame BSI CMOS'], ['Video', '8K'], ['ISO Range', '100-32000']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Canon EOS R8',
      description: 'Lightweight full-frame mirrorless camera perfect for beginners and enthusiasts.',
      images: ['https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600'],
      price: 1499,
      category: catMap['cameras'],
      brand: 'Canon',
      discount: 10,
      isFeatured: false,
      tags: ['canon', 'eos', 'mirrorless', 'beginner'],
      rating: 4.6,
      reviewCount: 0,
      stock: 22,
      specifications: new Map([['Megapixels', '24.2MP'], ['Sensor', 'Full-Frame CMOS'], ['Video', '4K'], ['Weight', '461g']]),
      createdBy: adminUser._id,
    },
    // Tablets
    {
      title: 'iPad Pro 13" M4',
      description: 'The thinnest Apple product ever with Ultra Retina XDR OLED display.',
      images: ['https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600'],
      price: 1299,
      category: catMap['tablets'],
      brand: 'Apple',
      discount: 0,
      isFeatured: true,
      tags: ['apple', 'ipad', 'tablet', 'm4', 'oled'],
      rating: 4.9,
      reviewCount: 0,
      stock: 30,
      specifications: new Map([['Chip', 'M4'], ['Display', '13" Ultra Retina XDR'], ['Storage', '256GB'], ['Battery', '10hr']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Samsung Galaxy Tab S10 Ultra',
      description: 'The ultimate Android tablet with 14.6" AMOLED display and S Pen included.',
      images: ['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600'],
      price: 1199,
      category: catMap['tablets'],
      brand: 'Samsung',
      discount: 12,
      isFeatured: false,
      tags: ['samsung', 'android', 'tablet', 's-pen', 'amoled'],
      rating: 4.7,
      reviewCount: 0,
      stock: 25,
      specifications: new Map([['Display', '14.6" Dynamic AMOLED 2X'], ['RAM', '12GB'], ['Storage', '256GB'], ['Battery', '11200mAh']]),
      createdBy: adminUser._id,
    },
    // Smart Watches
    {
      title: 'Apple Watch Ultra 2',
      description: 'The most rugged Apple Watch with precision dual-frequency GPS and 60-hour battery.',
      images: ['https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600'],
      price: 799,
      category: catMap['smart-watches'],
      brand: 'Apple',
      discount: 0,
      isFeatured: true,
      tags: ['apple', 'watch', 'smartwatch', 'gps', 'rugged'],
      rating: 4.8,
      reviewCount: 0,
      stock: 40,
      specifications: new Map([['Battery', '60 hours'], ['Case', '49mm Titanium'], ['GPS', 'Dual-Frequency L1+L5'], ['Water Resistant', '100m']]),
      createdBy: adminUser._id,
    },
    {
      title: 'Samsung Galaxy Watch 7',
      description: 'Advanced health monitoring smartwatch with AI-powered wellness insights.',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      price: 299,
      category: catMap['smart-watches'],
      brand: 'Samsung',
      discount: 20,
      isFeatured: false,
      tags: ['samsung', 'galaxy', 'smartwatch', 'health', 'fitness'],
      rating: 4.5,
      reviewCount: 0,
      stock: 55,
      specifications: new Map([['Battery', '40 hours'], ['Display', '1.47" Super AMOLED'], ['Water Resistant', '5ATM'], ['Sensors', 'BioActive Sensor']]),
      createdBy: adminUser._id,
    },
  ];

  const products = await Product.insertMany(productData);
  console.log(`${products.length} products created`);

  // ─── Reviews ──────────────────────────────────────────────────────────
  const reviewData = products.slice(0, 10).map((product, i) => ({
    userId: i % 2 === 0 ? demoUser._id : adminUser._id,
    productId: product._id,
    rating: 4 + (i % 2) * 0.5,
    comment: [
      'Absolutely love this product! Exceeded my expectations in every way.',
      'Great build quality and performance. Worth every penny.',
      'Best purchase I made this year. Highly recommend!',
      'Impressive features for the price. Very satisfied.',
      'Fantastic product, fast delivery, and great packaging.',
    ][i % 5],
  }));

  await Review.insertMany(reviewData);

  // Update product ratings
  for (const product of products.slice(0, 10)) {
    const stats = await Review.aggregate([
      { $match: { productId: product._id } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(product._id, {
        rating: Math.round(stats[0].avg * 10) / 10,
        reviewCount: stats[0].count,
      });
    }
  }
  console.log('Reviews created');

  // ─── Orders ───────────────────────────────────────────────────────────
  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
  const orderData = products.slice(0, 10).map((product, i) => ({
    userId: i % 2 === 0 ? demoUser._id : adminUser._id,
    items: [{ productId: product._id, quantity: 1, price: product.price, title: product.title, image: (product.images as string[])?.[0] ?? '' }],
    totalAmount: product.price,
    shippingAddress: { street: `${100 + i} Main St`, city: 'New York', country: 'USA', zip: '10001' },
    paymentMethod: 'card',
    paymentStatus: i < 8 ? 'paid' : 'pending',
    orderStatus: orderStatuses[i % 5],
  }));

  await Order.insertMany(orderData);
  console.log('Orders created');

  console.log('\n✅ Seed completed successfully!');
  console.log('Demo credentials:');
  console.log('  Admin → admin@example.com / 123456');
  console.log('  User  → user@example.com  / 123456');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
