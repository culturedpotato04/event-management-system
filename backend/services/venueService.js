const Venue = require('../models/Venue');
const ErrorResponse = require('../utils/errorResponse');

exports.createVenue = async (data, userId) => {
  const venue = await Venue.create({
    ...data,
    createdBy: userId
  });
  return venue;
};

exports.getVenues = async (query = {}) => {
  return await Venue.find(query);
};

exports.getVenueById = async (id) => {
  const venue = await Venue.findById(id);
  if (!venue) {
    throw new ErrorResponse('Venue not found', 404, 'VENUE_NOT_FOUND');
  }
  return venue;
};

exports.updateVenue = async (id, data, user) => {
  let venue = await Venue.findById(id);
  
  if (!venue) {
    throw new ErrorResponse('Venue not found', 404, 'VENUE_NOT_FOUND');
  }

  // Check ownership unless admin
  if (venue.createdBy.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('User not authorized to update this venue', 403, 'UNAUTHORIZED_VENUE_OWNER');
  }

  venue = await Venue.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  return venue;
};

exports.updateVenueStatus = async (id, isActive, user) => {
  let venue = await Venue.findById(id);
  
  if (!venue) {
    throw new ErrorResponse('Venue not found', 404, 'VENUE_NOT_FOUND');
  }

  // Check ownership unless admin
  if (venue.createdBy.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('User not authorized to update this venue status', 403, 'UNAUTHORIZED_VENUE_OWNER');
  }

  venue.isActive = isActive;
  await venue.save();

  return venue;
};

exports.deleteVenue = async (id, user) => {
  const venue = await Venue.findById(id);
  
  if (!venue) {
    throw new ErrorResponse('Venue not found', 404, 'VENUE_NOT_FOUND');
  }

  // Check ownership unless admin
  if (venue.createdBy.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('User not authorized to delete this venue', 403, 'UNAUTHORIZED_VENUE_OWNER');
  }

  // TODO: Check if venue is referenced by future events before deleting.
  // We will handle this when events are fully implemented, or we can just delete it now.
  // The prompt says "Do not hard-delete a venue if it is already referenced by future events unless business rules explicitly permit it. Prefer safe behavior and a meaningful error."
  const Event = require('../models/Event');
  const futureEvents = await Event.countDocuments({ venue: id, startDateTime: { $gt: new Date() } });
  
  if (futureEvents > 0) {
    throw new ErrorResponse('Cannot delete venue. It is referenced by future events.', 409, 'VENUE_IN_USE');
  }

  await Venue.findByIdAndDelete(id);
  
  return venue;
};
