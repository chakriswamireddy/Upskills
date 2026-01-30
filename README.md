# Upskills

<div align="center">

![Upskills Banner](https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=Upskills+-+Full-Stack+Learning+Platform)

**A modern, production-ready EdTech platform built with Next.js 15, TypeScript, and PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Features](#features) •  [Getting Started](#getting-started) • [API Documentation](#api-documentation) 

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [State Management](#state-management)
- [Development](#development)
- [License](#license)

---

## 🎯 Overview

Upskills is a full-stack learning management system (LMS) designed for scalability, security, and developer experience. It supports three distinct user roles (Students, Instructors, and Admins) with role-based access control, course management, enrollment tracking, and real-time analytics.

### Key Highlights

- **Role-Based Architecture**: Separate database tables for Students and Instructors with centralized identity management
- **Secure Authentication**: JWT tokens stored in HTTP-only cookies with server-side validation
- **Scalable Backend**: Database-level filtering, pagination, and sorting for optimal performance
- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS
- **Type-Safe**: End-to-end TypeScript with Zod validation and Drizzle ORM

---

## ✨ Features

### 🎓 For Students
- Browse and search courses with advanced filters (category, level, instructor)
- Enroll in courses with one-click enrollment
- Track enrolled courses and progress
- Manage personal profile and preferences
- View enrollment statistics

### 👨‍🏫 For Instructors
- Create and manage courses
- Build course curricula with lessons
- Track course analytics (enrollments, student count)
- Manage personal teaching portfolio
- View course performance metrics

### 🔍 Course System
- **Pagination**: Efficient loading with configurable page sizes
- **Search**: Real-time search by course title and instructor name
- **Filtering**: Category and difficulty level filters
- **Sorting**: By date (newest first) or popularity (most enrollments)
- **Computed Fields**: Dynamic enrollment counts and lesson counts via SQL

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library |
| **Redux Toolkit** | Global state management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | RESTful API endpoints |
| **Drizzle ORM** | Type-safe database queries |
| **PostgreSQL** | Relational database |
| **JWT** | Stateless authentication |
| **bcrypt** | Password hashing |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Neon** | PostgreSQL hosting |
| **Vercel** | Application deployment |

---


## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.17 or higher
- **PostgreSQL**: v14 or higher (or use Neon/Supabase)
- **Package Manager**: npm, yarn, or pnpm


## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │◄───┐
│ email        │    │
│ password     │    │
│ name         │    │
│ role         │    │
│ createdAt    │    │
└──────────────┘    │
                    │
        ┌───────────┴───────────┐
        │                       │
        │                       │
┌───────┴────────┐      ┌───────┴─────────┐
│   students     │      │  instructors    │
├────────────────┤      ├─────────────────┤
│ id (PK)        │      │ id (PK)         │
│ userId (FK)    │      │ userId (FK)     │
│ bio            │      │ expertise       │
└────────┬───────┘      └────────┬────────┘
         │                       │
         │                       │
         │              ┌────────┴────────┐
         │              │    courses      │
         │              ├─────────────────┤
         │              │ id (PK)         │
         │              │ instructorId(FK)│◄──┐
         │              │ title           │   │
         │              │ description     │   │
         │              │ category        │   │
         │              │ level           │   │
         │              │ createdAt       │   │
         │              └────────┬────────┘   │
         │                       │            │
         │                       │            │
         │              ┌────────┴────────┐   │
         │              │    lessons      │   │
         │              ├─────────────────┤   │
         │              │ id (PK)         │   │
         │              │ courseId (FK)   │───┘
         │              │ title           │
         │              │ content         │
         │              │ order           │
         │              └─────────────────┘
         │
         │
┌────────┴────────────┐
│   enrollments       │
├─────────────────────┤
│ id (PK)             │
│ studentId (FK)      │───┐
│ courseId (FK)       │───┤
│ enrolledAt          │   │
└─────────────────────┘   │
                          │
        ┌─────────────────┴──────────────┐
        │                                │
        └────────────────────────────────┘
```

### Core Tables

#### `users`
Central identity table for all users.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| role | ENUM | NOT NULL, CHECK(role IN ('STUDENT', 'INSTRUCTOR', 'ADMIN')) |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### `students`
Student-specific data and relationships.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| userId | UUID | FOREIGN KEY → users(id), UNIQUE, ON DELETE CASCADE |
| bio | TEXT | NULLABLE |

#### `instructors`
Instructor-specific data and relationships.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| userId | UUID | FOREIGN KEY → users(id), UNIQUE, ON DELETE CASCADE |
| expertise | VARCHAR(255) | NULLABLE |

#### `courses`
Course catalog with computed fields.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| instructorId | UUID | FOREIGN KEY → instructors(id), ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NOT NULL |
| category | VARCHAR(100) | NOT NULL |
| level | ENUM | CHECK(level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')) |
| createdAt | TIMESTAMP | DEFAULT NOW() |

**Computed Fields** (via SQL):
- `lessonsCount`: COUNT of related lessons
- `enrollmentsCount`: COUNT of enrollments
- `amIEnrolled`: EXISTS check for current student

#### `lessons`
Course curriculum content.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| courseId | UUID | FOREIGN KEY → courses(id), ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NOT NULL |
| order | INTEGER | NOT NULL |
| createdAt | TIMESTAMP | DEFAULT NOW() |

#### `enrollments`
Many-to-many relationship between students and courses.

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| studentId | UUID | FOREIGN KEY → students(id), ON DELETE CASCADE |
| courseId | UUID | FOREIGN KEY → courses(id), ON DELETE CASCADE |
| enrolledAt | TIMESTAMP | DEFAULT NOW() |
| UNIQUE(studentId, courseId) | | UNIQUE constraint on combination |

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://upskills-eight.vercel.app
```

### Authentication

All authenticated endpoints require a valid JWT token stored in HTTP-only cookies.

### JWT Payload Structure
```typescript
{
  userId: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  iat: number; // issued at
  exp: number; // expiration
}
```

#### Role-Based Access Control (RBAC)
```typescript
// Middleware example
function requireRole(allowedRoles: Role[]) {
  return (user: User) => {
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError();
    }
  };
}
```

```typescript
// Only course owner or admin can modify
async function authorizeCourseOwnerOrAdmin(
  courseId: string,
  user: User
) {
  if (user.role === "ADMIN") return true;
  
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId)
  });
  
  if (user.role === "INSTRUCTOR") {
    const instructor = await getInstructorByUserId(user.id);
    return course.instructorId === instructor.id;
  }
  
  return false;
}
```

### Security Best Practices Implemented

✅ **HTTP-Only Cookies**: Prevents XSS attacks  
✅ **Password Hashing**: bcrypt with salt rounds  
✅ **JWT Expiration**: Short-lived tokens  
✅ **Server-Side Validation**: Never trust client role  
✅ **SQL Injection Prevention**: Parameterized queries via Drizzle  
✅ **Input Validation**: Zod schemas on all inputs  
✅ **HTTPS Only**: Production cookies require secure flag  
✅ **CORS Configuration**: Restricted origins  

---

## 🔄 State Management

### Redux Toolkit Architecture

```
store/
├── index.ts           # Store configuration
├── slices/
│   ├── coursesSlice.ts
│   ├── enrollmentsSlice.ts
│   └── usersSlice.ts
└── hooks.ts           # Typed hooks
```


### Pagination Strategy

1. **Client Request**: `GET /api/courses?page=2`
2. **Server Response**: 
   - Returns 10 courses
   - Sets `X-Total` header with total count
3. **Redux Update**: 
   - Appends courses to state (infinite scroll)
   - Updates pagination metadata
4. **UI Render**: 
   - Displays courses
   - Shows "Load More" if more pages exist

---


### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:push         # Push schema changes
npm run db:studio       # Open Drizzle Studio
npm run db:generate     # Generate migrations
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database

# Type Checking
npm run type-check      # TypeScript check
```


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Vercel](https://vercel.com/) - Hosting platform

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and PostgreSQL**

[⬆ Back to Top](#upskills)

</div>