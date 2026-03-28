# Deshio API Server

Express 5 REST API backend for the Deshio e-commerce platform.

**Base URL:** `http://localhost:5000/api/v1`

## Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

### Response Format

All endpoints return a standardized JSON response:

```json
{
  "success": true,
  "message": "Description of result",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

The `meta` field is only present on paginated endpoints.

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Access Levels

| Level | Description |
|-------|-------------|
| Public | No authentication required |
| Authenticated | Any logged-in user |
| Admin | Admin or Super-Admin role |
| Super-Admin | Super-Admin role only |

---

## API Endpoints

### 1. Authentication (`/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/refresh-token` | Public | Refresh access token |
| GET | `/auth/verify-email` | Public | Verify email via token |
| POST | `/auth/resend-verification` | Public | Resend verification email |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password` | Public | Reset password with token |
| GET | `/auth/google` | Public | Initiate Google OAuth |
| GET | `/auth/google/callback` | Public | Google OAuth callback |
| GET | `/auth/facebook` | Public | Initiate Facebook OAuth |
| GET | `/auth/facebook/callback` | Public | Facebook OAuth callback |

#### POST `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "user"
}
```

**Response:** `201` - Returns user object with `accessToken` and `refreshToken`.

#### POST `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `200` - Returns user object with `accessToken` and `refreshToken`.

#### POST `/auth/refresh-token`

```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

#### GET `/auth/verify-email?token=<verificationToken>`

#### POST `/auth/resend-verification`

```json
{
  "email": "john@example.com"
}
```

#### POST `/auth/forgot-password`

```json
{
  "email": "john@example.com"
}
```

#### POST `/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "password": "newpassword"
}
```

---

### 2. Users (`/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users/me` | Authenticated | Get current user profile |
| PATCH | `/users/me` | Authenticated | Update current user profile |
| GET | `/users` | Admin | List all users (paginated) |
| POST | `/users` | Super-Admin | Create admin account |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/role` | Admin | Update user role |
| DELETE | `/users/:id` | Admin | Delete user |

#### PATCH `/users/me`

```json
{
  "name": "Updated Name",
  "phone": "+8801700000000",
  "avatar": "https://...",
  "address": { "street": "123 Main", "city": "Dhaka", "country": "BD", "zip": "1000" },
  "currentPassword": "old",
  "newPassword": "new"
}
```

#### GET `/users` — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `role` | string | Filter by role (`user`, `admin`, `super-admin`) |
| `search` | string | Search by name or email |

#### POST `/users` (Super-Admin)

```json
{
  "name": "Admin User",
  "email": "admin@deshio.com",
  "password": "securepassword",
  "role": "admin"
}
```

#### PATCH `/users/role`

```json
{
  "userId": "60d5f484f1a2c8b1f8e4e1a1",
  "role": "admin"
}
```

---

### 3. Products (`/products`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/products` | Public | List products (paginated, filterable) |
| GET | `/products/featured` | Public | Get top 8 featured products |
| GET | `/products/:id` | Public | Get product by ID |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Authenticated | Update product (owner or admin) |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/products/:id/wishlist` | Authenticated | Toggle wishlist |

#### GET `/products` — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12, max: 50) |
| `search` | string | Search by title |
| `category` | string | Filter by category ID |
| `brand` | string | Filter by brand name |
| `isFeatured` | boolean | Filter featured products |
| `priceMin` | number | Minimum price |
| `priceMax` | number | Maximum price |
| `rating` | number | Minimum rating |
| `sort` | string | Sort field (e.g., `price`, `-price`, `-createdAt`) |

#### POST `/products`

```json
{
  "title": "Wireless Headphones",
  "description": "High-quality wireless headphones...",
  "price": 2500,
  "stock": 50,
  "category": "60d5f484f1a2c8b1f8e4e1a1",
  "brand": "SoundMax",
  "images": ["https://..."],
  "tags": ["wireless", "headphones", "audio"],
  "discount": 10,
  "isFeatured": true
}
```

---

### 4. Categories (`/categories`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/categories/tree` | Public | Get category tree with subcategories & brands |
| GET | `/categories` | Public | Get all categories (flat list) |
| GET | `/categories/:id` | Public | Get category by ID |
| POST | `/categories` | Admin | Create category |
| PATCH | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

#### POST `/categories`

```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "image": "https://...",
  "parentCategory": "60d5f484f1a2c8b1f8e4e1a1"
}
```

