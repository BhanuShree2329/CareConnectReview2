const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  getApprovedNGOs,
} = require("../models/userModel");

// Auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

// Admin — user management
router.get("/users", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

router.get("/users/pending", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const users = await getPendingUsers();
    res.json(users);
  } catch (err) {
    console.error("Get pending users error:", err);
    res.status(500).json({ message: "Failed to fetch pending users", error: err.message });
  }
});

router.put("/users/:id/approve", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    await approveUser(req.params.id);
    res.json({ message: "User approved." });
  } catch (err) {
    console.error("Approve user error:", err);
    res.status(500).json({ message: "Failed to approve user", error: err.message });
  }
});

router.put("/users/:id/reject", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    await rejectUser(req.params.id);
    res.json({ message: "User rejected." });
  } catch (err) {
    console.error("Reject user error:", err);
    res.status(500).json({ message: "Failed to reject user", error: err.message });
  }
});

// Public — list approved NGOs
router.get("/ngos", async (req, res) => {
  try {
    const ngos = await getApprovedNGOs();
    res.json(ngos);
  } catch (err) {
    console.error("Get NGOs error:", err);
    res.status(500).json({ message: "Failed to fetch NGOs", error: err.message });
  }
});

module.exports = router;