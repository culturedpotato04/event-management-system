const searchService = require('../services/searchService');

exports.searchEvents = async (req, res, next) => {
  try {
    const result = await searchService.searchEvents(req.query, req.user);
    
    res.status(200).json({
      success: true,
      data: result.events,
      pagination: result.pagination,
      filters: {
        query: req.query.q,
        category: req.query.category,
        venue: req.query.venue,
        city: req.query.city,
        organizer: req.query.organizer,
        status: req.query.status,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sort: req.query.sort || 'event_date_asc'
      }
    });
  } catch (err) {
    next(err);
  }
};
