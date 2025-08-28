import DeviceCategory from "../models/deviceCategory.js";

// Create
export const createCategory = async (req, res) => {
  try {
    const category = await DeviceCategory.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read (All)
export const getCategories = async (req, res) => {
  const categories = await DeviceCategory.find();
  res.json(categories);
};

// Update
export const updateCategory = async (req, res) => {
  try {
    const category = await DeviceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
export const deleteCategory = async (req, res) => {
  try {
    await DeviceCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
