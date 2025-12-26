// routes/sitemapRoutes.js
import express from "express";
import Blog from "../models/Blog.js";
import Product from "../models/Product.js";

const router = express.Router();

// Generate sitemap.xml
router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || "https://www.universalcombo.com";
    
    const blogs = await Blog.find({ isActive: true }).select("_id");
    const products = await Product.find().select("_id").limit(1000); // Limit for performance
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
    
    blogs.forEach((blog) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/blog/${blog._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
    
    products.forEach((product) => {
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });
    
    sitemap += `
</urlset>`;
    
    res.setHeader("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate robots.txt
router.get("/robots.txt", (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || "https://www.universalcombo.com";
  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /login
Disallow: /profile

Sitemap: ${baseUrl}/sitemap.xml`;
  
  res.setHeader("Content-Type", "text/plain");
  res.send(robots);
});

export default router;

