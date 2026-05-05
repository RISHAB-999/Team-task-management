# 🚀 TaskFlow | High-Fidelity Team Task Manager

TaskFlow is a premium, full-stack task management platform designed for high-performance teams. It features a unique "Deep Space" aesthetic with a custom-engineered Gantt Roadmap, providing pixel-perfect synchronization between project schedules and task execution.

Built during my internship, this project demonstrates a modern approach to collaborative productivity tools, focusing on structural alignment, glassmorphic design, and scalable full-stack architecture.

---

## ✨ Key Features

### 📅 High-Fidelity Roadmap (Gantt Engine)
*   **Pixel-Perfect Alignment:** Custom flex-grid architecture ensuring 100% vertical and horizontal synchronization across task rows.
*   **Multi-View Modes:** Dynamic switching between **Days, Weeks, and Months** with optimized scaling.
*   **Glassmorphic Visuals:** Translucent task bars with status-based color coding (Done, In Progress, Overdue, Planned).
*   **Real-time Indicators:** A glowing vertical purple "NOW" line marking today's date from top to bottom.
*   **Colored Phase Indicators:** 6-color rotating scheme for visual distinction between project phases.

### 📊 Personalized Dashboard
*   **Personalized Greeting:** Dynamic "Welcome {username}" message based on logged-in user.
*   **Live Metrics:** Real-time overview of active, upcoming, and overdue tasks.
*   **Streamlined Navigation:** Context-aware sidebar with "Deep Space" dark mode styling.

### 👥 Team & Project Management
*   **Administrative Control:** 
  - Create teams with member management
  - Create projects with multi-team assignment
  - Manage team members (add, remove, search)
  - Promote members to admin role
  - Delete member accounts with cascade deletion
  - Delete teams with confirmation modal
  - Delete projects with confirmation modal
*   **Advanced Filtering:** Filter by status, assignee, and project context.
*   **Member Search:** Quick search for current team members by name or email.

### 👤 Admin Dashboard
*   **Full User Management:** View all team members with comprehensive details.
*   **Member Actions:**
  - Promote members to admin
  - Delete member accounts (with permanent data removal)
  - Search members by name or email
  - View join date and role
*   **Cascade Deletion:** Automatically removes member from all teams, projects, and unassigns tasks.

### 🔍 Search & Discovery
*   **Unified Search:** Cross-project task and team search functionality.
*   **Smart Filtering:** Find tasks by status, assignee, and project context.

### 📅 Multiple View Modes
*   **Dashboard:** Personalized overview with welcome message.
*   **Projects:** Grid view with color indicators and progress tracking.
*   **Calendar View:** Visual task scheduling with date navigation.
*   **Timeline View:** Project roadmap with Gantt chart and "NOW" indicator.
*   **My Tasks:** Personalized task list for assigned items.
*   **Admin Panel:** User management and member administration.

### 🔐 Security & Access Control
*   **JWT Authentication:** Secure token-based authentication.
*   **Role-Based Access Control:** Differentiated permissions for members and admins.
*   **Admin-Only Operations:** Delete, promote, and manage members.
*   **Password Hashing:** Bcrypt-secured password storage.
*   **Cascade Deletion:** Safe data removal with automatic cleanup of related records.

---

## 🛠 Tech Stack

### Frontend
*   **React 19:** Latest React features for efficient state management.
*   **Vite:** High-performance build tooling with ultra-fast HMR.
*   **Vanilla CSS:** Custom-crafted design system with HSL variables and "Deep Space" theme.
*   **React Router 7:** Fluid client-side navigation and route protection.
*   **Axios:** Robust HTTP client with centralized API configuration.
*   **Supabase Client:** Real-time database connectivity.

### Backend
*   **Node.js & Express:** Scalable RESTful API architecture.
*   **Supabase (PostgreSQL):** Cloud-hosted relational database for persistent storage.
*   **JWT (jsonwebtoken):** Secure token-based authentication.
*   **Bcryptjs:** Password hashing and security.
*   **Zod:** Schema validation for data integrity.
*   **CORS:** Cross-origin request handling for secure frontend-backend communication.

### Database
*   **PostgreSQL** (via Supabase): Relational database with real-time capabilities.
*   **Row-Level Security:** Built-in authentication and authorization.

