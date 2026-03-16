const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");
const { getPendingUsers, getAllUsers, approveUser, rejectUser, getApprovedNGOs } = require("../models/userModel");

// Auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

// Admin — user management
router.get("/users", verifyToken, checkRole("admin"), async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

router.get("/users/pending", verifyToken, checkRole("admin"), async (req, res) => {
  const users = await getPendingUsers();
  res.json(users);
});

router.put("/users/:id/approve", verifyToken, checkRole("admin"), async (req, res) => {
  await approveUser(req.params.id);
  res.json({ message: "User approved." });
});

router.put("/users/:id/reject", verifyToken, checkRole("admin"), async (req, res) => {
  await rejectUser(req.params.id);
  res.json({ message: "User rejected." });
});

// Public — list approved NGOs (used for "Link NGO" page)
router.get("/ngos", async (req, res) => {
  try {
    const ngos = await getApprovedNGOs();
    res.json(ngos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
