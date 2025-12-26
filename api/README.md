# KejaYangu Kenya Real Estate API

A comprehensive RESTful API for the KejaYangu real estate platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, and profile management
- **Property Management**: CRUD operations for real estate listings
- **Advanced Search**: Geolocation-based search with filters
- **Agent Management**: Real estate agent profiles and verification
- **File Upload**: Image and document management with Cloudinary
- **Real-time Communication**: Chat system with Socket.IO
- **Payment Integration**: Stripe and M-Pesa payment processing
- **Notifications**: Email and SMS notifications
- **Security**: JWT authentication, rate limiting, and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **File Storage**: Cloudinary
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO
- **Payment**: Stripe, M-Pesa
- **Communication**: Twilio (SMS), Nodemailer (Email)
- **Validation**: Express-validator, Joi
- **Security**: Helmet, CORS, Rate limiting

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5+
- Redis 6+
- Cloudinary account
- Twilio account (for SMS)
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd api
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/keja_yangu

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+254700000000

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email address
- `POST /auth/verify-phone` - Verify phone number

#### Properties

- `GET /properties` - Get all properties with filters
- `GET /properties/:id` - Get property by ID
- `POST /properties` - Create new property
- `PUT /properties/:id` - Update property
- `DELETE /properties/:id` - Delete property
- `POST /properties/:id/images` - Upload property images
- `DELETE /properties/:id/images/:imageId` - Delete property image
- `GET /properties/nearby/:lat/:lng` - Get nearby properties
- `GET /properties/stats/overview` - Get property statistics
- `GET /properties/featured` - Get featured properties

#### Search

- `GET /search` - Advanced property search
- `GET /search/suggestions` - Get search suggestions
- `GET /search/trending` - Get trending searches
- `GET /search/autocomplete` - Autocomplete suggestions
- `GET /search/filters` - Get available filter options

#### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users/properties` - Get user's properties
- `POST /users/change-password` - Change password

#### Agents

- `GET /agents` - Get all agents
- `GET /agents/:id` - Get agent by ID
- `PUT /agents/:id/verify` - Verify agent
- `GET /agents/:id/properties` - Get agent's properties

#### Chat

- `GET /chat/conversations` - Get user conversations
- `GET /chat/conversations/:id/messages` - Get conversation messages
- `POST /chat/conversations/:id/messages` - Send message
- `POST /chat/conversations` - Start new conversation

#### Payments

- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/mpesa` - M-Pesa payment
- `GET /payments/history` - Payment history

#### Uploads

- `POST /upload/images` - Upload images
- `POST /upload/documents` - Upload documents
- `DELETE /upload/:id` - Delete uploaded file

## 🔐 Authentication Flow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Receive access token and refresh token
3. **Use API**: Include token in Authorization header
4. **Refresh**: `POST /auth/refresh` when token expires
5. **Logout**: `POST /auth/logout` to invalidate tokens

## 📊 Database Models

### User

- Basic info (name, email, phone)
- Role (buyer, seller, agent, admin)
- Agent profile (for agents)
- Preferences and settings
- Verification status

### Property

- Basic details (title, description, type)
- Location (address, coordinates)
- Physical characteristics (bedrooms, bathrooms, area)
- Pricing and financial info
- Images and media
- Status and verification

### Chat

- Conversations between users and agents
- Messages with timestamps
- Property context

## 🔍 Search Features

- **Text Search**: Title, description, location
- **Geolocation**: Radius-based search
- **Filters**: Price, bedrooms, bathrooms, area, features
- **Sorting**: Price, date, area, relevance
- **Pagination**: Configurable page size
- **Caching**: Redis-based result caching

## 📱 Real-time Features

- **Socket.IO**: Real-time chat and notifications
- **Property Updates**: Live property status changes
- **Agent Availability**: Real-time agent status
- **View Tracking**: Live property view counts

## 🚀 Deployment

### Production Setup

1. Set environment variables for production
2. Use PM2 or similar process manager
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Configure MongoDB Atlas (if using cloud)
6. Set up Redis cluster (if needed)

### Docker Deployment

```bash
# Build image
docker build -t keja-yangu-api .

# Run container
docker run -p 5000:5000 --env-file .env keja-yangu-api
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 API Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **CORS**: Configured for frontend
- **Helmet**: Security headers
- **Password Hashing**: Bcrypt with configurable rounds

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error management
- **Health Checks**: `/health` endpoint
- **Performance**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### v1.0.0

- Initial API release
- User authentication and management
- Property CRUD operations
- Advanced search functionality
- Real-time chat system
- File upload management
- Payment integration
- Email and SMS notifications

---

**KejaYangu** - Kenya's Premier Real Estate Platform 🏠🇰🇪
