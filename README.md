# MentorLink - Academic Advisor Platform

MentorLink is a comprehensive academic advising platform that connects students with academic advisors, providing personalized guidance, real-time chat, AI-powered assistance, and tools to help students succeed in their academic journey.

## 🎯 Features

### For Students
- **Real-time Chat**: Connect directly with your assigned academic advisor
- **AI Assistant**: Get instant answers to common academic questions using GLM 4.5 AI
- **Course Management**: View and track your enrolled courses
- **Academic Records**: Access your GPA, attendance, and academic performance
- **Graduation Planning**: AI-powered graduation pathway recommendations
- **24/7 Support**: AI assistant available anytime for guidance

### For Advisors
- **Student Management**: Manage assigned students and track their progress
- **Communication Tools**: Chat with students in real-time
- **Academic Analytics**: View student performance metrics
- **Efficient Workflow**: Handle multiple student queries efficiently

### For Administrators
- **Dashboard**: Comprehensive overview of platform statistics
- **User Management**: Manage students, advisors, and assignments
- **Analytics**: Track engagement and platform usage
- **System Monitoring**: Monitor platform health and performance

## 🏗️ Architecture

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** + **shadcn/ui** for modern UI components
- **React Router** for navigation
- **Axios** for API communication
- **React Query** for state management

### Backend
- **Node.js** + **Express**
- **TypeScript** for type safety
- **SQLite** database with better-sqlite3
- **JWT** authentication
- **GLM 4.5 AI** integration via ZhipuAI API
- **CORS** enabled for cross-origin requests

### Database
- **SQLite** - Lightweight, file-based database
- Comprehensive schema for users, students, advisors, courses, chats, and more
- Optimized with indexes and foreign key constraints

## 📁 Project Structure

```
advisorlink-ai/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities and helpers
│   └── main.tsx                  # Entry point
│
├── backend/                      # Backend source code
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API routes
│   │   ├── config/               # Configuration files
│   │   ├── functions/            # AI and business logic
│   │   └── server.ts             # Server entry point
│   ├── scripts/                  # Database scripts
│   └── Dockerfile                # Backend container config
│
├── database/                     # Database schemas and migrations
│   ├── schema-sqlite.sql         # SQLite schema
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
├── docker-compose.yml            # Docker composition
├── Dockerfile                    # Frontend container config
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** 20+ and npm
- **Docker** and Docker Compose (for containerized deployment)
- **GLM API Key** from [ZhipuAI](https://open.bigmodel.cn/)

### Installation

#### Option 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/advisorlink-ai.git
   cd advisorlink-ai
   ```

2. **Create `.env` file:**
   ```bash
   JWT_SECRET=your_secure_random_string_here
   GLM_API_KEY=your_glm_api_key_here
   FRONTEND_URL=http://localhost
   ```

3. **Start with Docker:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

#### Option 2: Local Development

**Frontend:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Backend:**
```bash
cd backend

# Install dependencies
npm install

# Initialize database
npx ts-node scripts/seed-data.ts

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# JWT Secret for authentication
JWT_SECRET=your_secure_random_string

# GLM API Key (ZhipuAI GLM 4.5 Air)
GLM_API_KEY=your_glm_api_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost
```

### Database

The SQLite database is automatically initialized when the backend starts. The schema includes:
- Users (students, advisors, admins)
- Academic levels and sections
- Courses and enrollment
- Chat conversations and messages
- AI chat history
- FAQs and more

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students/profile` - Get student profile
- `GET /api/students/courses` - Get enrolled courses
- `GET /api/students/advisor` - Get assigned advisor

### Advisors
- `GET /api/advisors/profile` - Get advisor profile
- `GET /api/advisors/students` - Get assigned students

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `POST /api/chat/messages` - Send message
- `GET /api/chat/messages/:id` - Get conversation messages

### AI Assistant
- `POST /api/ai/chat` - Chat with AI assistant
- `GET /api/ai/history` - Get AI chat history

### Admin
- `GET /api/admin/stats` - Get platform statistics

## 🐳 Docker Deployment

### Build and Run
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker logs mentorlink-backend
docker logs mentorlink-frontend

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose down
docker-compose build
docker-compose up -d
```

### Data Persistence

Database data is stored in Docker volumes:
- `backend-data` - SQLite database
- `backend-logs` - Application logs

**Important:** Do NOT use `docker-compose down -v` unless you want to delete all data!

## 🌐 Deployment

### Production Deployment Options

1. **Cloud Platforms**
   - Railway.app (easiest)
   - Render.com
   - Fly.io
   - DigitalOcean App Platform

2. **VPS Hosting**
   - DigitalOcean Droplet
   - Linode
   - AWS EC2

3. **Container Registry**
   - Push to Docker Hub
   - Deploy to any container platform

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🛠️ Development

### Frontend Development
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon
npm run build      # Compile TypeScript
npm start          # Run compiled code
npm run seed       # Seed database with test data
```

## 📝 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | SQLite with better-sqlite3 |
| **AI** | GLM 4.5 (ZhipuAI) |
| **Authentication** | JWT |
| **Deployment** | Docker, Docker Compose |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Built with ❤️ by the MentorLink team.

## 📧 Support

For questions or support, please contact:
- Email: support@mentorlink.edu
- GitHub Issues: [Create an issue](https://github.com/yourusername/advisorlink-ai/issues)

---

**Note:** This is an academic project designed to help students connect with advisors and succeed in their educational journey.
