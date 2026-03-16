const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/careRequestController");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

router.post("/care-requests", verifyToken, checkRole("elder"), ctrl.submit);
router.get("/care-requests/mine", verifyToken, checkRole("elder"), ctrl.myRequests);
router.get("/care-requests/approved", verifyToken, checkRole("caretaker", "admin"), ctrl.approved);
router.get("/care-requests/pending", verifyToken, checkRole("admin"), ctrl.pending);
router.get("/care-requests", verifyToken, checkRole("admin"), ctrl.all);
router.put("/care-requests/:id/approve", verifyToken, checkRole("admin"), ctrl.approve);
router.put("/care-requests/:id/reject", verifyToken, checkRole("admin"), ctrl.reject);
router.put("/care-requests/:id/accept", verifyToken, checkRole("caretaker"), ctrl.accept);
router.put("/care-requests/:id/complete", verifyToken, checkRole("caretaker"), ctrl.complete);

module.exports = router;