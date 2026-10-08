import { Router } from "express";
import productRoutes from "./products.routes.ts";

const router = Router();

router.use("/api/v1/products", productRoutes);

export default router;