---

## 📁 Project Structure

```
Team Task Manager/
├── backend/                      # Express.js API server
│   ├── src/
│   │   ├── index.js              # Server entry point
│   │   ├── config/
│   │   │   └── supabase.js        # Supabase configuration
│   │   ├── controllers/           # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── teamController.js
│   │   │   ├── userController.js
│   │   │   └── searchController.js
│   │   ├── middleware/            # Custom middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── routes/                # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── teamRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── searchRoutes.js
│   │   └── utils/                 # Utility functions
│   │       ├── token.js
│   │       └── colors.js
│   ├── supabase_schema.sql        # Database schema
│   └── package.json
├── frontend/                      # React + Vite application
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Main app component
│   │   ├── App.css                # Global styles
│   │   ├── index.css              # Base styles
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── Toast.jsx
│   │   ├── pages/                 # Route pages
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── MyTasks.jsx
│   │   │   ├── Admin.jsx          # Admin dashboard for user management
│   │   │   ├── Teams.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Calendar.jsx
│   │   │   └── Timeline.jsx
│   │   ├── context/               # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/                 # Custom React hooks
│   │   │   └── useToast.js
│   │   ├── services/              # API services
│   │   │   └── api.js
│   │   ├── lib/                   # Library configurations
│   │   │   └── supabaseClient.js
│   │   ├── utils/                 # Utility functions
│   │   │   └── colors.js
│   │   └── assets/                # Static assets
│   ├── public/                    # Static public files
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js** v18 or higher
*   **npm** or **yarn** package manager
*   **Supabase Account** ([Create one here](https://supabase.com))
*   **Git** for version control

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Team Task Manager"
```

#### 2. Backend Setup

Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory with the following variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Database Setup:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL schema from `backend/supabase_schema.sql`
4. This will create all necessary tables and relationships

Start the backend development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

#### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📚 API Documentation

### Authentication Endpoints
*   `POST /api/v1/auth/signup` - Register a new user
*   `POST /api/v1/auth/login` - User login
*   `POST /api/v1/auth/logout` - User logout

### User Endpoints
*   `GET /api/v1/users` - List all users (admin only)
*   `PUT /api/v1/users/:id/role` - Update user role (admin only)
*   `PUT /api/v1/users/:id/promote` - Promote user to admin (admin only)
*   `DELETE /api/v1/users/:id` - Delete user account with cascade deletion (admin only)
*   `PUT /api/v1/users/me/profile` - Update current user profile
*   `PUT /api/v1/users/me/password` - Change password

### Project Endpoints
*   `GET /api/v1/projects` - List all projects
*   `POST /api/v1/projects` - Create new project (with multi-team assignment)
*   `GET /api/v1/projects/:id` - Get project details
*   `PUT /api/v1/projects/:id` - Update project
*   `DELETE /api/v1/projects/:id` - Delete project (admin or project admin only, with cascade deletion)
*   `POST /api/v1/projects/:id/members` - Add member to project
*   `DELETE /api/v1/projects/:id/members/:userId` - Remove member from project

### Task Endpoints
*   `GET /api/v1/tasks` - List all tasks
*   `GET /api/v1/tasks/timeline` - Get tasks for timeline view
*   `POST /api/v1/tasks` - Create new task
*   `GET /api/v1/tasks/:id` - Get task details
*   `PUT /api/v1/tasks/:id` - Update task
*   `DELETE /api/v1/tasks/:id` - Delete task

### Team Endpoints
*   `GET /api/v1/teams` - List all teams with member counts
*   `POST /api/v1/teams` - Create new team
*   `GET /api/v1/teams/:id` - Get team details with members
*   `DELETE /api/v1/teams/:id` - Delete team (admin only, with cascade deletion)
*   `POST /api/v1/teams/:id/members` - Add member to team
*   `DELETE /api/v1/teams/:id/members/:userId` - Remove member from team

### Search Endpoints
*   `GET /api/v1/search` - Unified search across tasks and teams

---

## 🔧 Available Scripts

### Backend
```bash
npm run dev        # Start development server with nodemon
npm start          # Start production server
```

