import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { getEvent } from '../../services/eventService';
import { getTicketTypesByEvent } from '../../services/ticketService';
import { getEventReviews } from '../../services/reviewService';
import { createBooking } from '../../services/bookingService';
import { processPayment } from '../../services/paymentService';
import { MapPin, Calendar, Tag, Info, Star, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [selectedTickets, setSelectedTickets] = useState({});
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ev, tkts, revs] = await Promise.all([
          getEvent(id),
          getTicketTypesByEvent(id).catch(() => []),
          getEventReviews(id).catch(() => null)
        ]);
        setEvent(ev);
        setTicketTypes(tkts);
        setReviewsData(revs);
      } catch (err) {
        setError('Failed to load event details. Database may be offline.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const handleQuantityChange = (ticketId, delta, max) => {
    setSelectedTickets(prev => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [ticketId]: next };
    });
  };

  const calculateTotal = () => {
    let total = 0;
    ticketTypes.forEach(t => {
      total += (selectedTickets[t._id] || 0) * t.price;
    });
    return total;
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const ticketsArray = Object.keys(selectedTickets)
      .filter(k => selectedTickets[k] > 0)
      .map(k => ({ ticketType: k, quantity: selectedTickets[k] }));

    if (ticketsArray.length === 0) return;

    setIsBooking(true);
    try {
      // 1. Create Booking
      const booking = await createBooking({ eventId: id, tickets: ticketsArray });
      
      // 2. Process Demo Payment (simulate: 'success' or 'failure')
      await processPayment({ bookingId: booking._id, method: 'credit_card', simulate: 'success' });
      
      setBookingSuccess(true);
      setSelectedTickets({});
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <MainLayout><Spinner className="py-20" /></MainLayout>;
  if (error || !event) return <MainLayout><div className="text-center py-20 text-red-600">{error || 'Event not found'}</div></MainLayout>;

  return (
    <MainLayout>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                {event.title}
              </h1>
              <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {new Date(event.startDateTime).toLocaleDateString()}
                </div>
                {event.venue && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {event.venue.name}, {event.venue.city}
                  </div>
                )}
                {event.category && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Tag className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    {event.category.name}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex md:mt-0 md:ml-4">
              <Badge color={event.status === 'published' ? 'green' : 'gray'}>{event.status.toUpperCase()}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this Event</h2>
              <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-line">
                {event.description}
              </div>
            </section>

            {reviewsData && reviewsData.reviews.length > 0 && (
              <section className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="ml-1 text-lg font-medium">{reviewsData.averageRating}</span>
                    <span className="ml-1 text-gray-500 text-sm">({reviewsData.totalReviews})</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {reviewsData.reviews.slice(0, 3).map(review => (
                    <div key={review._id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{review.user.name}</span>
                        <div className="flex">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tickets</h3>
              
              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Booking Confirmed!</h3>
                  <p className="text-sm text-gray-500 mt-2">Your simulated payment was successful.</p>
                  <Link to="/bookings">
                    <Button className="mt-6 w-full">View My Bookings</Button>
                  </Link>
                </div>
              ) : ticketTypes.length === 0 ? (
                <div className="text-gray-500 text-sm text-center py-4">No tickets available.</div>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map(t => {
                    const available = t.totalQuantity - t.soldQuantity;
                    const selected = selectedTickets[t._id] || 0;
                    return (
                      <div key={t._id} className="flex flex-col border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900 block">{t.name}</span>
                            <span className="text-sm text-gray-500 block">₹{t.price}</span>
                          </div>
                          {available > 0 ? (
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button 
                                onClick={() => handleQuantityChange(t._id, -1, available)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                disabled={selected === 0}
                              >-</button>
                              <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center">{selected}</span>
                              <button 
                                onClick={() => handleQuantityChange(t._id, 1, available)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                disabled={selected >= available || selected >= (t.maxPerBooking || 10)}
                              >+</button>
                            </div>
                          ) : (
                            <span className="text-sm text-red-500 font-medium">Sold Out</span>
                          )}
                        </div>
                        {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                      </div>
                    );
                  })}
                  
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <div className="flex justify-between font-bold text-gray-900 mb-6">
                      <span>Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleCheckout}
                      disabled={calculateTotal() === 0}
                      isLoading={isBooking}
                    >
                      {user ? 'Checkout (Demo)' : 'Login to Book'}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      <Info className="inline h-3 w-3 mr-1" /> Payment is simulated.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default EventDetail;
