import express from "express";
import Product from "../models/Product.js";
import Brand from "../models/Brand.js";
import Model from "../models/Model.js";

const router = express.Router();

// Generic Search API
router.get("/search", async (req, res) => {
  try {
    const { q, type } = req.query; // q = search text, type = "product" | "brand" | "model"

    if (!q) return res.json([]);

    let results = [];

    switch (type) {
      case "product":
        results = await Product.find({
          name: { $regex: q, $options: "i" }
        }).limit(10);
        break;

      case "brand":
        results = await Brand.find({
          name: { $regex: q, $options: "i" }
        }).limit(10);
        break;

      case "model":
        results = await Model.find({
          name: { $regex: q, $options: "i" }
        }).limit(10);
        break;

      default:
        // default → all combined
        const products = await Product.find({ name: { $regex: q, $options: "i" } }).limit(5);
        const brands = await Brand.find({ name: { $regex: q, $options: "i" } }).limit(5);
        const models = await Model.find({ name: { $regex: q, $options: "i" } }).limit(5);
        results = [...products, ...brands, ...models];
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
