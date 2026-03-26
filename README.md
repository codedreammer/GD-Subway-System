# 🚇 GD Subway – Smart Campus Marketplace

A full-stack **real-time campus food ordering system** that eliminates queues and improves efficiency for students and vendors.

---

## 📌 Overview

GD Subway is a modern web application designed for college campuses where students can browse menus, place orders, and pick them up efficiently without waiting in long queues.

The system connects **Students, Vendors, and Admins** in one platform with role-based access and real-time updates.

---

## 🎯 Features

### 👨‍🎓 Student

* Browse available food items
* Place orders easily
* Track order status (Pending → Preparing → Completed)
* Smooth and responsive UI

### 🧑‍🍳 Vendor

* Manage menu items (Add / Edit / Delete)
* View incoming orders
* Update order status in real-time

### 🛠 Admin

* Manage users (Students & Vendors)
* Monitor platform activity
* Control access and roles

---

## ⚙️ Tech Stack

| Category         | Technology                          |
| ---------------- | ----------------------------------- |
| Frontend         | Next.js (App Router), Tailwind CSS  |
| Backend          | Next.js Server Actions / API Routes |
| Database         | Supabase (PostgreSQL)               |
| Authentication   | Supabase Auth                       |
| State Management | Zustand                             |
| Styling          | Tailwind CSS                        |

---

## 🏗 Project Structure

```
src/
 ├── app/            # Pages (Next.js App Router)
 ├── components/     # Reusable UI components
 ├── hooks/          # Custom React hooks
 ├── lib/            # Utilities & Supabase client
 ├── services/       # Business logic
 ├── store/          # Zustand state management
 ├── utils/          # Helper functions
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/codedreammer/GD-Subway-System.git
cd GD-Subway-System
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Setup environment variables

Create a `.env.local` file in root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
```

⚠️ Do NOT share or commit this file.

---

### 4️⃣ Run the project

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🔐 Security Note

* Environment variables are stored securely using `.env.local`
* Sensitive keys (like Supabase service role key) are never exposed in frontend

---

## 🔄 Workflow

```text
Student → Places Order → Stored in DB → Vendor Updates Status → Student Sees Update
```

---

## 📈 Future Enhancements

* 💳 Online Payment Integration
* 🔔 Real-time Notifications
* 📱 Mobile App Version
* 📊 Analytics Dashboard
* 🤖 AI-based food recommendations

---

## 👥 Team

* **Akshay Anand** (Team Lead)
* Abhishek Yadav
* Ashwin

---

## 📌 Contribution Workflow

1. Create a new branch
2. Make changes
3. Push to GitHub
4. Create Pull Request → `dev`
5. Review & merge

---

## ⭐ Why This Project?

* Solves real campus problem
* Full-stack implementation
* Clean architecture with modern tools
* Production-level workflow (Git, PR, Branching)

---

## 📄 License

This project is for educational purposes.

---

## 🙌 Acknowledgements

* Supabase
* Next.js
* Tailwind CSS
