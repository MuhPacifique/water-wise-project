# Water-Wise Backend API

A comprehensive Node.js backend API for the Water-Wise project - an East African water conservation platform built with Express.js, MySQL, and Socket.IO for real-time features.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Real-time Chat** - Socket.IO powered chat system with rooms and messaging
- **Resource Management** - Upload, download, and manage educational resources
- **Multi-language Support** - Google Translate API integration for content translation
- **Analytics & Monitoring** - Comprehensive user activity tracking and reporting
- **File Upload** - Secure file upload with type validation and size limits
- **RESTful API** - Well-structured REST endpoints with proper HTTP status codes
- **Database Integration** - MySQL with connection pooling and migrations
- **Security** - Helmet, CORS, rate limiting, input validation, and sanitization
- **Logging** - Winston-based logging with configurable levels
- **Error Handling** - Centralized error handling with proper error responses

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16.0.0+)
- **Framework**: Express.js
- **Database**: MySQL (v8.0+)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Validation**: Express Validator
- **Security**: Helmet, bcryptjs, CORS
- **File Upload**: Multer
- **Translation**: Google Translate API
- **Logging**: Winston
- **Process Management**: PM2 (recommended for production)

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Environment Variables:**
```env
# Database
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=water_wise_db

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Email (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE water_wise_db;
EXIT;

# Run database migrations
npm run migrate
```

### 4. Start Development Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/updatepassword` | Update password | Private |
| POST | `/api/auth/forgotpassword` | Request password reset | Public |
| PUT | `/api/auth/resetpassword/:token` | Reset password | Public |

### User Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Owner/Admin |
| PUT | `/api/users/:id` | Update user | Owner/Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| GET | `/api/users/:id/profile` | Get user profile | Owner/Admin |
| PUT | `/api/users/:id/profile` | Update user profile | Owner |
| GET | `/api/users/:id/activity` | Get user activity | Owner/Admin |

### Resource Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/resources` | Get all resources | Public |
| GET | `/api/resources/:id` | Get resource by ID | Public |
| POST | `/api/resources` | Upload resource | Private |
| PUT | `/api/resources/:id` | Update resource | Owner/Admin |
| DELETE | `/api/resources/:id` | Delete resource | Owner/Admin |
| GET | `/api/resources/:id/download` | Download resource | Public |
| GET | `/api/resources/categories` | Get categories | Public |

### Chat System

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/chat/rooms` | Get chat rooms | Private |
| GET | `/api/chat/rooms/:id` | Get room details | Private |
| GET | `/api/chat/messages/:roomName` | Get room messages | Private |
| POST | `/api/chat/messages` | Send message | Private |
| PUT | `/api/chat/messages/:id` | Edit message | Owner |
| DELETE | `/api/chat/messages/:id` | Delete message | Owner/Moderator |
| POST | `/api/chat/rooms/:id/join` | Join room | Private |
| POST | `/api/chat/rooms/:id/leave` | Leave room | Private |
| POST | `/api/chat/messages/:id/reactions` | Add reaction | Private |

### Translation Service

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/translation/translate` | Translate text | Public |
| POST | `/api/translation/batch` | Batch translate | Public |
| GET | `/api/translation/languages` | Get languages | Public |
| GET | `/api/translation/stats` | Translation stats | Admin |

### Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/analytics/track` | Track event | Private |
| GET | `/api/analytics/user/:userId` | User analytics | Owner/Admin |
| GET | `/api/analytics/site` | Site analytics | Admin |
| GET | `/api/analytics/resources` | Resource analytics | Admin |
| GET | `/api/analytics/engagement` | User engagement | Admin |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `5000` | No |
| `DB_HOST` | MySQL host | `localhost` | Yes |
| `DB_USER` | MySQL username | - | Yes |
| `DB_PASSWORD` | MySQL password | - | Yes |
| `DB_NAME` | Database name | `water_wise_db` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | `30d` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` | No |

## 🗄️ Database Schema

The application uses 15+ MySQL tables including:

- `users` - User accounts and profiles
- `user_profiles` - Extended user information
- `resources` - Educational resources and documents
- `resource_translations` - Multi-language resource content
- `chat_messages` - Real-time chat messages
- `chat_rooms` - Chat rooms and channels
- `room_members` - Chat room membership
- `activities` - User activity logging
- `analytics` - Site analytics and tracking
- `water_data` - Water conservation data
- `projects` - Conservation projects
- `notifications` - User notifications
- `settings` - Application settings

Run `npm run migrate` to create all tables and initial data.

## 🔒 Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing control
- **Rate Limiting** - API rate limiting (100 requests/15min)
- **Input Validation** - Comprehensive input sanitization
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content sanitization
- **CSRF Protection** - Token-based protection
- **Password Hashing** - bcrypt with 12 salt rounds
- **JWT Authentication** - Secure token-based auth
- **File Upload Security** - Type and size validation

## 📊 Monitoring & Logging

- **Winston Logger** - Structured logging with multiple levels
- **Error Tracking** - Centralized error handling
- **Performance Monitoring** - Response time tracking
- **Database Monitoring** - Connection pool monitoring
- **Analytics** - User behavior tracking
- **Health Checks** - `/api/health` endpoint

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong `JWT_SECRET`
- [ ] Configure email service
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure log rotation
- [ ] Set up monitoring (optional)
- [ ] Configure backup strategy

### PM2 Deployment

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'water-wise-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Response Format

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@waterwise.org or join our Discord community.

## 🙏 Acknowledgments

- Water-Wise Team for the vision and requirements
- East African water conservation community
- Open source contributors

---

**Built with ❤️ for East African water conservation**