---

### 5. Cart (`/cart`)

All cart routes require authentication.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/cart` | Authenticated | Get user's cart |
| POST | `/cart` | Authenticated | Add item to cart |
| PATCH | `/cart/:itemId` | Authenticated | Update item quantity |
| DELETE | `/cart/:itemId` | Authenticated | Remove item from cart |
| DELETE | `/cart` | Authenticated | Clear entire cart |

#### POST `/cart`

```json
{
  "productId": "60d5f484f1a2c8b1f8e4e1a1",
  "quantity": 2
}
```

#### PATCH `/cart/:itemId`

```json
{
  "quantity": 3
}
```

---

### 6. Orders (`/orders`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/orders/track/:orderNumber` | Public | Track order (limited info) |
| POST | `/orders` | Authenticated | Place order from cart |
| GET | `/orders` | Authenticated | List orders (user: own, admin: all) |
| GET | `/orders/:id` | Authenticated | Get order details |
| PATCH | `/orders/:id/status` | Admin | Update order/payment status |
| PATCH | `/orders/:id/cancel` | Authenticated | Cancel pending order |

#### POST `/orders`

```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Dhaka",
    "country": "Bangladesh",
    "zip": "1000"
  },
  "phone": "+8801700000000",
  "paymentMethod": "mobile_banking",
  "deliveryZoneId": "60d5f484f1a2c8b1f8e4e1a1",
  "couponCode": "SAVE20",
  "orderNote": "Please deliver before 5pm",
  "mobilePayment": {
    "paymentMethodId": "60d5f484f1a2c8b1f8e4e1a1",
    "mobileLast4": "1234",
    "transactionId": "TXN123456"
  }
}
```

#### GET `/orders` — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |
| `status` | string | Filter by order status |

#### PATCH `/orders/:id/status` (Admin)

```json
{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

**Order Status Values:** `pending`, `processing`, `shipped`, `delivered`, `cancelled`

**Payment Status Values:** `pending`, `paid`, `failed`

---

### 7. Reviews (`/reviews`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/reviews` | Admin | List all reviews (paginated) |
| GET | `/reviews/product/:productId` | Public | Get product reviews |
| GET | `/reviews/my` | Authenticated | Get current user's reviews |
| POST | `/reviews` | Authenticated | Submit a review |
| PATCH | `/reviews/:id` | Authenticated | Update review (owner only) |
| DELETE | `/reviews/:id` | Authenticated | Delete review (owner or admin) |

#### POST `/reviews`

```json
{
  "productId": "60d5f484f1a2c8b1f8e4e1a1",
  "rating": 5,
  "comment": "Great product!"
}
```

#### GET `/reviews` — Query Parameters (Admin)

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 15, max: 50) |
| `rating` | number | Filter by rating |

---

### 8. Coupons (`/coupons`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/coupons/validate` | Public | Validate coupon code |
| GET | `/coupons` | Admin | List all coupons |
| POST | `/coupons` | Admin | Create coupon |
| DELETE | `/coupons/:id` | Admin | Delete coupon |

#### POST `/coupons/validate`

```json
{
  "code": "SAVE20",
  "orderTotal": 5000
}
```

#### POST `/coupons`

```json
{
  "code": "SAVE20",
  "description": "20% off on orders above 1000",
  "type": "percent",
  "value": 20,
  "minOrderAmount": 1000,
  "maxUses": 100,
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Coupon Types:** `percent`, `fixed`

---

### 9. Delivery Zones (`/delivery-zones`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/delivery-zones` | Public | Get active delivery zones |
| POST | `/delivery-zones` | Admin | Create delivery zone |
| PATCH | `/delivery-zones/:id` | Admin | Update delivery zone |
| DELETE | `/delivery-zones/:id` | Admin | Delete delivery zone |

#### POST `/delivery-zones`

```json
{
  "name": "Inside Dhaka",
  "charge": 60,
  "estimatedDays": "1-2 days"
}
```

---

### 10. Payment Methods (`/payment-methods`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/payment-methods` | Public | Get active payment methods |
| GET | `/payment-methods/all` | Admin | Get all payment methods |
| POST | `/payment-methods` | Admin | Create payment method |
| PATCH | `/payment-methods/:id` | Admin | Update payment method |
| DELETE | `/payment-methods/:id` | Admin | Delete payment method |

