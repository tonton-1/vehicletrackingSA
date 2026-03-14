const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3308,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "fleet_db",
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to the MySQL database.");

    // Create vehicles table (if it doesn't exist)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plate VARCHAR(255) NOT NULL,
        driver VARCHAR(255) NOT NULL,
        driver_phone VARCHAR(50) DEFAULT '',
        brand VARCHAR(255) DEFAULT '',
        model VARCHAR(255) DEFAULT '',
        vehicle_type VARCHAR(100) DEFAULT '',
        fuel_capacity INT DEFAULT 0,
        gps_imei VARCHAR(50) DEFAULT '',
        sim_card VARCHAR(50) DEFAULT '',
        lat DECIMAL(10, 6) NOT NULL,
        lng DECIMAL(10, 6) NOT NULL,
        speed INT NOT NULL,
        engineOn BOOLEAN NOT NULL,
        current_mileage INT DEFAULT 0,
        last_maintenance_date DATE NULL,
        maintenance_notes TEXT
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Create trips table (if it doesn't exist)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        timestamp DATETIME NOT NULL,
        lat DECIMAL(10, 6) NOT NULL,
        lng DECIMAL(10, 6) NOT NULL,
        speed INT NOT NULL,
        location VARCHAR(255),
        status VARCHAR(255),
        alert VARCHAR(255),
        FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Create settings table (if it doesn't exist)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value VARCHAR(255) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // Check if settings table is empty, if so, populate it
    const [settingsRows] = await connection.execute(
      "SELECT COUNT(*) as count FROM settings",
    );
    if (settingsRows[0].count === 0) {
      console.log("Inserting default settings...");
      const insertSettingSql =
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)";
      await connection.execute(insertSettingSql, ["speed_limit", "80"]);
      await connection.execute(insertSettingSql, ["idle_time_limit", "15"]);
    }

    // Check if vehicles table is empty, if so, populate it
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM vehicles",
    );

    if (rows[0].count === 0) {
      console.log("Inserting mock vehicles...");

      const insertVehicleSql =
        "INSERT INTO vehicles (id, plate, driver, driver_phone, brand, model, vehicle_type, fuel_capacity, gps_imei, sim_card, lat, lng, speed, engineOn, current_mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      await connection.execute(insertVehicleSql, [
        1,
        "กท 1234",
        "นายสมชาย วงศ์สวัสดิ์",
        "0812345678",
        "Toyota",
        "Hilux Revo",
        "pickup",
        80,
        "123456789012345",
        "0812345678",
        13.7563,
        100.5018,
        60,
        true,
        45000,
      ]);
      await connection.execute(insertVehicleSql, [
        2,
        "1กข 5678",
        "นายประเสริฐ ใจดี",
        "0823456789",
        "Isuzu",
        "D-Max",
        "pickup",
        75,
        "123456789012346",
        "0823456789",
        13.765,
        100.53,
        85,
        true,
        30000,
      ]);
      await connection.execute(insertVehicleSql, [
        3,
        "นข 9876",
        "นายวิชัย รักษาชล",
        "0834567890",
        "Mitsubishi",
        "Triton",
        "pickup",
        65,
        "123456789012347",
        "0834567890",
        13.73,
        100.52,
        0,
        true,
        20000,
      ]);
      await connection.execute(insertVehicleSql, [
        4,
        "80-4321",
        "นายสุรชัย มั่นคง",
        "0845678901",
        "Hino",
        "FC9J",
        "truck",
        200,
        "123456789012348",
        "0845678901",
        14.023601874649227,
        99.99987299009305,
        60,
        false,
        80000,
      ]);

      // Generate and insert mock trip data for vehicle 1
      console.log("Inserting mock trips...");
      await insertMockTrips(connection);
    } else {
      console.log("Database already populated.");
    }

    connection.release();
  } catch (error) {
    console.error("Error initializing database:", error);
    // Allow the server to keep running, it will retry connecting on next request
  }
}

async function insertMockTrips(connection) {
  const insertTripSql =
    "INSERT INTO trips (vehicle_id, timestamp, lat, lng, speed, location, status, alert) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  const startTime = new Date();
  startTime.setHours(8, 0, 0, 0); // Start at 08:00 today

  const waypoints = [
    { lat: 13.7563, lng: 100.5018, location: "กรุงเทพมหานคร" },
    { lat: 13.85, lng: 100.52, location: "ปทุมธานี" },
    { lat: 14.05, lng: 100.54, location: "พระนครศรีอยุธยา" },
    { lat: 14.3532, lng: 100.5698, location: "อยุธยา" },
    { lat: 14.88, lng: 100.41, location: "สระบุรี" },
    { lat: 15.2286, lng: 100.2644, location: "นครสวรรค์" },
  ];

  let currentTime = new Date(startTime);

  // Create trips for vehicle 1
  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];
    const steps = 20;

    for (let j = 0; j <= steps; j++) {
      const progress = j / steps;
      const lat = start.lat + (end.lat - start.lat) * progress;
      const lng = start.lng + (end.lng - start.lng) * progress;

      let speed = 60 + Math.random() * 30;
      let status = "กำลังเดินทาง";
      let alert = "";

      if (Math.random() > 0.85) {
        speed = 90 + Math.random() * 20;
        status = "ขับเร็วเกินกำหนด";
        alert = "warning";
      } else if (Math.random() > 0.9 && j > 0) {
        speed = 0;
        status = "จอดพัก";
        alert = "idle";
        currentTime.setMinutes(currentTime.getMinutes() + 15);
      }

      const location =
        j === 0 ? start.location : j === steps ? end.location : "";

      // Formatting date to MySQL datetime format: YYYY-MM-DD HH:MM:SS
      const mysqlDate = currentTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      await connection.execute(insertTripSql, [
        1,
        mysqlDate,
        lat,
        lng,
        Math.round(speed),
        location,
        status,
        alert,
      ]);

      currentTime.setMinutes(currentTime.getMinutes() + 2);
    }
  }
  console.log("Mock trips insertion finished.");
}

// Call initDb on startup
initDb();

module.exports = pool;
