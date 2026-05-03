# 🚀 TaskFlow | High-Fidelity Team Task Manager

TaskFlow is a premium, full-stack task management platform designed for high-performance teams. It features a unique "Deep Space" aesthetic with a custom-engineered Gantt Roadmap, providing pixel-perfect synchronization between project schedules and task execution.

Built during my internship, this project demonstrates a modern approach to collaborative productivity tools, focusing on structural alignment, glassmorphic design, and scalable full-stack architecture.

---

## ✨ Key Features

### 📅 High-Fidelity Roadmap (Gantt Engine)
*   **Pixel-Perfect Alignment:** Custom flex-grid architecture ensuring 100% vertical and horizontal synchronization across task rows.
*   **Multi-View Modes:** Dynamic switching between **Days, Weeks, and Months** with optimized scaling.
*   **Glassmorphic Visuals:** Translucent task bars with status-based color coding (Done, In Progress, Overdue, Planned).
*   **Real-time Indicators:** A glowing vertical "NOW" line for immediate temporal orientation.

### 📊 Tactical Dashboard
*   **Live Metrics:** Real-time overview of active, upcoming, and overdue tasks.
*   **Streamlined Navigation:** Context-aware sidebar with "Deep Space" dark mode styling and premium micro-animations.

### 👥 Team & Project Management
*   **Administrative Control:** Full-featured modals for team creation and project assignment.
*   **Member Management:** Bulk member addition with custom avatars and role-based access checks.
*   **Advanced Filtering:** Multi-criteria task filtering by status and assignee.

---

## 🛠 Tech Stack

### Frontend
*   **React 19:** Leveraging the latest React features for efficient state management.
*   **Vite:** High-performance build tooling and ultra-fast HMR.
*   **Vanilla CSS:** Custom-crafted design system utilizing HSL variables and CSS variables for the "Deep Space" theme.
*   **React Router 7:** Fluid client-side navigation.
*   **Axios:** Robust API communication with centralized service configuration.

### Backend
*   **Node.js & Express:** Scalable RESTful API architecture.
*   **Supabase (PostgreSQL):** Cloud-hosted relational database for persistent storage.
*   **JWT & Bcrypt:** Secure authentication and password hashing.
*   **Zod:** Strict schema validation for data integrity.

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   NPM or Yarn
*   Supabase Account

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


