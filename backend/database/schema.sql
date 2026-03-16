SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS orphan_requests;
DROP TABLE IF EXISTS care_requests;
DROP TABLE IF EXISTS ngo_profiles;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
  id         INT NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('elder','caretaker','ngo','admin','orphan') NOT NULL,
  status     ENUM('pending','approved','rejected') DEFAULT 'pending',
  phone      VARCHAR(20),
  address    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OTP
CREATE TABLE otps (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(100) NOT NULL,
  otp        VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CARE REQUESTS
CREATE TABLE care_requests (
  id          INT NOT NULL AUTO_INCREMENT,
  user_id     INT NOT NULL,
  elder_name  VARCHAR(100) NOT NULL,
  age         INT,
  location    VARCHAR(255),
  help_type   VARCHAR(100),
  description TEXT,
  priority    ENUM('LOW','MEDIUM','HIGH','SEVERE') DEFAULT 'LOW',
  status      ENUM('pending','approved','rejected','assigned','completed') DEFAULT 'pending',
  assigned_to INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ORPHAN REQUESTS
CREATE TABLE orphan_requests (
  id           INT NOT NULL AUTO_INCREMENT,
  user_id      INT NOT NULL,
  child_name   VARCHAR(100) NOT NULL,
  age          INT,
  guardian     VARCHAR(100),
  support_types JSON,
  description  TEXT,
  status       ENUM('pending','approved','rejected','assigned','completed') DEFAULT 'pending',
  assigned_ngo INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_ngo) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NGO PROFILES (extra info submitted at NGO registration)
CREATE TABLE ngo_profiles (
  id              INT NOT NULL AUTO_INCREMENT,
  user_id         INT NOT NULL UNIQUE,
  organization    VARCHAR(200) NOT NULL,
  registration_no VARCHAR(100),
  focus_area      VARCHAR(255),
  website         VARCHAR(255),
  phone           VARCHAR(20),
  address         TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Admin seed (password: Admin@123)
INSERT INTO users (name, email, password, role, status) VALUES
('Admin', 'admin@careconnect.com',
 '$2b$10$rBjDW.R3Ef3bEpKU5Qs3LOIbFzZPvj9kD4HvS7PagPVqPV55lxhyK',
 'admin', 'approved');
