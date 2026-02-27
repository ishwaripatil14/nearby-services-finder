-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable PostGIS Geography support
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- The tables will be created by SQLAlchemy automagically if main.py is run.
-- But if you want to see the manual SQL for the services table:
/*
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rating FLOAT,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_location ON services USING GIST (location);
*/

-- Sample Admin User (SQL version, though the app seeds this automatically)
-- Password for hash: admin123 (bcrypt)
/*
INSERT INTO users (username, hashed_password) 
VALUES ('admin', '$2b$12$6/tI.v1Nqf9XJ.y2N5s6E.qE7U.9/0M.o6lI.v1Nqf9XJ.y2N5s6E');
*/
