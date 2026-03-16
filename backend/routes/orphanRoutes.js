const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/orphanRequestController");
const { verifyToken } = require("../middleware/authMiddleware");
const { checkRole } = require("../middleware/roleMiddleware");

router.post("/orphan-requests", verifyToken, checkRole("orphan"), ctrl.submit);
router.get("/orphan-requests/mine", verifyToken, checkRole("orphan"), ctrl.mine);
router.get("/orphan-requests", verifyToken, checkRole("admin"), ctrl.all);
router.get("/orphan-requests/pending", verifyToken, checkRole("admin"), ctrl.pending);
router.get("/orphan-requests/approved", verifyToken, checkRole("ngo", "admin"), ctrl.approved);
router.get("/orphan-requests/ngo", verifyToken, checkRole("ngo"), ctrl.ngoRequests);
router.put("/orphan-requests/:id/approve", verifyToken, checkRole("admin"), ctrl.approve);
router.put("/orphan-requests/:id/reject", verifyToken, checkRole("admin"), ctrl.reject);
router.put("/orphan-requests/:id/accept", verifyToken, checkRole("ngo"), ctrl.accept);
router.put("/orphan-requests/:id/assign-ngo", verifyToken, checkRole("admin"), ctrl.assignNgo);

module.exports = router;