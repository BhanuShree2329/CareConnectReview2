const db = require("../config/db");

exports.createOrphanRequest = ({ userId, childName, age, guardian, supportTypes, description }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO orphan_requests (user_id, child_name, age, guardian, support_types, description) VALUES (?,?,?,?,?,?)",
      [userId, childName, age, guardian, JSON.stringify(supportTypes), description],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
};

exports.getOrphanRequestsByUser = (userId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM orphan_requests WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, r) => {
      if (err) reject(err); else resolve(r.map(parseJson));
    });
  });
};

exports.getAllOrphanRequests = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orphan_requests o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`,
      (err, r) => { if (err) reject(err); else resolve(r.map(parseJson)); }
    );
  });
};

exports.getPendingOrphanRequests = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orphan_requests o JOIN users u ON u.id = o.user_id
       WHERE o.status = 'pending' ORDER BY o.created_at DESC`,
      (err, r) => { if (err) reject(err); else resolve(r.map(parseJson)); }
    );
  });
};

exports.updateOrphanRequestStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE orphan_requests SET status = ? WHERE id = ?", [status, id], (err, r) => {
      if (err) reject(err); else resolve(r);
    });
  });
};

exports.assignOrphanRequest = (id, ngoId) => {
  return new Promise((resolve, reject) => {
    db.query("UPDATE orphan_requests SET status = 'assigned', assigned_ngo = ? WHERE id = ?", [ngoId, id], (err, r) => {
      if (err) reject(err); else resolve(r);
    });
  });
};

exports.getApprovedOrphanRequests = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orphan_requests o JOIN users u ON u.id = o.user_id
       WHERE o.status = 'approved' ORDER BY o.created_at ASC`,
      (err, r) => { if (err) reject(err); else resolve(r.map(parseJson)); }
    );
  });
};

exports.getNGOOrphanRequests = (ngoId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT o.*, u.name AS user_name FROM orphan_requests o
       JOIN users u ON u.id = o.user_id
       WHERE o.assigned_ngo = ? OR o.status = 'approved'
       ORDER BY o.created_at DESC`,
      [ngoId],
      (err, r) => { if (err) reject(err); else resolve(r.map(parseJson)); }
    );
  });
};

function parseJson(r) {
  try { r.support_types = typeof r.support_types === "string" ? JSON.parse(r.support_types) : r.support_types; } catch {}
  return r;
}
