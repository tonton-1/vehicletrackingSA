# vehicletrackingSA

A web-based vehicle tracking system with a dashboard, vehicle management, trip history, and login page. The project uses Node.js, Express, and MySQL.

## Tech Stack

- Node.js
- Express
- MySQL 8
- Docker Compose
- Tailwind CSS
- Leaflet

## Main Project Files

- `server.js` Express server and REST API
- `database.js` MySQL connection and mock data initialization
- `index.html` Main dashboard page
- `vehicle-management.html` Vehicle management page
- `trip-history.html` Trip history page
- `login.html` Login page
- `docker-compose.yml` MySQL and phpMyAdmin services

## Requirements

- Node.js 18 or later
- Docker Desktop

## Installation

Install dependencies:

```bash
npm install
```

Start MySQL and phpMyAdmin:

```bash
docker-compose up -d
```

## Run the Project

Start the server:

```bash
node server.js
```

Then open:

- Main app: http://localhost:3000/login.html
- phpMyAdmin: http://localhost:8081

Default database settings:

- Host: `localhost`
- Port: `3308`
- User: `root`
- Password: `root`
- Database: `fleet_db`

## Demo Login

- Username: `admin`
- Password: `1234`

## Main Features

- View an overview of vehicles on the dashboard
- Add and edit vehicle information
- View trip history for each vehicle
- Display maps using Leaflet
- Use mock data for testing and demonstration

## Main API Endpoints

- `GET /api/vehicles` Get all vehicles
- `GET /api/vehicles/:id` Get vehicle details by ID
- `POST /api/vehicles` Create a new vehicle
- `PUT /api/vehicles/:id` Update a vehicle
- `GET /api/trips?vehicleId=<id>&startDate=<YYYY-MM-DD>&endDate=<YYYY-MM-DD>` Get trip history

## Important Note

On startup, `database.js` drops the `vehicles` and `trips` tables and recreates them with mock data to reset encoding and initial records. This means any manually added data will be lost every time the server restarts.

If you want to use this project beyond demo purposes, update the initialization logic in `database.js` first.

## Suggested Improvements

- Add `start` and `dev` scripts to `package.json`
- Move login handling out of the frontend
- Separate CSS and JavaScript from the HTML files
- Update `database.js` so it does not reset data on every startup
