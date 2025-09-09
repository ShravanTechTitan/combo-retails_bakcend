// routes/sitemap.js
import express from "express";
import Product from "../models/Product.js"; 
import Brand from "../models/Brand.js";
import Model from "../models/Model.js";
import PartCategory from "../models/PartCategory.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "https://universalcombo.com";

    // Static URLs (public only)
    const staticUrls = [
      "/",
      "/login",
      "/subscribe",
    ];

    // Fetch products, brands, models, partCategories
    const products = await Product.find().select("_id");
    const brands = await Brand.find().select("name _id");
    const models = await Model.find().select("name _id brandId");
    const parts = await PartCategory.find().select("name _id");

    // Static URLs
    let urls = staticUrls.map(
      (path) => `<url><loc>${baseUrl}${path}</loc></url>`
    );

    // Products
    products.forEach((p) => {
      urls.push(`<url><loc>${baseUrl}/product/${p._id}</loc></url>`);
    });

    // Models (brand wise)
    brands.forEach((b) => {
      urls.push(`<url><loc>${baseUrl}/models/${encodeURIComponent(b.name)}/${b._id}</loc></url>`);
    });

    // Model + PartCategory combos
    models.forEach((m) => {
      parts.forEach((pc) => {
        urls.push(
          `<url><loc>${baseUrl}/models/${encodeURIComponent(
            m.name
          )}/${m._id}/${encodeURIComponent(pc.name)}/${pc._id}</loc></url>`
        );
      });
    });

    // Combos (example if you have model-product combo)
    models.forEach((m) => {
      products.forEach((p) => {
        urls.push(`<url><loc>${baseUrl}/combo/${p._id}/${m._id}</loc></url>`);
      });
    });

    // Final XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.join("\n")}
    </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    console.error("Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