### Frontend
```bash
npm run dev        # Start development server with HMR
npm run build      # Build for production
npm start          # Serve production build locally
```

---

## 🎨 Design System

The application uses a custom "Deep Space" theme with:
*   **Dark Mode:** Premium dark color palette optimized for focus and reduced eye strain
*   **Glassmorphism:** Translucent UI elements with backdrop blur effects
*   **HSL Color Variables:** Flexible, scalable color system
*   **Micro-animations:** Smooth transitions and interactive feedback
*   **Responsive Design:** Mobile-first approach with breakpoints for all screen sizes

---

## �️ Admin Features

### User Management Dashboard
Accessible at `/admin` for admin users. Features include:

- **Member List View:** Comprehensive table of all registered members
- **User Search:** Quick search by name or email
- **Role Management:** 
  - View current role (admin/member)
  - Promote members to admin status
- **Account Deletion:** 
  - Delete member accounts with confirmation
  - Automatic cascade deletion of all related data:
    - Remove from all teams
    - Remove from all projects
    - Unassign from all tasks
- **Audit Information:** Join date and role visibility

### Team Management
- **Delete Teams:** Admin-only team deletion with cascade cleanup
- **Manage Members:** Add/remove team members with search functionality
- **Member Search:** Find current members within team management modal

### Project Management
- **Multi-Team Assignment:** Assign projects to multiple teams
- **Project Deletion:** Admin and project admin can delete with confirmation
- **Cascade Cleanup:** Automatic removal of all related data

---

## 🔐 Security Features

*   **JWT Authentication:** Token-based secure authentication
*   **Password Hashing:** Bcrypt with salt rounds for password security
*   **CORS Protection:** Configured for secure cross-origin requests
*   **Role-Based Access Control (RBAC):** Different permission levels (admin/member)
*   **Supabase RLS:** Row-Level Security policies for database access control
*   **Cascade Deletion:** Safe data removal with automatic cleanup
*   **Admin-Only Operations:** Sensitive operations require admin role
*   **Environment Variables:** Sensitive data stored in `.env` files (not committed)

---

## 🚀 Deployment

### Backend Deployment (Node.js)
1. Deploy to platforms like Heroku, Vercel, or Railway
2. Set environment variables in deployment platform
3. Ensure Node.js version matches your development environment

### Frontend Deployment (React)
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to:
   - Vercel (recommended for Vite apps)
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

### Database
Supabase hosting is cloud-based, so no additional deployment needed beyond URL and key configuration.

---

## 📝 Environment Variables Reference

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key for client-side access |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side operations |
| `JWT_SECRET` | Secret key for JWT token signing |
| `PORT` | Backend server port (default: 3000) |
| `FRONTEND_URL` | Frontend application URL for CORS |

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_API_BASE_URL` | Backend API base URL |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License. See the LICENSE file for more details.

---

## 📧 Support

For questions, issues, or suggestions, please:
*   Open an issue on GitHub
*   Contact the development team

---

## 🎓 Learning Resources

*   [React Documentation](https://react.dev)
*   [Express.js Guide](https://expressjs.com)
*   [Supabase Documentation](https://supabase.com/docs)
*   [Vite Guide](https://vitejs.dev)
*   [React Router Documentation](https://reactrouter.com)

---

**Built with ❤️ during internship**

### 2. Environment Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

### 3. Installation
```bash
# Clone the repository
git clone https://github.com/RISHAB-999/Team-task-management.git

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 4. Running the Project
```bash
# Start Backend (from backend directory)
npm run dev

# Start Frontend (from frontend directory)
npm run dev
```

---

## 🎨 Design Philosophy
TaskFlow prioritizes **Visual Excellence** and **Structural Integrity**. The interface uses a curated dark palette (`#0d0d15`, `#111118`) accented by vibrant Indigo and Violet glows, creating a professional environment that reduces cognitive load for long-term planning.

---

## 📈 Internship Contributions
*   Designed and implemented the core **Gantt Chart Engine** from scratch.
*   Optimized database queries for real-time task status updates.
*   Engineered a responsive **Glassmorphic UI** system with custom CSS components.
*   Integrated a full-stack **Member Assignment** workflow with bulk selection logic.

---


