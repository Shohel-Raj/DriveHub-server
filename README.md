# 🚗 DriveHub – Vehicle Rental System API

A production-ready backend API for managing a complete vehicle rental platform.  
DriveHub provides vehicle inventory, customer profiles, booking management, authentication, and admin-level controls.

---

## 📌 Features

### 🔐 Authentication & Authorization
- JWT-based authentication  
- Role-based access control: **admin** and **customer**  
- Secure password hashing using **bcrypt**

### 🚘 Vehicle Management
- Add, update, delete vehicles (**admin only**)  
- Track availability (available / booked)  
- Public vehicle listing and details  

### 👥 User Management
- Admin can manage all users  
- Users can update their own profile  
- Prevent deleting users with active bookings  

### 📆 Booking Management
- Create bookings with start & end dates  
- Automatic price calculation  
- Vehicle availability check  
- Cancel bookings  
- Admin can mark vehicle as returned  
- Prevent deleting vehicles with active bookings  

---

## 🛠️ Tech Stack

- **Node.js + TypeScript**  
- **Express.js**  
- **PostgreSQL**  
- **pg (node-postgres)**  
- **bcrypt**  
- **jsonwebtoken**  
- **dotenv**  
- Modular **MVC folder structure**

---
## 🗄️ Database Schema

### **Users Table**
| Field       | Type        | Notes                |
|-------------|-------------|----------------------|
| id          | SERIAL PK   |                      |
| name        | TEXT        | NOT NULL             |
| email       | TEXT        | UNIQUE NOT NULL      |
| password    | TEXT        | NOT NULL             |
| phone       | TEXT        | NOT NULL             |
| role        | admin/customer |                  |
| created_at  | timestamp   |                      |

### **Vehicles Table**
| Field              | Type        | Notes                |
|--------------------|-------------|----------------------|
| id                 | SERIAL PK   |                      |
| vehicle_name       | TEXT        | NOT NULL             |
| type               | car/bike/van/SUV |               |
| registration_number| TEXT UNIQUE |                      |
| daily_rent_price   | NUMERIC     |                      |
| availability_status| available/booked |               |
| created_at         | timestamp   |                      |

### **Bookings Table**
| Field            | Type        | Notes                |
|------------------|-------------|----------------------|
| id               | SERIAL PK   |                      |
| customer_id      | FK users(id)|                      |
| vehicle_id       | FK vehicles(id) |                  |
| rent_start_date  | DATE        |                      |
| rent_end_date    | DATE        |                      |
| total_price      | NUMERIC     |                      |
| status           | active/cancelled/returned |        |
| created_at       | timestamp   |                      |

---
### **Env file**

```
.env



PORT=PortNumber

DATABASE_URL=pastUrl_here

JWT_SECRET=JWT_SECRET
JWT_EXPIRES_IN=JWT_EXPIRES_IN

```
### ***Setup & Usage Instructions***

```

1. git clone https://github.com/Shohel-Raj/DriveHub-server

2. npm i

3. npm run dev

```