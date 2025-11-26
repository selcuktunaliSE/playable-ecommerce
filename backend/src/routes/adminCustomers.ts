import { Router } from "express";
import { getCustomers, getCustomerDetails } from "../controllers/adminCustomersController";
import { auth,requireAdmin } from "../middleware/auth";

const router = Router();

router.use(auth,requireAdmin);

router.get("/", requireAdmin, getCustomers);
router.get("/:id", requireAdmin, getCustomerDetails);

export default router;