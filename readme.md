# Task Tracker - Full-Stack Application

This is a robust Task Management Application built as part of the WLDD assignment. It features a complete **Authentication system** (Signup/Login), **Secure Task Management** (CRUD), **Filtering**, and **Real-time Optimistic UI updates**.

## 🚀 Tech Stack

### **Backend**
*   **Runtime:** Node.js
*   **Framework:** Express.js + TypeScript
*   **Database:** MongoDB + Mongoose (Schema Validation & Indexing)
*   **Caching:** Redis (Cache GET /tasks & Invalidation on writes)
*   **Authentication:** JWT (JSON Web Tokens) + bcrypt (Password Hashing)
*   **Testing:** Jest + Supertest (Mocked DB/Redis)

### **Frontend**
*   **Framework:** Next.js (App Router) + TypeScript
*   **Styling:** Tailwind CSS (Responsive & Dark/Light Mode support)
*   **State Management:** Context API (AuthContext, ToastContext)
*   **HTTP Client:** Axios (Interceptors for Auth Token injection)

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/PRAVESH-110/WLDD-assignment.git
cd wldd_assignment
```

### 2. Backend Setup
Navitage to the backend directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/task-tracker
JWT_SECRET=your_super_secret_key
REDIS_URL=redis://localhost:6379 
# (Or use Render/Upstash URL. If not available, app will fallback to MongoDB only)
FRONTEND_URL=http://localhost:3000
```

Start the Backend Server:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
npm install
```

Create a `.env.local` file (optional if defaults work, but recommended):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the Frontend Server:
```bash
npm run dev
# App runs on http://localhost:3000
```

---

## ✅ Testing (Backend)

We use **Jest** for unit and integration testing.

To run tests:
```bash
cd backend
npm test
```
To check coverage:
```bash
npm run test:coverage
```

---

## 📝 API Endpoints

### Authentication
*   `POST /api/auth/signup` - Register a new user.
*   `POST /api/auth/login` - Login and receive JWT.

### Tasks (Protected)
*   `GET /api/tasks` - List all tasks (Cached via Redis).
*   `POST /api/tasks` - Create a new task.
*   `PUT /api/tasks/:id` - Update task (status, title, etc).
*   `DELETE /api/tasks/:id` - Delete a task.

---

## ✨ Features Highlight
*   **Secure Auth w/ JWT:** Tokens are automatically attached to requests via Axios interceptors.
*   **Redis Caching:** Task lists are cached for performance and invalidated instantly on meaningful updates.
*   **Optimistic UI:** Dashboard updates immediately before server confirmation for a snappy feel.
*   **Robust Error Handling:**Backend validaion with **Zod** ensures data integrity.
*   **Toast Notifications:** User-friendly success/error alerts.


Built with ❤️ by Pravesh.
