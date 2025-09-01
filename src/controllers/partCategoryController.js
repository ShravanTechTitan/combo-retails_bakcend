import PartCategory from "../models/partCategory.js";

// Create
export const createCategory = async (req, res) => {
  try {
    const category = await PartCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// get category by Id
export const getCategoryById = async (req, res) => {
  try {
    const category = await PartCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Read (All)
export const getCategories = async (req, res) => {
  const categories = await PartCategory.find();
  res.json(categories);
};

// Update
export const updateCategory = async (req, res) => {
  try {
    const category = await PartCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
export const deleteCategory = async (req, res) => {
  try {
    await PartCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
