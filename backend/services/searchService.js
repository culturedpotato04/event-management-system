const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const mongoose = require('mongoose');

exports.searchEvents = async (queryData, user) => {
  const { 
    q, category, venue, city, organizer, status, 
    minPrice, maxPrice, startDate, endDate, 
    sort, page, limit 
  } = queryData;

  let matchStage = {};

  // Visibility Rules
  if (!user || user.role === 'user') {
    matchStage.status = 'published';
  } else if (user.role === 'organizer') {
    if (organizer === 'me') {
      matchStage.organizer = new mongoose.Types.ObjectId(user.id);
      if (status) matchStage.status = status;
    } else {
      matchStage.status = 'published';
    }
  } else if (user.role === 'admin') {
    if (status) matchStage.status = status;
    if (organizer) matchStage.organizer = new mongoose.Types.ObjectId(organizer);
  }

  // Filters
  if (category) matchStage.category = new mongoose.Types.ObjectId(category);
  if (venue) matchStage.venue = new mongoose.Types.ObjectId(venue);

  // Date Filters
  if (startDate || endDate) {
    matchStage.startDateTime = {};
    if (startDate) matchStage.startDateTime.$gte = new Date(startDate);
    if (endDate) matchStage.startDateTime.$lte = new Date(endDate);
  }

  // Text search
  if (q) {
    matchStage.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  // Aggregation Pipeline for Advanced Filtering (City via Venue, Price via TicketType)
  let pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'venues',
        localField: 'venue',
        foreignField: '_id',
        as: 'venueData'
      }
    },
    { $unwind: { path: '$venueData', preserveNullAndEmptyArrays: true } }
  ];

  if (city) {
    pipeline.push({ $match: { 'venueData.city': { $regex: `^${city}$`, $options: 'i' } } });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    pipeline.push({
      $lookup: {
        from: 'tickettypes',
        localField: '_id',
        foreignField: 'event',
        as: 'tickets'
      }
    });

    let priceMatch = {};
    if (minPrice !== undefined) priceMatch.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) priceMatch.$lte = parseFloat(maxPrice);

    pipeline.push({
      $match: { 'tickets.price': priceMatch }
    });
  }

  // Sorting
  let sortStage = { startDateTime: 1 }; // default
  if (sort === 'newest') sortStage = { createdAt: -1 };
  if (sort === 'oldest') sortStage = { createdAt: 1 };
  if (sort === 'event_date_asc') sortStage = { startDateTime: 1 };
  if (sort === 'event_date_desc') sortStage = { startDateTime: -1 };
  
  if (sort === 'price_asc' || sort === 'price_desc') {
    // If not already looked up tickets, do it for sorting
    if (minPrice === undefined && maxPrice === undefined) {
      pipeline.push({
        $lookup: {
          from: 'tickettypes',
          localField: '_id',
          foreignField: 'event',
          as: 'tickets'
        }
      });
    }
    // Sort by lowest available ticket price
    pipeline.push({
      $addFields: { minTicketPrice: { $min: '$tickets.price' } }
    });
    sortStage = { minTicketPrice: sort === 'price_asc' ? 1 : -1 };
  }

  pipeline.push({ $sort: sortStage });

  // Pagination
  const p = parseInt(page, 10) || 1;
  const l = parseInt(limit, 10) || 12;
  const skip = (p - 1) * l;

  const countPipeline = [...pipeline, { $count: 'total' }];
  const totalResult = await Event.aggregate(countPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  pipeline.push({ $skip: skip }, { $limit: l });

  // Clean up output presentation (hide raw lookups if not fully needed, or use populate later)
  // For simplicity, we just lookup category and organizer as well so we return fully formed objects
  pipeline.push(
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryData'
      }
    },
    { $unwind: { path: '$categoryData', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        tickets: 0, // hide internal array unless needed
        minTicketPrice: 0
      }
    }
  );

  const events = await Event.aggregate(pipeline);

  return {
    events,
    pagination: {
      page: p,
      limit: l,
      total,
      pages: Math.ceil(total / l)
    }
  };
};
