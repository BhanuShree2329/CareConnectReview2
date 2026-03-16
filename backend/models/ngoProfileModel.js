const db = require("../config/db");

exports.createNGOProfile = ({ userId, organization, registrationNo, focusArea, website, phone, address }) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO ngo_profiles (user_id, organization, registration_no, focus_area, website, phone, address) VALUES (?,?,?,?,?,?,?)",
      [userId, organization, registrationNo, focusArea, website, phone, address],
      (err, result) => { if (err) reject(err); else resolve(result); }
    );
  });
};

exports.getNGOProfile = (userId) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM ngo_profiles WHERE user_id = ?", [userId], (err, r) => {
      if (err) reject(err); else resolve(r[0]);
    });
  });
};
