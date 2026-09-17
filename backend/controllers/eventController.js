const eventService = require('../services/eventService');
const Venue = require('../models/Venue');

exports.createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user.id);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    // Build query from request
    let query = {};

    // Standard filtering
    if (req.query.category) query.category = req.query.category;
    if (req.query.venue) query.venue = req.query.venue;
    if (req.query.organizer) query.organizer = req.query.organizer;
    
    // Status filtering logic
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      // By default, public sees only published events unless they are an admin or it's an organizer looking at their own (handled differently or explicitly requested)
      // If no status specified, public sees 'published'
      if (!req.user || req.user.role === 'user') {
        query.status = 'published';
      }
    }

    // Date filtering
    if (req.query.startDate || req.query.endDate) {
      query.startDateTime = {};
      if (req.query.startDate) query.startDateTime.$gte = new Date(req.query.startDate);
      if (req.query.endDate) query.startDateTime.$lte = new Date(req.query.endDate);
    }

    // City filtering (requires finding venues in that city first)
    if (req.query.city) {
      const venuesInCity = await Venue.find({ city: new RegExp(`^${req.query.city}$`, 'i') }).select('_id');
      const venueIds = venuesInCity.map(v => v._id);
      query.venue = { $in: venueIds };
    }

    // Organizer explicit filtering
    // If the requester is an organizer and they specifically want "my events", they can pass ?organizer=me 
    if (req.query.organizer === 'me' && req.user) {
      query.organizer = req.user.id;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await eventService.getEvents(query, { page, limit });

    res.status(200).json({ 
      success: true, 
      message: 'Events fetched successfully',
      data: result.events,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    
    // Public non-published event protection
    if (event.status !== 'published') {
      if (!req.user || (req.user.role !== 'admin' && event.organizer._id.toString() !== req.user.id)) {
        return res.status(404).json({ success: false, message: 'Event not found', error: 'EVENT_NOT_FOUND' });
      }
    }

    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.updateEventStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const event = await eventService.updateEventStatus(req.params.id, status, req.user);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id, req.user);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
