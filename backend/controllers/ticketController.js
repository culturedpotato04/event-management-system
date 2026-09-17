const ticketService = require('../services/ticketService');

exports.createTicketType = async (req, res, next) => {
  try {
    const ticketType = await ticketService.createTicketType(req.body, req.user);
    res.status(201).json({ success: true, data: ticketType });
  } catch (err) {
    next(err);
  }
};

exports.getTicketTypesByEvent = async (req, res, next) => {
  try {
    const ticketTypes = await ticketService.getTicketTypesByEvent(req.params.eventId, req.user);
    res.status(200).json({ success: true, count: ticketTypes.length, data: ticketTypes });
  } catch (err) {
    next(err);
  }
};

exports.getTicketType = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketTypeById(req.params.id);

    // Public protection
    const isOwnerOrAdmin = req.user && (req.user.role === 'admin' || ticket.event.organizer.toString() === req.user.id);
    
    if (!isOwnerOrAdmin) {
      if (!ticket.isActive || ticket.event.status !== 'published') {
        return res.status(404).json({ success: false, message: 'Ticket type not found', error: 'TICKET_TYPE_NOT_FOUND' });
      }
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

exports.updateTicketType = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicketType(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

exports.updateTicketTypeStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const ticket = await ticketService.updateTicketTypeStatus(req.params.id, isActive, req.user);
    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

exports.deleteTicketType = async (req, res, next) => {
  try {
    await ticketService.deleteTicketType(req.params.id, req.user);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.getAvailability = async (req, res, next) => {
  try {
    const availability = await ticketService.getAvailability(req.params.id);
    res.status(200).json({ success: true, data: availability });
  } catch (err) {
    next(err);
  }
};
