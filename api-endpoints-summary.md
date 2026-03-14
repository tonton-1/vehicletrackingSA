# 📡 สรุป API Endpoints ในระบบติดตามยานพาหนะ

ระบบนี้มีการใช้งาน API 2 ส่วนหลักคือ **Internal API (ระบบเราเขียนเอง)** และ **External API (ระบบภายนอก)** เพื่อให้ทำงานร่วมกันได้อย่างสมบูรณ์

---

## 1️⃣ Internal API (สร้างด้วย Node.js + Express)
API ส่วนนี้ทำหน้าที่เชื่อมต่อไปยังฐานข้อมูล MySQL (`fleet_db`) เพื่อจัดการข้อมูลต่างๆ:

### 🚗 หมวดจัดการยานพาหนะ (Vehicles)
- **`GET /api/vehicles`**
  - **หน้าที่:** ดึงข้อมูลรถยนต์ *ทั้งหมด* ในระบบ (รวมถึงสถานะปัจจุบัน, ความเร็ว, พิกัด)
  - **หน้าจอที่ใช้:** [index.html](file:///e:/vehicletrackingSA/index.html) (แดชบอร์ด), [vehicle-management.html](file:///e:/vehicletrackingSA/vehicle-management.html) (หน้าจัดการรถ)

- **`GET /api/vehicles/:id`**
  - **หน้าที่:** ดึงข้อมูลรถยนต์ *เฉพาะคัน* ที่ระบุด้วย ID
  - **หน้าจอที่ใช้:** [vehicle-management.html](file:///e:/vehicletrackingSA/vehicle-management.html) (ตอนกดปุ่ม "แก้ไข" เพื่อดึงข้อมูลเดิมมาใส่ฟอร์ม)

- **`POST /api/vehicles`**
  - **หน้าที่:** เพิ่มข้อมูลรถยนต์ *คันใหม่* เข้าสู่ฐานข้อมูล
  - **หน้าจอที่ใช้:** [vehicle-management.html](file:///e:/vehicletrackingSA/vehicle-management.html) (ตอนกดยืนยันบันทึกรถคันใหม่)

- **`PUT /api/vehicles/:id`**
  - **หน้าที่:** แก้ไขและอัปเดตข้อมูลรถยนต์คันเดิมตาม ID
  - **หน้าจอที่ใช้:** [vehicle-management.html](file:///e:/vehicletrackingSA/vehicle-management.html) (ตอนกดบันทึกหลังจากแก้ไขข้อมูลเสร็จ)

- **`DELETE /api/vehicles/:id`**
  - **หน้าที่:** ลบรถและประวัติการเดินทางของรถคันนั้นๆ ออกจากระบบอย่างถาวร
  - **หน้าจอที่ใช้:** [vehicle-management.html](file:///e:/vehicletrackingSA/vehicle-management.html) (ตอนกดยืนยันการลบรถ)

### 🗺️ หมวดประวัติการเดินทาง (Trips)
- **`GET /api/trips`**
  - **พารามิเตอร์ที่รับ:** `vehicleId`, `startDate`, `endDate`
  - **หน้าที่:** ค้นหาประวัติการเดินทางของรถที่เลือก ในช่วงวันที่กำหนด
  - **หน้าจอที่ใช้:** [trip-history.html](file:///e:/vehicletrackingSA/trip-history.html) (ใช้ดึงข้อมูลมาวาดเทรคกิ้งลงบนแผนที่และคำนวณสถิติระยะทาง/ความเร็ว)

### ⚙️ หมวดการตั้งค่า (Settings)
- **`GET /api/settings`**
  - **หน้าที่:** ดึงค่าขีดจำกัดความเร็ว (Speed Limit) และเวลาจอดแช่ (Idle Time) ปัจจุบัน
  - **หน้าจอที่ใช้:** [settings.html](file:///e:/vehicletrackingSA/settings.html) (แสดงค่าเดิมตอนเปิดหน้าต่าง), [index.html](file:///e:/vehicletrackingSA/index.html) (ดึงไปคำนวณสร้างป้ายสถานะแจ้งเตือนพฤติกรรมคนขับ)

- **`POST /api/settings`**
  - **หน้าที่:** บันทึก หรืออัปเดตค่าการตั้งค่าใหม่ทับของเดิมลงฐานข้อมูล
  - **หน้าจอที่ใช้:** [settings.html](file:///e:/vehicletrackingSA/settings.html) (ตอนกดปุ่มเซฟการตั้งค่าใหม่)

---

## 2️⃣ External API (API ระบบภายนอก)

เนื่องจากระบบเรามีแค่พิกัดละติจูด-ลองจิจูด แต่ไม่มีชื่อสถานที่ เราจึงเรียกใช้บริการแผนที่ฟรีเพื่อช่วยแปลงข้อมูลให้ผู้ใช้งานอ่านง่ายขึ้น:

### 🌍 ระบบแปลงพิกัดเป็นสถานที่ (Reverse Geocoding)
- **URL:** `https://nominatim.openstreetmap.org/reverse`
  - **หลักการทำงาน:** นำค่าละติจูดและลองจิจูด (Lat, Lng) ของรถคันนั้นๆ ส่งไปสอบถาม API ของ OpenStreetMap
  - **ผลลัพธ์ที่ได้คืนมา:** ข้อความอธิบายที่อยู่, ชื่อเมือง, หรือ **"จังหวัด"** (Province) ปัจจุบันที่รถคันนั้นกำลังอยู่
  - **หน้าจอที่ใช้:** ใช้ใน [index.html](file:///e:/vehicletrackingSA/index.html) เพื่อแสดงชื่อจังหวัดในตารางและบนป๊อปอัปแผนที่ 

---

## 🎯 สรุปเพื่อการนำเสนอ (Pitching)

> "ระบบของเราออกแบบเป็นสถาปัตยกรรมแบบ **Client-Server** ผ่านสถาปัตยกรรม **REST API** แบบเต็มรูปแบบครับ โดยแบ่งการทำงานชัดเจนระหว่าง Frontend (ตรรกะหน้าจอ) และ Backend (ตรวจสอบและเชื่อม DB) นอกจากนี้ ไม่ได้ใช้ทรัพยากรฐานข้อมูลทำงานหนักคนเดียว เรามีการดึง **External API** อย่าง **Nominatim ของ OpenStreetMap** มาทำ Reverse Geocoding แปลงพิกัด GPS กลับมาเป็นชื่อจังหวัดแบบเรียลไทม์ ทำให้ระบบสมบูรณ์และผู้ใช้เข้าใจข้อมูลได้ง่ายที่สุดครับ"
