-- Run this as the postgres superuser to create the database and user
-- psql -U postgres -f setup_db.sql

-- Create user
CREATE USER studentos_user WITH PASSWORD 'StudentOS_DB_2026!';

-- Create database
CREATE DATABASE studentos_db OWNER studentos_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE studentos_db TO studentos_user;

-- Connect to the database and grant schema privileges
\c studentos_db
GRANT ALL ON SCHEMA public TO studentos_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO studentos_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO studentos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO studentos_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO studentos_user;
