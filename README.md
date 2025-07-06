# Health Connect Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive healthcare platform backend built with NestJS that manages doctors, patients, consultations, feedback, and provides chatbot functionality for healthcare services.

## 🏥 Features

- **Admin Panel**: Manage doctors, patients, and feedback
- **Mobile API**: Patient authentication, consultations, and chatbot services
- **Doctor Management**: Doctor registration, patient assignments, and consultation management
- **Patient Portal**: OTP-based authentication, visit tracking, and chatbot interactions
- **Feedback System**: Patient feedback collection and management
- **AI Chatbot**: OpenAI-powered healthcare chatbot
- **Speech-to-Text**: Voice input processing capabilities
- **Email & SMS**: Twilio integration for notifications

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **API Documentation**: Swagger/OpenAPI
- **AI Integration**: OpenAI API
- **Communication**: Twilio (SMS), Nodemailer (Email)
- **File Storage**: AWS S3
- **Language**: TypeScript

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ccdp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
LISTING_PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/health-connect
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/health-connect

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# AWS Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

### 4. Database Setup

Make sure MongoDB is running on your system or update the `MONGO_URI` in your `.env` file to point to your MongoDB instance.

### 5. Run the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at `http://localhost:3000`

### 6. API Documentation

Once the application is running, you can access the Swagger API documentation at:
`http://localhost:3000/api`

## 📊 Database Seeding

To populate the database with initial data (questions, categories, etc.):

```bash
# Build the application first
npm run build

# Run the seeder
node dist/seeds/seeds.js
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── admin/                 # Admin panel functionality
│   ├── auth/             # Admin authentication
│   ├── doctor/           # Doctor management
│   ├── feedbacks/        # Feedback management
│   └── patients/         # Patient management
├── mobile/               # Mobile API endpoints
│   ├── doctors/          # Doctor-related mobile APIs
│   └── patients/         # Patient-related mobile APIs
│       ├── auth/         # Patient authentication
│       ├── chatbot/      # AI chatbot functionality
│       └── visits/       # Patient visits
├── shared/               # Shared components
│   ├── guards/           # Authentication guards
│   ├── repositories/     # Database repositories
│   ├── schemas/          # MongoDB schemas
│   └── service/          # Shared services
├── helpers/              # Utility functions and services
├── seeds/                # Database seeding
└── main.ts              # Application entry point
```

## 🔐 Authentication

The application uses JWT-based authentication with different roles:

- **Admin**: Full access to admin panel
- **Doctor**: Access to assigned patients and consultations
- **Patient**: Access to personal data and chatbot

## 📱 API Endpoints

### Admin Endpoints
- `POST /admin/auth/login` - Admin login
- `POST /admin/doctors` - Create doctor
- `GET /admin/doctors` - Get all doctors
- `POST /admin/patients` - Create patient
- `GET /admin/feedbacks` - Get feedback

### Mobile Endpoints
- `POST /mobile/patients/auth/login` - Patient login with OTP
- `POST /mobile/patients/auth/verify-otp` - Verify OTP
- `POST /mobile/patients/chatbot` - Chatbot interaction
- `GET /mobile/doctors` - Get available doctors
- `POST /mobile/doctors/consultations` - Create consultation

## 🔧 Development

### Code Formatting

```bash
npm run format
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start:prod
```

### Environment Variables

Make sure to set all required environment variables in your production environment.

### Database

Ensure your MongoDB instance is properly configured and accessible from your production server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the [API Documentation](http://localhost:3000/api) when running locally
- Review the NestJS documentation: [https://docs.nestjs.com](https://docs.nestjs.com)
- Create an issue in the repository

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Swagger Documentation](https://swagger.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
