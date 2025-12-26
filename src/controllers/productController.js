import Product from "../models/Product.js";

//  Create Product
export const createProduct = async (req, res) => {
  try {
    const { name, brandIds, modelIds, partCategoryId, price, description, tags } = req.body;

    if (!name || !brandIds || !partCategoryId || price == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.create({
      name,
      brandIds,
      partCategoryId,
      price,
      modelIds,
      description,
      tags, // ✅ new field
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Products
// Helper function for pagination
const paginate = (page = 1, limit = 10) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return { skip, limit: parseInt(limit) };
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search, brandId, categoryId } = req.query;
    const { skip, limit: limitNum } = paginate(page, limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (brandId) query.brandIds = brandId;
    if (categoryId) query.partCategoryId = categoryId;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("brandIds", "name")
        .populate("partCategoryId", "name")
        .populate("modelIds", "name")
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      products,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id)
      .populate("brandIds", "name")
      .populate("partCategoryId", "name icon")
      .populate("modelIds", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get Products by Brand ID
export const getProductByBrandId = async (req, res) => {
  try {
    const { brandId } = req.params;

    const products = await Product.find({ brandIds: brandId })
      .populate("brandIds", "name")
      .populate("partCategoryId", "name icon")
      .populate("modelIds", "name");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Products by Brand + Part Category
export const getProductByPartCategoryId = async (req, res) => {
  try {
    const { brandId, partCategoryId } = req.params;

    const products = await Product.find({ brandIds: brandId, partCategoryId })
      .populate("brandIds", "name")
      .populate("partCategoryId", "name")
      .populate("modelIds", "name");

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this brand" });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name, brandIds, modelIds, partCategoryId, price, stock, description, tags } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, brandIds, partCategoryId, modelIds, price, stock, description, tags }, // ✅ include tags
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
