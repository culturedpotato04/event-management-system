const TicketType = require('../models/TicketType');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');

const validateTicketTypeLogic = async (data, existingTicket = null) => {
  const minPer = data.minPerBooking || (existingTicket ? existingTicket.minPerBooking : 1);
  const maxPer = data.maxPerBooking || (existingTicket ? existingTicket.maxPerBooking : 10);

  if (maxPer < minPer) {
    throw new ErrorResponse('maxPerBooking cannot be less than minPerBooking', 400, 'TICKET_INVALID_QUANTITY');
  }

  const start = data.saleStart ? new Date(data.saleStart) : (existingTicket ? existingTicket.saleStart : null);
  const end = data.saleEnd ? new Date(data.saleEnd) : (existingTicket ? existingTicket.saleEnd : null);

  if (start && end && start >= end) {
    throw new ErrorResponse('saleStart must be before saleEnd', 400, 'TICKET_INVALID_DATE_RANGE');
  }

  // Fetch event to validate total quantity capacity
  const eventId = data.event || (existingTicket ? existingTicket.event : null);
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  if (event.status === 'cancelled' || event.status === 'completed') {
    throw new ErrorResponse('Cannot create/update tickets for cancelled or completed events', 400, 'EVENT_NOT_BOOKABLE');
  }

  if (start && start > event.endDateTime) {
    throw new ErrorResponse('Ticket sales must not begin after the event has ended', 400, 'TICKET_INVALID_DATE_RANGE');
  }

  // Validate aggregate totalQuantity doesn't exceed Event.maxAttendees
  const newTotalQuantity = data.totalQuantity !== undefined ? data.totalQuantity : (existingTicket ? existingTicket.totalQuantity : 0);
  
  const allTicketsForEvent = await TicketType.find({ event: eventId });
  let aggregateQuantity = 0;
  
  allTicketsForEvent.forEach(t => {
    if (existingTicket && t._id.toString() === existingTicket._id.toString()) {
      return; // skip current
    }
    aggregateQuantity += t.totalQuantity;
  });

  if (aggregateQuantity + newTotalQuantity > event.maxAttendees) {
    throw new ErrorResponse(`Total ticket quantities (${aggregateQuantity + newTotalQuantity}) exceed event maxAttendees (${event.maxAttendees})`, 400, 'TICKET_QUANTITY_EXCEEDS_EVENT_CAPACITY');
  }

  // Validate soldQuantity limits on update
  if (existingTicket && data.totalQuantity !== undefined && data.totalQuantity < existingTicket.soldQuantity) {
    throw new ErrorResponse('totalQuantity cannot be less than soldQuantity', 400, 'TICKET_SOLD_QUANTITY_CONSTRAINT');
  }

  return event;
};

exports.createTicketType = async (data, user) => {
  const event = await validateTicketTypeLogic(data);

  if (event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to manage tickets for this event', 403, 'UNAUTHORIZED_TICKET_OWNER');
  }

  try {
    const ticketType = await TicketType.create({
      ...data,
      createdBy: user.id
    });
    return ticketType;
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorResponse('Ticket type name must be unique within the event', 409, 'TICKET_TYPE_ALREADY_EXISTS');
    }
    throw error;
  }
};

exports.getTicketTypesByEvent = async (eventId, user) => {
  const event = await Event.findById(eventId);
  if (!event) throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');

  // If public user or not the owner, hide drafts or inactive
  const isOwnerOrAdmin = user && (user.role === 'admin' || event.organizer.toString() === user.id);
  
  if (!isOwnerOrAdmin && event.status !== 'published') {
    throw new ErrorResponse('Event is not published', 403, 'EVENT_NOT_PUBLISHED');
  }

  let query = { event: eventId };
  if (!isOwnerOrAdmin) {
    query.isActive = true;
  }

  return await TicketType.find(query);
};

