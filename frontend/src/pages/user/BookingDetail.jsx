import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { getBooking } from '../../services/bookingService';
import { getPayment } from '../../services/paymentService';

const BookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getBooking(id);
        setBooking(data);
      } catch (err) {
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <MainLayout><Spinner className="py-20" /></MainLayout>;
  if (error || !booking) return <MainLayout><div className="text-center py-20 text-red-600">{error || 'Booking not found'}</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Booking {booking.bookingNumber}</h1>
          <Badge color={booking.status === 'confirmed' ? 'green' : booking.status === 'cancelled' ? 'red' : 'gray'}>
            {booking.status.toUpperCase()}
          </Badge>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Event Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Event</dt>
                <dd className="mt-1 text-sm text-gray-900 font-bold">{booking.event?.title}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{booking.event ? new Date(booking.event.startDateTime).toLocaleString() : 'N/A'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Tickets</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {booking.tickets.map((t, idx) => (
                <li key={idx} className="px-4 py-4 flex justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{t.ticketType?.name || 'Unknown Ticket'}</span>
                    <span className="text-sm text-gray-500 ml-2">x {t.quantity}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">₹{t.priceAtBooking * t.quantity}</span>
                </li>
              ))}
              <li className="px-4 py-4 flex justify-between bg-gray-50">
                <span className="text-sm font-bold text-gray-900">Total Amount</span>
                <span className="text-sm font-bold text-gray-900">₹{booking.totalAmount}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Link to="/bookings">
            <Button variant="secondary">Back to My Bookings</Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookingDetail;
