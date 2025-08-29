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
router.get("/:id", getProductById);   //  Get One
router.get("/:brand/:brandId", getProductByBrandId);   
router.get("/:brand/:brandId/:partCategoryId", getProductByPartCategoryId);   
router.put("/:id", updateProduct);    //  Update
router.delete("/:id", deleteProduct); //  Delete

export default router;
