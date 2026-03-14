const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./database"); // This initializes the MySQL database

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// --- API Endpoints ---

// Get all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vehicles");
    // We need to map `engineOn` from tinyint (0/1) to boolean for frontend compatibility
    const mappedRows = rows.map((row) => ({
      ...row,
      engineOn: Boolean(row.engineOn),
    }));
    res.json(mappedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});

// Add new vehicle
app.post("/api/vehicles", async (req, res) => {
  const {
    licensePlate,
    driverName,
    driverPhone,
    brand,
    model,
    vehicleType,
    fuelCapacity,
    gpsImei,
    simCard,
    deviceStatus,
    currentMileage,
    lastMaintenanceDate,
    maintenanceNotes,
  } = req.body;

  if (!licensePlate || !driverName) {
    return res
      .status(400)
      .json({ error: "licensePlate and driverName are required" });
  }

  const engineOn = deviceStatus === "active";
  const lat = 13.7563;
  const lng = 100.5018;
  const speed = 0;

  try {
    const [result] = await pool.query(
      "INSERT INTO vehicles (plate, driver, driver_phone, brand, model, vehicle_type, fuel_capacity, gps_imei, sim_card, lat, lng, speed, engineOn, current_mileage, last_maintenance_date, maintenance_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        licensePlate,
        driverName,
        driverPhone || "",
        brand || "",
        model || "",
        vehicleType || "",
        fuelCapacity || 0,
        gpsImei || "",
        simCard || "",
        lat,
        lng,
        speed,
        engineOn,
        currentMileage || 0,
        lastMaintenanceDate || null,
        maintenanceNotes || "",
      ],
    );

    res.status(201).json({
      message: "Vehicle created successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create vehicle" });
  }
});

// Get trips for a specific vehicle with optional date filters
app.get("/api/trips", async (req, res) => {
  const { vehicleId, startDate, endDate } = req.query;

  if (!vehicleId) {
    return res.status(400).json({ error: "vehicleId is required" });
  }

  let sql = "SELECT * FROM trips WHERE vehicle_id = ?";
  let params = [vehicleId];

  if (startDate) {
    sql += " AND DATE(timestamp) >= ?";
    params.push(startDate);
  }
  if (endDate) {
    sql += " AND DATE(timestamp) <= ?";
    params.push(endDate);
  }

  sql += " ORDER BY timestamp ASC";

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// GET single vehicle details
app.get("/api/vehicles/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM vehicles WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    const vehicle = rows[0];
    vehicle.engineOn = Boolean(vehicle.engineOn);
    res.json(vehicle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vehicle" });
  }
});

// Update vehicle details
app.put("/api/vehicles/:id", async (req, res) => {
  const id = req.params.id;
  const {
    licensePlate,
    driverName,
    driverPhone,
    brand,
    model,
    vehicleType,
    fuelCapacity,
    gpsImei,
    simCard,
    deviceStatus,
    currentMileage,
    lastMaintenanceDate,
    maintenanceNotes,
  } = req.body;

  if (!licensePlate || !driverName) {
    return res
      .status(400)
      .json({ error: "licensePlate and driverName are required" });
  }

  const engineOn = deviceStatus === "active";

  try {
    const [result] = await pool.query(
      "UPDATE vehicles SET plate=?, driver=?, driver_phone=?, brand=?, model=?, vehicle_type=?, fuel_capacity=?, gps_imei=?, sim_card=?, engineOn=?, current_mileage=?, last_maintenance_date=?, maintenance_notes=? WHERE id=?",
      [
        licensePlate,
        driverName,
        driverPhone || "",
        brand || "",
        model || "",
        vehicleType || "",
        fuelCapacity || 0,
        gpsImei || "",
        simCard || "",
        engineOn,
        currentMileage || 0,
        lastMaintenanceDate || null,
        maintenanceNotes || "",
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json({ message: "Vehicle updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update vehicle" });
  }
});

// Delete vehicle
app.delete("/api/vehicles/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // 1. Delete associated trips first to avoid Foreign Key constraint errors
    await pool.query("DELETE FROM trips WHERE vehicle_id = ?", [id]);

    // 2. Delete the vehicle
    const [result] = await pool.query("DELETE FROM vehicles WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    res.json({ message: "Vehicle deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete vehicle" });
  }
});

// GET Settings
app.get("/api/settings", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings");
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// POST Settings
app.post("/api/settings", async (req, res) => {
  const settings = req.body;
  
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: "Invalid settings format" });
  }
  
  try {
    for (const [key, value] of Object.entries(settings)) {
      // Upsert: Insert or Update
      await pool.query(
        "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
        [key, value.toString()]
      );
    }
    
    res.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
