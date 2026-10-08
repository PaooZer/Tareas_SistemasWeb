import { Router } from "express";
import { ProductController } from "../controllers/products.controller.ts";

const router = Router();
const productController = new ProductController();

router.get("/getAll", productController.getAllProducts);
router.get("/getById/:id", productController.getProductById);
router.post("/create", productController.createProduct);
router.put("/update/:id", productController.updateProductById);
router.delete("/delete/:id", productController.deleteProductById);
router.patch("/change-price/:id", productController.changeProductPrice);

export default router;