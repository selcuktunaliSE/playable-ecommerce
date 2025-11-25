import { Router } from "express";
import { getAdminDashboard } from "../controllers/adminDashboardController";
import { auth,requireAdmin } from "../middleware/auth";

const router = Router();

router.use(auth,requireAdmin);

router.get("/", getAdminDashboard);

export default router;
