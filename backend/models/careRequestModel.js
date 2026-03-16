const db = require("../config/db");

exports.createCareRequest = ({ userId, elderName, age, location, helpType, description, priority }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO care_requests (user_id, elder_name, age, location, help_type, description, priority) VALUES (?,?,?,?,?,?,?)",
      [userId, elderName, age, location, helpType, description, priority || "LOW"],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
};

exports.getCareRequestsByUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM care_requests WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, r) => {
      if (err) reject(err); else resolve(r);
    });
  });
};

exports.getAllCareRequests = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT cr.*, u.name AS user_name, u.email AS user_email
       FROM care_requests cr JOIN users u ON u.id = cr.user_id
       ORDER BY cr.created_at DESC`,
      (err, r) => { if (err) reject(err); else resolve(r); }
    );
  });
};

exports.getPendingCareRequests = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT cr.*, u.name AS user_name, u.email AS user_email
       FROM care_requests cr JOIN users u ON u.id = cr.user_id
       WHERE cr.status = 'pending' ORDER BY cr.created_at DESC`,
      (err, r) => { if (err) reject(err); else resolve(r); }
    );
  });
};

exports.updateCareRequestStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE care_requests SET status = ? WHERE id = ?", [status, id], (err, r) => {
      if (err) reject(err); else resolve(r);
    });
  });
};

exports.assignCareRequest = (id, caretakerId) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE care_requests SET status = 'assigned', assigned_to = ? WHERE id = ?", [caretakerId, id], (err, r) => {
      if (err) reject(err); else resolve(r);
    });
  });
};

exports.getApprovedCareRequests = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT cr.*, u.name AS user_name, u.email AS user_email
       FROM care_requests cr JOIN users u ON u.id = cr.user_id
       WHERE cr.status = 'approved' ORDER BY cr.priority DESC, cr.created_at ASC`,
      (err, r) => { if (err) reject(err); else resolve(r); }
    );
  });
};
