# GigVibe 🚀
### *A Serverless, Hybrid-Cloud Freelancing Marketplace*

GigVibe is a full-stack freelancing platform engineered to connect clients with independent freelancers. Built using a high-performance hybrid cloud architecture, the platform handles end-to-end user lifecycles, secure cryptographic authentication, an interactive job board, and concurrent bidding workflows.

---

## 📌 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Database Schema](#-database-schema)
4. [API Endpoints](#-api-endpoints)
5. [Local Development Guide](#-local-development-guide)

---

## 🌟 Core Features

### 🔒 Operational Security
* **Secure Onboarding:** Cryptographically signed user authentication utilizing asynchronous `bcrypt` password salting and hashing.
* **Route Protection:** Stateful authorization managed via JSON Web Tokens (JWT) embedded across restricted API routes.

### 👥 Dual-Dashboard Interface
* **Client Module:** Post detailed freelance gigs with budget caps, manage incoming developer proposals, and update project status.
* **Freelancer Module:** Explore live marketplace listings, submit dynamic bids with custom pricing/timelines, and track application states.

---

## 🛠️ Tech Stack & Architecture

### Technology Matrix

| Layer | Technology | Primary Utility |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js (React) | Declarative UI, App Router optimization, global state tracking |
| **Styling** | Tailwind CSS | Component isolation and responsive layout scaling |
| **Backend API** | Node.js & Express.js | Event-driven RESTful API routing and middleware pipelines |
| **Database** | PostgreSQL | ACID-compliant relational data modeling |
| **Cloud Hosting**| Google Cloud Run | Scalable, containerized backend code hosting |
| **Data Hosting**  | Neon.tech | Serverless cloud-native Postgres storage engine |
| **CDN Delivery** | Firebase Hosting | Ultra-fast edge deployment for the user interface |

### System Data Flow

[ Client Browser ] ----( HTTPS / Next.js )----> [ Firebase CDN ]
         │
    (REST APIs)
         ▼
[ Google Cloud Run ] ---( Connection Pool / SSL )---> [ Neon Postgres Cloud ]


### Database Schema
The system utilizes an explicit relational database structure enforcing strict foreign key constraints and cascading logic.
```
  ┌──────────────┐             ┌──────────────┐
  │    USERS     │             │    GIGS      │
  ├──────────────┤             ├──────────────┤
  │ id (PK)      │1 ┌───────┐ N│ id (PK)      │
  │ email        │──┤ BIDS  ├──│ client_id(FK)│
  │ password_hash│  ├───────┤  │ title        │
  │ role         │  │id (PK)│  │ budget       │
  └──────────────┘  └───────┘  └──────────────┘
```
### API Endpoints Documentation

--> Authentication Routes
* POST /api/auth/register - Registers a new user entity.
* POST /api/auth/login - Verifies credentials and issues a signed JWT access token.

--> Gig Marketplace Routes
* GET /api/gigs - Retrieves available active marketplace listings.
* POST /api/gigs - Registers a new project assignment (Client access only).
* GET /api/gigs/:id - Extracts metadata parameters for a targeted gig listing.

--> Bidding Routes
* POST /api/gigs/:id/bids - Submits a professional execution proposal.
* GET /api/gigs/:id/bids - Aggregates incoming bids for client review workflows.

### Local Development Guide

--> Prerequisites
* Node.js environment (v18.x or above)
* Local PostgreSQL server instance running

### 1. Clone & Environment Setup

```
git clone [https://github.com/9c682tzqs8-hub/gigvibe.git](https://github.com/9c682tzqs8-hub/gigvibe.git)
cd gigvibe/backend
touch .env
```
* Populate the backend/.env file with the following keys:

```
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/gigvibe
JWT_SECRET=your_runtime_cryptographic_secret_string
```
### 2. Initialize Relational Schema

* Execute the definition script against your local database engine:

```
psql -U postgres -d gigvibe -f schema.sql
```
### 4. Application Execution

* Launch Backend Engine:

```
cd backend
npm install
npm start
```
* Launch Frontend Interface:

```
cd ../frontend
npm install
npm run dev
```
### Navigate to http://localhost:3000 to interact with the local development instance.
