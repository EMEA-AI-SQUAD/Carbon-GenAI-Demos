-- PostgreSQL init script — creates separate databases for extract and translate services
-- Runs once on first container startup (placed in /docker-entrypoint-initdb.d/)

-- The main DB (dgpci) is created automatically by POSTGRES_DB env var.
-- We create the two service databases here.

CREATE DATABASE extract_db;
CREATE DATABASE translate_db;

-- Grant the shared user access to both
GRANT ALL PRIVILEGES ON DATABASE extract_db  TO dgpci;
GRANT ALL PRIVILEGES ON DATABASE translate_db TO dgpci;
