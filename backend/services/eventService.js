const Event = require('../models/Event');
const Category = require('../models/Category');
const Venue = require('../models/Venue');
const ErrorResponse = require('../utils/errorResponse');

const validateEventLogic = async (data, existingEvent = null) => {
  const start = data.startDateTime ? new Date(data.startDateTime) : (existingEvent ? existingEvent.startDateTime : null);
  const end = data.endDateTime ? new Date(data.endDateTime) : (existingEvent ? existingEvent.endDateTime : null);

  if (start && end && start >= end) {
    throw new ErrorResponse('Event start time must be before end time', 400, 'EVENT_INVALID_DATE_RANGE');
  }

  if (data.category) {
    const category = await Category.findById(data.category);
    if (!category) throw new ErrorResponse('Category not found', 404, 'CATEGORY_NOT_FOUND');
    if (!category.isActive) throw new ErrorResponse('Cannot use an inactive category', 400, 'EVENT_CATEGORY_INACTIVE');
  }

  if (data.venue || data.maxAttendees) {
    const venueId = data.venue || (existingEvent ? existingEvent.venue : null);
    const maxAttendees = data.maxAttendees || (existingEvent ? existingEvent.maxAttendees : null);
    
    if (venueId) {
      const venue = await Venue.findById(venueId);
      if (!venue) throw new ErrorResponse('Venue not found', 404, 'VENUE_NOT_FOUND');
      if (!venue.isActive) throw new ErrorResponse('Cannot use an inactive venue', 400, 'EVENT_VENUE_INACTIVE');
      if (maxAttendees && maxAttendees > venue.capacity) {
        throw new ErrorResponse(`Max attendees cannot exceed venue capacity (${venue.capacity})`, 400, 'EVENT_CAPACITY_EXCEEDED');
      }
    }
  }
};

exports.createEvent = async (data, userId) => {
  await validateEventLogic(data);

  const event = await Event.create({
    ...data,
    organizer: userId
  });

  return event;
};

exports.getEvents = async (query, pagination) => {
  const { page, limit } = pagination;
  const startIndex = (page - 1) * limit;

  // Build mongoose query
  let dbQuery = Event.find(query)
    .populate({ path: 'category', select: 'name' })
    .populate({ path: 'venue', select: 'name city address' })
    .populate({ path: 'organizer', select: 'name email' });

  // Pagination
  dbQuery = dbQuery.skip(startIndex).limit(limit).sort({ startDateTime: 1 });

  const events = await dbQuery;
  const total = await Event.countDocuments(query);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

exports.getEventById = async (id) => {
  const event = await Event.findById(id)
    .populate({ path: 'category', select: 'name isActive' })
    .populate({ path: 'venue', select: 'name city capacity isActive' })
    .populate({ path: 'organizer', select: 'name email' });

  if (!event) {
    throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }
  return event;
};

exports.updateEvent = async (id, data, user) => {
  let event = await Event.findById(id);

  if (!event) {
    throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Ownership check
  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('User not authorized to update this event', 403, 'UNAUTHORIZED_EVENT_OWNER');
  }

  await validateEventLogic(data, event);

  event = await Event.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  return event;
};

exports.updateEventStatus = async (id, status, user) => {
  let event = await Event.findById(id);

  if (!event) {
    throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Ownership check
  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('User not authorized to update this event status', 403, 'UNAUTHORIZED_EVENT_OWNER');
  }

  event.status = status;
  await event.save();

  return event;
};

exports.deleteEvent = async (id, user) => {
  const event = await Event.findById(id);

  if (!event) {
    throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Ownership check
  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('User not authorized to delete this event', 403, 'UNAUTHORIZED_EVENT_OWNER');
  }

  await Event.findByIdAndDelete(id);

  return event;
};