#### POST `/payment-methods`

```json
{
  "name": "bKash",
  "type": "mobile_banking",
  "instructions": "Send money to 01700000000",
  "phoneNumber": "01700000000",
  "qrImage": "https://...",
  "isActive": true,
  "sortOrder": 1
}
```

---

### 11. Dashboard (`/dashboard`)

All dashboard routes require Admin authentication.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/dashboard/stats` | Admin | Get dashboard statistics |
| GET | `/dashboard/chart-data` | Admin | Get chart data |
| GET | `/dashboard/recent-orders` | Admin | Get 10 most recent orders |

#### GET `/dashboard/stats` — Response

```json
{
  "data": {
    "totalUsers": 150,
    "totalProducts": 85,
    "totalOrders": 320,
    "totalRevenue": 450000
  }
}
```

#### GET `/dashboard/chart-data` — Response

```json
{
  "data": {
    "monthlyData": [{ "_id": { "year": 2026, "month": 3 }, "orders": 45, "revenue": 125000 }],
    "ordersByStatus": [{ "_id": "pending", "count": 12 }],
    "topProducts": [{ "_id": "...", "title": "...", "sold": 50, "rating": 4.5, "images": [] }],
    "topCategories": [{ "_id": "...", "name": "Electronics", "count": 25 }]
  }
}
```

---

### 12. Notifications (`/notifications`)

All notification routes require Admin authentication. Notifications are automatically created when key events occur (new orders, cancellations, low stock, new users, new reviews).

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/notifications` | Admin | List notifications (paginated) |
| GET | `/notifications/unread-count` | Admin | Get unread notification count |
| PATCH | `/notifications/:id/read` | Admin | Mark notification as read |
| PATCH | `/notifications/read-all` | Admin | Mark all as read |
| DELETE | `/notifications/:id` | Admin | Delete notification |

#### GET `/notifications` — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 50) |
| `isRead` | string | Filter: `"true"` or `"false"` |

#### GET `/notifications` — Response

```json
{
  "data": [
    {
      "_id": "60d5f484f1a2c8b1f8e4e1a1",
      "type": "order",
      "title": "New Order Placed",
      "message": "Order ORD-000042 placed for ৳2,500",
      "referenceId": "60d5f484f1a2c8b1f8e4e1a2",
      "referenceModel": "Order",
      "isRead": false,
      "createdAt": "2026-03-28T10:30:00.000Z",
      "updatedAt": "2026-03-28T10:30:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

#### GET `/notifications/unread-count` — Response

```json
{
  "data": { "count": 3 }
}
```

#### Notification Types

| Type | Trigger | Example Message |
|------|---------|-----------------|
| `order` | New order placed | "Order ORD-000042 placed for ৳2,500" |
| `order` | Order cancelled | "Order ORD-000042 was cancelled by the customer" |
| `product` | Low stock (<=5 units) | "\"Wireless Headphones\" has only 3 units remaining" |
| `user` | New user registered | "John Doe (john@example.com) has registered" |
| `review` | New review submitted | "5-star review on \"Wireless Headphones\"" |

---

### 13. AI (`/ai`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/ai/summarize-reviews` | Public | AI summary of product reviews |
| POST | `/ai/chat` | Public | AI shopping assistant chat |
| POST | `/ai/generate-description` | Authenticated | Generate product description |
| POST | `/ai/generate-tags` | Authenticated | Generate product SEO tags |
| POST | `/ai/smart-search` | Authenticated | Extract filters from natural language |

#### POST `/ai/generate-description`

```json
{
  "title": "Wireless Headphones",
  "category": "Electronics",
  "brand": "SoundMax",
  "specs": { "battery": "40 hours", "driver": "40mm" }
}
```

#### POST `/ai/generate-tags`

```json
{
  "title": "Wireless Headphones",
  "category": "Electronics"
}
```

#### POST `/ai/chat`

```json
{
  "message": "I'm looking for headphones under 3000 taka",
  "history": []
}
```

#### POST `/ai/smart-search`

```json
{
  "query": "wireless headphones under 3000 with good bass"
}
```

---

## CORS Configuration

Allowed origins:
- `process.env.PUBLIC_URL` (client)
- `process.env.PUBLIC_ADMIN_URL` (admin)
- `http://localhost:3000`
- `http://localhost:3001`

Credentials are enabled for cookie-based auth.
