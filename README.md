# GearUp Backend

GearUp is a sports and outdoor equipment rental backend system that allows customers to rent gear, providers to manage inventory and rental requests, and administrators to manage the platform.

The project provides a complete rental workflow, including authentication, role-based authorization, gear management, rental processing, Stripe payment integration, and review management.

---

## 📌 Project Features

- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ Customer, Provider, and Admin roles
- ✅ Gear inventory management
- ✅ Category management
- ✅ Rental order management
- ✅ Stock availability checking
- ✅ Stripe Checkout payment integration
- ✅ Stripe webhook payment confirmation
- ✅ Review and rating system
- ✅ Request validation using Zod
- ✅ Global error handling
- ✅ Prisma ORM with PostgreSQL

---

## 🛠️ Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Security

- JWT authentication
- bcrypt password hashing
- Role-based access control

### Validation

- Zod

### Payment

- Stripe Checkout
- Stripe Webhooks

### Tools

- Postman
- Prisma Studio
- Stripe CLI
- Vercel CLI
- tsup

---

## 👥 User Roles

### Customer

Customers can:

- Register and log in
- Browse available gear
- Create rental orders
- View rental history
- Cancel eligible rentals
- Make payments
- Submit reviews and ratings

### Provider

Providers can:

- Create gear items
- Update gear information
- Delete gear items
- Manage inventory and stock
- View rental requests
- Confirm rental orders
- Update rental statuses

### Admin

Administrators can:

- Manage users
- View all users
- Manage categories
- View platform information
- Monitor system activities

---

## 📂 Project Structure

```text
GearUp/
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   ├── errors/
│   ├── middlewares/
│   │
│   └── modules/
│       ├── auth/
│       ├── admin/
│       ├── category/
│       ├── gear/
│       ├── rental/
│       ├── payment/
│       └── review/
│
├── prisma/
├── generated/
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── vercel.json
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/galibh1/GearUp.git
```

### 2. Move into the project directory

```bash
cd GearUp
```

### 3. Install dependencies

```bash
npm install
```

---

## 🔐 Environment Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=8000

APP_URL=http://localhost:3000

DATABASE_URL="your_database_url"

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET="your_access_secret"
JWT_ACCESS_EXPIRATION="7d"

JWT_REFRESH_SECRET="your_refresh_secret"
JWT_REFRESH_EXPIRATION="30d"

STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
STRIPE_CURRENCY="usd"

PAYMENT_SUCCESS_URL="http://localhost:3000/payment/success"
PAYMENT_CANCEL_URL="http://localhost:3000/payment/cancel"

ADMIN_NAME="GearUp Admin"
ADMIN_EMAIL="admin@gearup.com"
ADMIN_PASSWORD="your_secure_admin_password"
```

> Never commit your `.env` file or expose private credentials publicly.

---

## 🗄️ Database Setup

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Run Development Migration

```bash
npm run prisma:migrate
```

### Apply Production Migrations

```bash
npm run prisma:deploy
```

### Seed the Database

```bash
npm run prisma:seed
```

### Open Prisma Studio

```bash
npm run prisma:studio
```

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

The server will run at:

```text
http://localhost:8000
```

### Production Build

```bash
npm run build
```

### Start the Production Server

```bash
npm start
```

---

## 🔑 Authentication Flow

1. The user registers an account.
2. The user logs in with valid credentials.
3. The server returns a JWT access token.
4. The token is sent with protected API requests.
5. The server verifies the token and user role.

Example authorization header:

```http
Authorization: Bearer ACCESS_TOKEN
```

---

## 📌 API Endpoints

### Authentication

Base route:

```text
/api/auth
```

Features:

- Register
- Login
- Logout

---

### Categories

Base route:

```text
/api/categories
```

Features:

- Create a category
- Update a category
- Delete a category
- View categories

---

### Gear

#### Public Routes

```http
GET /api/gear
GET /api/gear/:id
```

#### Provider Routes

```http
GET    /api/provider/gear
POST   /api/provider/gear
PUT    /api/provider/gear/:id
DELETE /api/provider/gear/:id
```

Features:

- Create gear
- Update gear
- Delete gear
- View gear listings
- Manage inventory

---

### Rentals

#### Customer Routes

```http
POST  /api/rentals
GET   /api/rentals
GET   /api/rentals/:id
PATCH /api/rentals/:id/cancel
```

#### Provider Routes

```http
GET   /api/provider/orders
PATCH /api/provider/orders/:id
```

Features:

- Create a rental
- Confirm a rental
- Cancel a rental
- View rental details
- Update rental status

---

### Payments

Base route:

```text
/api/payments
```

Features:

- Create a Stripe Checkout session
- Verify payment
- Process Stripe webhook events
- Store payment records
- Update payment status

---

### Reviews

Base route:

```text
/api/reviews
```

Features:

- Create a review
- Update a review
- Delete a review
- View reviews
- Submit ratings

---

## 💳 Stripe Payment Workflow

```text
Customer creates a rental
              ↓
Provider confirms the rental
              ↓
Customer creates a Checkout session
              ↓
Customer completes the Stripe payment
              ↓
Stripe sends a webhook event
              ↓
Backend verifies the webhook
              ↓
Payment status is updated
              ↓
Rental payment status becomes PAID
```

---

## 🔔 Local Stripe Webhook Testing

Start the development server:

```bash
npm run dev
```

Open another terminal and run:

```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```

Copy the webhook signing secret returned by Stripe CLI and add it to your `.env` file:

```env
STRIPE_WEBHOOK_SECRET="whsec_your_local_webhook_secret"
```

Restart the development server after updating the environment variable.

---

## 🧪 Testing

The API was tested using:

- Postman
- Stripe Test Checkout
- Stripe CLI
- Prisma Studio

Testing included:

- Authentication
- Authorization
- Role-based access control
- CRUD operations
- Request validation
- Rental workflow
- Stock availability
- Stripe Checkout
- Stripe webhook processing
- Payment completion
- Review management
- Error handling

---

## 🚨 Error Handling

The project includes centralized handling for:

- Authentication errors
- Authorization errors
- Validation errors
- Resource-not-found errors
- Database errors
- Payment errors
- Business logic errors
- Unexpected server errors

Example error response:

```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

## 🚀 Deployment

The project can be deployed using:

- Vercel
- Render
- Railway
- Docker-compatible hosting platforms

Production deployment requires:

- A hosted PostgreSQL database
- Database URL
- JWT secrets
- Stripe credentials
- Environment variables
- Applied Prisma migrations

### Deploy to Vercel

Make sure your `package.json` includes:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Log in to Vercel:

```bash
vercel login
```

Link the project:

```bash
vercel link
```

Deploy to production:

```bash
vercel --prod
```

After deployment, test:

```text
https://gearup-backend-woad.vercel.app/
```


---

## 👨‍💻 Author

**Galib Hasan**

GitHub:

https://github.com/galibh1

Project Repository:

https://github.com/galibh1/GearUp

---

## 📄 License

This project is licensed under the ISC License.