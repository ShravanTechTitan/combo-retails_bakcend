import Product from "../models/Product.js";

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const escapedQuery = escapeRegex(q);
    const regex = new RegExp(escapedQuery, "i");

    // Fetch all products + populate all models
  let products = await Product.find({})
    .populate({ path: "modelIds", select: "name" })
    .populate({ path: "partCategoryId", select: "name" }) // ✅ populate category
    .limit(50);
    

    // Filter products based on name OR model name
    products = products
      .map((p) => {
        const matchingModels = p.modelIds.filter((m) => regex.test(m.name));
        if (regex.test(p.name) || matchingModels.length > 0) {
          return {
            ...p.toObject(),
            modelIds: matchingModels, // only matching models
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
