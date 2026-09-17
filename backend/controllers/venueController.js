const venueService = require('../services/venueService');

exports.createVenue = async (req, res, next) => {
  try {
    const venue = await venueService.createVenue(req.body, req.user.id);
    res.status(201).json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
};

exports.getVenues = async (req, res, next) => {
  try {
    // Determine visibility
    let query = {};
    if (!req.user || req.user.role === 'user') {
      // Normal users and public see only active venues
      query.isActive = true;
    }
    // Organizers and admins can see all venues (or organizers could just see their own + all active)
    // The prompt: "Admin can manage all venues", "Organizer can manage venues they created"
    // For listing, we can just return all active venues to everyone, but let's let organizers/admins see all for simplicity or filter by `isActive`.
    // Actually, "GET /api/v1/venues [public/authenticated]"
    if (req.user && req.user.role === 'organizer') {
      // Organizers can see all active venues, plus their own inactive venues
      query = {
        $or: [
          { isActive: true },
          { createdBy: req.user.id }
        ]
      };
    } else if (req.user && req.user.role === 'admin') {
      query = {}; // admin sees all
    }

    const venues = await venueService.getVenues(query);
    res.status(200).json({ success: true, count: venues.length, data: venues });
  } catch (err) {
    next(err);
  }
};

exports.getVenue = async (req, res, next) => {
  try {
    const venue = await venueService.getVenueById(req.params.id);
    
    // Non-active venues logic
    if (!venue.isActive) {
      if (!req.user || (req.user.role !== 'admin' && venue.createdBy.toString() !== req.user.id)) {
        return res.status(404).json({ success: false, message: 'Venue not found', error: 'VENUE_NOT_FOUND' });
      }
    }

    res.status(200).json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
};

exports.updateVenue = async (req, res, next) => {
  try {
    const venue = await venueService.updateVenue(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
};

exports.updateVenueStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const venue = await venueService.updateVenueStatus(req.params.id, isActive, req.user);
    res.status(200).json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
};

exports.deleteVenue = async (req, res, next) => {
  try {
    await venueService.deleteVenue(req.params.id, req.user);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
