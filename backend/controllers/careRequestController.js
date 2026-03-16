const db = require("../config/db");

exports.submit = (req, res) => {
  try {
    const { age, location, helpType, description } = req.body;
    const userId = req.user.id;

    if (!age || !location || !helpType || !description) {
      return res.status(400).json({
        message: "age, location, helpType and description are required",
      });
    }

    const numericAge = Number(age);

    if (isNaN(numericAge) || numericAge < 40 || numericAge > 120) {
      return res.status(400).json({
        message: "Age must be between 40 and 120",
      });
    }

    const sql = `
      INSERT INTO care_requests
      (elder_id, age, help_type, description, location, status, user_id)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `;

    db.query(
      sql,
      [userId, numericAge, helpType, description, location, userId],
      (err, result) => {
        if (err) {
          console.error("Create care request error:", err);
          return res.status(500).json({
            message: "Failed to create care request",
            error: err.message,
          });
        }

        return res.status(201).json({
          message: "Care request submitted successfully",
          id: result.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Submit care request catch error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.myRequests = (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT id, elder_id, age, help_type, description, location, status, created_at, user_id
      FROM care_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Fetch my requests error:", err);
        return res.status(500).json({
          message: "Failed to fetch requests",
          error: err.message,
        });
      }

      return res.json(results);
    });
  } catch (error) {
    console.error("myRequests catch error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.approved = (req, res) => {
  const sql = `
    SELECT *
    FROM care_requests
    WHERE status = 'approved'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch approved requests error:", err);
      return res.status(500).json({
        message: "Failed to fetch approved requests",
        error: err.message,
      });
    }

    return res.json(results);
  });
};

exports.pending = (req, res) => {
  const sql = `
    SELECT *
    FROM care_requests
    WHERE status = 'pending'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch pending requests error:", err);
      return res.status(500).json({
        message: "Failed to fetch pending requests",
        error: err.message,
      });
    }

    return res.json(results);
  });
};

exports.all = (req, res) => {
  const sql = `
    SELECT *
    FROM care_requests
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch all requests error:", err);
      return res.status(500).json({
        message: "Failed to fetch all requests",
        error: err.message,
      });
    }

    return res.json(results);
  });
};

exports.approve = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE care_requests SET status = 'approved' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Approve request error:", err);
        return res.status(500).json({
          message: "Failed to approve request",
          error: err.message,
        });
      }

      return res.json({ message: "Care request approved successfully" });
    }
  );
};

exports.reject = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE care_requests SET status = 'rejected' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Reject request error:", err);
        return res.status(500).json({
          message: "Failed to reject request",
          error: err.message,
        });
      }

      return res.json({ message: "Care request rejected successfully" });
    }
  );
};

exports.accept = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE care_requests SET status = 'assigned' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Accept request error:", err);
        return res.status(500).json({
          message: "Failed to accept request",
          error: err.message,
        });
      }

      return res.json({ message: "Care request accepted successfully" });
    }
  );
};

exports.complete = (req, res) => {
  const { id } = req.params;

  db.query(
    "UPDATE care_requests SET status = 'completed' WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Complete request error:", err);
        return res.status(500).json({
          message: "Failed to complete request",
          error: err.message,
        });
      }

      return res.json({ message: "Care request marked as completed" });
    }
  );
};