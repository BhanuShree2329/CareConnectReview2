const db = require("../config/db");

exports.createUser = (name, email, hashedPassword, role) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
};

exports.findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) reject(err); else resolve(results[0]);
    });
  });
};

exports.findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT id, name, email, role, status, phone, address, created_at FROM users WHERE id = ?", [id], (err, results) => {
      if (err) reject(err); else resolve(results[0]);
    });
  });
};

exports.getPendingUsers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name, email, role, status, created_at FROM users WHERE status = 'pending'",
      (err, results) => { if (err) reject(err); else resolve(results); }
    );
  });
};

exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, name, email, role, status, created_at FROM users",
      (err, results) => { if (err) reject(err); else resolve(results); }
    );
  });
};

exports.approveUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE users SET status = 'approved' WHERE id = ?", [id], (err, result) => {
      if (err) reject(err); else resolve(result);
    });
  });
};

exports.rejectUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE users SET status = 'rejected' WHERE id = ?", [id], (err, result) => {
      if (err) reject(err); else resolve(result);
    });
  });
};

// Get all approved NGOs (for "Link NGO" feature)
exports.getApprovedNGOs = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT u.id, u.name, u.email, u.created_at,
              n.organization, n.focus_area, n.website, n.phone, n.address
       FROM users u
       LEFT JOIN ngo_profiles n ON n.user_id = u.id
       WHERE u.role = 'ngo' AND u.status = 'approved'`,
      (err, results) => { if (err) reject(err); else resolve(results); }
    );
  });
};
