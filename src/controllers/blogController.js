import Blog from "../models/Blog.js";

// Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, description, image, isActive, order } = req.body;

    if (!title || !description || !image) {
      return res.status(400).json({ message: "Title, description, and image are required" });
    }

    const blog = await Blog.create({
      title,
      description,
      image,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Blogs (only active ones for public, all for admin)
export const getBlogs = async (req, res) => {
  try {
    const { admin } = req.query;
    
    let query = {};
    if (admin !== "true") {
      query.isActive = true;
    }

    const blogs = await Blog.find(query)
      .sort({ order: 1, createdAt: -1 }); // Sort by order first, then by creation date

    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Blog
export const updateBlog = async (req, res) => {
  try {
    const { title, description, image, isActive, order } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, image, isActive, order },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

