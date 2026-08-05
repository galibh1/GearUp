# GearUp Backend 

GearUp is a sports and outdoor equipment rental backend system that allows customers to rent gear, providers to manage inventory and rental requests, and administrators to manage the platform.

The project provides a complete rental workflow including authentication, role-based authorization, gear management, rental processing, Stripe payment integration, and review management.

---

# 📌 Project Features

✅ JWT Authentication  
✅ Role Based Authorization  
✅ Customer / Provider / Admin system  
✅ Gear inventory management  
✅ Category management  
✅ Rental order management  
✅ Stock availability checking  
✅ Stripe Checkout payment integration  
✅ Stripe Webhook payment confirmation  
✅ Review and rating system  
✅ Request validation using Zod  
✅ Global error handling  
✅ Prisma ORM with PostgreSQL  

---

```

---

# 🛠️ Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Security

- JWT Authentication
- bcrypt password hashing
- Role-based access control

## Validation

- Zod

## Payment

- Stripe Checkout
- Stripe Webhooks

## Tools

- Postman
- Prisma Studio
- tsup

---

# 👥 User Roles

## Customer

Customers can:

- Register and login
- Browse available gear
- Create rental orders
- View rental history
- Cancel rentals
- Make payments
- Submit reviews


---

## Provider

Providers can:

- Create gear items
- Update gear information
- Delete gear
- Manage stock
- View rental requests
- Confirm rental orders
- Update rental status


---

## Admin

Admins can:

- Manage users
- View all users
- Manage categories
- Monitor system activities

---

# 📂 Project Structure

```
GearUp

│
├── src
│   │
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config
│   │
│   ├── errors
│   │
│   ├── middlewares
│   │
│   └── modules
│       │
│       ├── auth
│       ├── admin
│       ├── category
│       ├── gear
│       ├── rental
│       ├── payment
│       └── review
│
├── prisma
│
├── generated
│
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vercel.json
```

---

# ⚙️ Installation

Clone repository:

```bash
git clone https://github.com/galibh1/GearUp.git
```

Move into project:

```bash
cd GearUp
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Environment Configuration

Create a `.env` file:

```env
NODE_ENV=development

PORT=8000


DATABASE_URL="your_database_url"


BCRYPT_SALT_ROUNDS=12


JWT_ACCESS_SECRET="your_access_secret"

JWT_ACCESS_EXPIRATION="7d"


JWT_REFRESH_SECRET="your_refresh_secret"

JWT_REFRESH_EXPIRATION="30d"


STRIPE_SECRET_KEY="your_stripe_secret_key"

STRIPE_WEBHOOK_SECRET="your_webhook_secret"

STRIPE_CURRENCY="usd"


PAYMENT_SUCCESS_URL="http://localhost:8000/payment/success"

PAYMENT_CANCEL_URL="http://localhost:8000/payment/cancel"
```

---

# 🗄️ Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migration:

```bash
npm run prisma:migrate
```

Deploy migration:

```bash
npm run prisma:deploy
```

Open Prisma Studio:

```bash
npm run prisma:studio
```

---

# ▶️ Running Application

## Development Mode

```bash
npm run dev
```

Server:

```
http://localhost:8000
```

---

## Production Build

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

---

# 🔑 Authentication Flow

1. User registers
2. User logs in
3. Server returns JWT access token
4. Token is sent with protected requests

Example:

```
Authorization:

Bearer ACCESS_TOKEN
```

---

# 📌 API Endpoints

## Authentication

```
/api/auth
```

Features:

- Register
- Login
- Logout


---

# Categories

```
/api/categories
```

Features:

- Create category
- Update category
- Delete category
- View categories


---

# Gear

Public:

```
GET /api/gear
GET /api/gear/:id
```


Provider:

```
GET    /api/provider/gear
POST   /api/provider/gear
PUT    /api/provider/gear/:id
DELETE /api/provider/gear/:id
```


Features:

- Gear creation
- Gear update
- Gear deletion
- Inventory management


---

# Rentals

Customer:

```
POST  /api/rentals
GET   /api/rentals
GET   /api/rentals/:id
PATCH /api/rentals/:id/cancel
```


Provider:

```
GET   /api/provider/orders

PATCH /api/provider/orders/:id
```


Features:

- Create rental
- Confirm rental
- Cancel rental
- Update rental status


---

# Payments

```
/api/payments
```

Features:

- Create Stripe checkout session
- Verify payment
- Store payment records


---

# Reviews

```
/api/reviews
```

Features:

- Create review
- Update review
- Delete review
- View reviews


---

# 💳 Stripe Payment Workflow

```
Customer creates rental

        ↓

Provider confirms rental

        ↓

Customer creates checkout session

        ↓

Stripe Checkout Payment

        ↓

Stripe Webhook Triggered

        ↓

Payment status updated

        ↓

Rental status becomes PAID
```

---
---

# 🧪 Testing

The API was tested using:

- Postman
- Stripe Test Checkout
- Prisma Studio


Testing included:

- Authentication
- Authorization
- CRUD operations
- Validation errors
- Rental workflow
- Payment completion


---

# 🚨 Error Handling

The project includes:

- Authentication errors
- Authorization errors
- Validation errors
- Resource not found errors
- Business logic errors


Example response:

```json
{
    "success": false,
    "message": "Validation failed"
}
```

---

# 🚀 Deployment

The project can be deployed using:

- Vercel
- Render
- Railway
- Docker


Production deployment requires:

- Database URL
- JWT secrets
- Stripe credentials
- Environment variables


---

# 👨‍💻 Author

Galib Hasan

GitHub:

https://github.com/galibh1/GearUp


---

# 📄 License

ISC License