# vehicletrackingSA

ระบบติดตามรถยนต์แบบเว็บ ประกอบด้วยหน้าแดชบอร์ด, จัดการยานพาหนะ, ประวัติการเดินทาง และหน้าเข้าสู่ระบบ โดยใช้ Node.js, Express และ MySQL

## Tech Stack

- Node.js
- Express
- MySQL 8
- Docker Compose
- Tailwind CSS
- Leaflet

## โครงสร้างหลักของโปรเจกต์

- `server.js` เซิร์ฟเวอร์ Express และ REST API
- `database.js` การเชื่อมต่อ MySQL และสร้างข้อมูลตัวอย่าง
- `index.html` หน้าแดชบอร์ดหลัก
- `vehicle-management.html` หน้าจัดการยานพาหนะ
- `trip-history.html` หน้าประวัติการเดินทาง
- `login.html` หน้าเข้าสู่ระบบ
- `docker-compose.yml` สำหรับรัน MySQL และ phpMyAdmin

## สิ่งที่ต้องมี

- Node.js 18 ขึ้นไป
- Docker Desktop

## การติดตั้ง

ติดตั้ง dependencies:

```bash
npm install
```

เปิดฐานข้อมูล MySQL และ phpMyAdmin:

```bash
docker-compose up -d
```

## การรันโปรเจกต์

รันเซิร์ฟเวอร์:

```bash
node server.js
```

จากนั้นเปิดใช้งานที่:

- แอปหลัก: http://localhost:3000/login.html
- phpMyAdmin: http://localhost:8081

ข้อมูลฐานข้อมูลเริ่มต้น:

- Host: `localhost`
- Port: `3308`
- User: `root`
- Password: `root`
- Database: `fleet_db`

## บัญชีเข้าสู่ระบบตัวอย่าง

- Username: `admin`
- Password: `1234`

## ฟีเจอร์หลัก

- ดูภาพรวมรถในระบบบนหน้าแดชบอร์ด
- เพิ่มและแก้ไขข้อมูลยานพาหนะ
- ดูประวัติการเดินทางของรถแต่ละคัน
- ใช้งานแผนที่ด้วย Leaflet
- มีข้อมูลตัวอย่างสำหรับทดลองระบบ

## API หลัก

- `GET /api/vehicles` ดึงรายการรถทั้งหมด
- `GET /api/vehicles/:id` ดึงรายละเอียดรถตามรหัส
- `POST /api/vehicles` เพิ่มรถใหม่
- `PUT /api/vehicles/:id` แก้ไขข้อมูลรถ
- `GET /api/trips?vehicleId=<id>&startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>` ดึงประวัติการเดินทาง

## หมายเหตุสำคัญ

เมื่อเริ่มระบบ `database.js` จะลบตาราง `vehicles` และ `trips` แล้วสร้างใหม่พร้อมข้อมูลตัวอย่าง เพื่อรีเซ็ต encoding และข้อมูลเริ่มต้น ดังนั้นข้อมูลที่เพิ่มเองจะหายทุกครั้งที่รีสตาร์ตเซิร์ฟเวอร์

ถ้าต้องการใช้งานจริง ควรแก้ logic ใน `database.js` ก่อน

## การพัฒนาต่อ

แนวทางที่ควรทำต่อ:

- เพิ่ม script `start` และ `dev` ใน `package.json`
- ย้ายข้อมูล login ออกจาก frontend
- แยกไฟล์ CSS/JS ออกจาก HTML
- ปรับ `database.js` ไม่ให้ลบข้อมูลทุกครั้งที่เริ่มระบบ
