// controllers/searchAnalyticsController.js
import SearchHistory from "../models/searchHistory.js";

// Get search analytics for admin
export const getSearchAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Most searched queries
    const popularSearches = await SearchHistory.aggregate([
      { $match: query },
      { $group: { _id: "$query", count: { $sum: 1 }, clicked: { $sum: { $cond: ["$clicked", 1, 0] } } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
    ]);
    
    // Search trends by date
    const searchTrends = await SearchHistory.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    // Total searches
    const totalSearches = await SearchHistory.countDocuments(query);
    
    // Unique queries
    const uniqueQueries = await SearchHistory.distinct("query", query);
    
    // Zero result searches
    const zeroResultSearches = await SearchHistory.aggregate([
      { $match: { ...query, resultsCount: 0 } },
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    
    res.json({
      popularSearches: popularSearches.map(s => ({
        query: s._id,
        count: s.count,
        clicked: s.clicked,
        clickRate: s.count > 0 ? ((s.clicked / s.count) * 100).toFixed(2) : 0,
      })),
      searchTrends: searchTrends.map(t => ({ date: t._id, count: t.count })),
      totalSearches,
      uniqueQueries: uniqueQueries.length,
      zeroResultSearches: zeroResultSearches.map(s => ({ query: s._id, count: s.count })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