exports.getTicketTypeById = async (id) => {
  const ticket = await TicketType.findById(id).populate('event', 'title status startDateTime endDateTime');
  if (!ticket) throw new ErrorResponse('Ticket type not found', 404, 'TICKET_TYPE_NOT_FOUND');
  return ticket;
};

exports.updateTicketType = async (id, data, user) => {
  let ticket = await TicketType.findById(id).populate('event');
  if (!ticket) throw new ErrorResponse('Ticket type not found', 404, 'TICKET_TYPE_NOT_FOUND');

  if (ticket.event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to manage this ticket type', 403, 'UNAUTHORIZED_TICKET_OWNER');
  }

  await validateTicketTypeLogic(data, ticket);

  try {
    ticket = await TicketType.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return ticket;
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorResponse('Ticket type name must be unique within the event', 409, 'TICKET_TYPE_ALREADY_EXISTS');
    }
    throw error;
  }
};

exports.updateTicketTypeStatus = async (id, isActive, user) => {
  const ticket = await TicketType.findById(id).populate('event');
  if (!ticket) throw new ErrorResponse('Ticket type not found', 404, 'TICKET_TYPE_NOT_FOUND');

  if (ticket.event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to manage this ticket type', 403, 'UNAUTHORIZED_TICKET_OWNER');
  }

  ticket.isActive = isActive;
  await ticket.save();
  return ticket;
};

exports.deleteTicketType = async (id, user) => {
  const ticket = await TicketType.findById(id).populate('event');
  if (!ticket) throw new ErrorResponse('Ticket type not found', 404, 'TICKET_TYPE_NOT_FOUND');

  if (ticket.event.organizer.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to manage this ticket type', 403, 'UNAUTHORIZED_TICKET_OWNER');
  }

  if (ticket.soldQuantity > 0) {
    throw new ErrorResponse('Cannot delete ticket type after tickets have been sold. Deactivate instead.', 409, 'TICKET_SOLD_QUANTITY_CONSTRAINT');
  }

  await TicketType.findByIdAndDelete(id);
  return ticket;
};

// ==========================================
// INVENTORY LOGIC (for Phase 5 Booking)
// ==========================================

exports.getAvailability = async (id) => {
  const ticket = await TicketType.findById(id);
  if (!ticket) throw new ErrorResponse('Ticket type not found', 404, 'TICKET_TYPE_NOT_FOUND');
  
  return {
    ticketTypeId: ticket._id,
    totalQuantity: ticket.totalQuantity,
    soldQuantity: ticket.soldQuantity,
    availableQuantity: ticket.availableQuantity
  };
};

exports.isPurchasable = (ticket, event) => {
  if (!ticket.isActive) return false;
  if (event.status !== 'published') return false;
  
  const now = new Date();
  if (event.endDateTime && now > event.endDateTime) return false;
  
  if (ticket.saleStart && now < ticket.saleStart) return false;
  if (ticket.saleEnd && now > ticket.saleEnd) return false;
  
  if (ticket.availableQuantity <= 0) return false;

  return true;
};

exports.reserveInventory = async (ticketTypeId, quantity) => {
  // Atomic conditional update: only increments if totalQuantity >= soldQuantity + quantity
  const result = await TicketType.findOneAndUpdate(
    {
      _id: ticketTypeId,
      $expr: { $gte: ["$totalQuantity", { $add: ["$soldQuantity", quantity] }] }
    },
    {
      $inc: { soldQuantity: quantity }
    },
    { new: true }
  );

  if (!result) {
    throw new ErrorResponse('Insufficient inventory or ticket not found', 400, 'TICKET_INSUFFICIENT_INVENTORY');
  }

  return result;
};

exports.releaseInventory = async (ticketTypeId, quantity) => {
  const result = await TicketType.findOneAndUpdate(
    { _id: ticketTypeId },
    { $inc: { soldQuantity: -quantity } },
    { new: true }
  );

  if (!result) {
    throw new ErrorResponse('Ticket not found', 404, 'TICKET_TYPE_NOT_FOUND');
  }

  return result;
};
