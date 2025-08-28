import express from "express";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.post("/", createBrand);      // Create
router.get("/", getBrands);         // Get All
router.get("/:id", getBrandById);   // Get One
router.put("/:id", updateBrand);    // Update
router.delete("/:id", deleteBrand); // Delete

export default router;
