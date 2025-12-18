//src/routes/productRoutes.js
import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  getProductByBrandId,
  getProductByPartCategoryId,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", createProduct);      //  Create
router.get("/", getProducts);         //  Get All
// ⚠️ Specific routes must come before generic :id route
router.get("/:brand/:brandId/:partCategoryId", getProductByPartCategoryId);   
router.get("/:brand/:brandId", getProductByBrandId);   
router.get("/:id", getProductById);   //  Get One
router.put("/:id", updateProduct);    //  Update
router.delete("/:id", deleteProduct); //  Delete

export default router;
