# 🧠 Scalable Job Importer — MERN Stack

This project is a **scalable job importer system** built using the MERN stack (Next.js, Node.js, Express, MongoDB, Redis).  
It fetches job data from multiple external APIs, processes them in batches using queues, and provides real-time updates.

---

## 📁 Repository Structure
```
project-root/
├── client/ # Frontend (Next.js)
├── server/ # Backend (Node.js + Express)
├── docs/ # Architecture & design docs
└── README.md # You're here
```

---

## 🚀 Features

- Job data import from multiple external APIs (XML → JSON)
- Queue-based processing (scalable & fault-tolerant)
- Job history tracking and retry logic
- Environment-configurable batch size & concurrency
- Real-time updates (Socket.IO / SSE)
- Authentication & role-based access (optional)
- Deployed on Render (server) + Vercel (client)
- Uses MongoDB Atlas + Redis Cloud

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```
### 2️⃣ Backend Setup
```
cd server
npm install
cp .env.example .env   # Fill in your credentials
npm run dev
```
### 3️⃣ Frontend Setup
```
cd ../client
npm install
cp .env.example .env
npm run dev
```
Frontend runs on http://localhost:3000
Backend runs on http://localhost:5000

## 🧩 Environment Variables
Server (/server/.env.example)
```
PORT=5000
MONGO_URI=<your_mongo_uri>
REDIS_URL=<your_redis_url>
API_BASE_URL=<api_endpoint>
BATCH_SIZE=20
MAX_CONCURRENCY=5
```
Client (/client/.env.example)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```
## 🧪 Running Tests
```
cd server
npm test
```
## ☁️ Deployment
Frontend: Deployed to Vercel

Backend: Deployed to Render

Database: MongoDB Atlas

Cache / Queue: Redis Cloud

## 📘 Documentation
See /docs/architecture.md
 for:

- System design diagrams

- Architecture decisions

- Scalability and retry logic

- Queue flow explanation

### 👨‍💻 Author
Anuj Jadhav
MERN Stack Developer | Pune, India
📧 anujjadhav2003@gmail.com
