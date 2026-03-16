const db = require("../config/db");

exports.submit = (req, res) => {
  try {
    const { childName, age, guardian, supportTypes, description } = req.body;
    const userId = req.user.id;

    if (!childName || !age || !supportTypes || !description) {
      return res.status(400).json({
        message: "childName, age, supportTypes and description are required",
      });
    }

    const numericAge = Number(age);

    if (isNaN(numericAge) || numericAge < 0 || numericAge > 18) {
      return res.status(400).json({
        message: "Age must be between 0 and 18",
      });
    }

    const supportTypesString = Array.isArray(supportTypes)
      ? supportTypes.join(",")
      : String(supportTypes);

    const sql = `
      INSERT INTO orphan_requests
      (user_id, child_name, age, guardian, support_types, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(
      sql,
      [userId, childName, numericAge, guardian || null, supportTypesString, description],
      (err, result) => {
        if (err) {
          console.error("Create orphan request error:", err);
          return res.status(500).json({
            message: "Failed to create orphan request",
            error: err.message,
          });
        }

        return res.status(201).json({
          message: "Orphan request submitted successfully",
          id: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Submit orphan request catch error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.mine = (req, res) => {
  const userId = req.user.id;

  db.query(
    `SELECT * FROM orphan_requests WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Fetch my orphan requests error:", err);
        return res.status(500).json({
          message: "Failed to fetch orphan requests",
          error: err.message,
        });
      }

      return res.json(results);
    }
  );
};

exports.all = (req, res) => {
  db.query(
    `SELECT * FROM orphan_requests ORDER BY created_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Fetch all orphan requests error:", err);
        return res.status(500).json({
          message: "Failed to fetch orphan requests",
          error: err.message,
        });
      }

      return res.json(results);
    }
  );
};

exports.pending = (req, res) => {
  db.query(
    `SELECT * FROM orphan_requests WHERE status = 'pending' ORDER BY created_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Fetch pending orphan requests error:", err);
        return res.status(500).json({
          message: "Failed to fetch pending orphan requests",
          error: err.message,
        });
      }

      return res.json(results);
    }
  );
};

exports.approved = (req, res) => {
  db.query(
    `SELECT * FROM orphan_requests WHERE status = 'approved' ORDER BY created_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Fetch approved orphan requests error:", err);
        return res.status(500).json({
          message: "Failed to fetch approved orphan requests",
          error: err.message,
        });
      }

      return res.json(results);
    }
  );
};

exports.ngoRequests = (req, res) => {
  const ngoId = req.user.id;

  db.query(
    `SELECT * FROM orphan_requests WHERE assigned_ngo_id = ? ORDER BY created_at DESC`,
    [ngoId],
    (err, results) => {
      if (err) {
        console.error("Fetch NGO orphan requests error:", err);
        return res.status(500).json({
          message: "Failed to fetch NGO orphan requests",
          error: err.message,
        });
      }

      return res.json(results);
    }
  );
};

exports.approve = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE orphan_requests SET status = 'approved' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Approve orphan request error:", err);
        return res.status(500).json({
          message: "Failed to approve orphan request",
          error: err.message,
        });
      }

      return res.json({ message: "Orphan request approved successfully" });
    }
  );
};

exports.reject = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE orphan_requests SET status = 'rejected' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Reject orphan request error:", err);
        return res.status(500).json({
          message: "Failed to reject orphan request",
          error: err.message,
        });
      }

      return res.json({ message: "Orphan request rejected successfully" });
    }
  );
};

exports.accept = (req, res) => {
  const { id } = req.params;
  const ngoId = req.user.id;

  db.query(
    `UPDATE orphan_requests SET status = 'assigned', assigned_ngo_id = ? WHERE id = ?`,
    [ngoId, id],
    (err) => {
      if (err) {
        console.error("Accept orphan request error:", err);
        return res.status(500).json({
          message: "Failed to accept orphan request",
          error: err.message,
        });
      }

      return res.json({ message: "Orphan request accepted successfully" });
    }
  );
};

exports.assignNgo = (req, res) => {
  const { id } = req.params;
  const { ngoId } = req.body;

  if (!ngoId) {
    return res.status(400).json({ message: "ngoId is required" });
  }

  db.query(
    `UPDATE orphan_requests SET assigned_ngo_id = ? WHERE id = ?`,
    [ngoId, id],
    (err) => {
      if (err) {
        console.error("Assign NGO error:", err);
        return res.status(500).json({
          message: "Failed to assign NGO",
          error: err.message,
        });
      }

      return res.json({ message: "NGO assigned successfully" });
    }
  );
};