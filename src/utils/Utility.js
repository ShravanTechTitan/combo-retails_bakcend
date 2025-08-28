// ✅ Standardized success response
export const successResponse = (res, data, message = "Success") => {
  return res.status(200).json({
    status: "success",
    message,
    data,
  });
};

// ❌ Standardized error response
export const errorResponse = (res, error, code = 500) => {
  return res.status(code).json({
    status: "error",
    message: error.message || "Internal Server Error",
  });
};

// 🔤 Slugify utility
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");
};
