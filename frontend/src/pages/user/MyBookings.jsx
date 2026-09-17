import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { getBookings, cancelBooking } from '../../services/bookingService';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      const data = await getBookings();
      setBookings(data.data || []);
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id, 'User requested cancellation via UI');
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'completed': return 'blue';
      case 'cancelled': return 'red';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Bookings</h1>

        {error && <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">{error}</div>}

        {loading ? (
          <Spinner className="py-20" />
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="text-gray-500 mt-1">You haven't booked any events yet.</p>
            <Link to="/events">
              <Button className="mt-4">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking._id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-indigo-600 truncate">{booking.event?.title || 'Unknown Event'}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <Badge color={getStatusColor(booking.status)}>{booking.status.toUpperCase()}</Badge>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            ID: {booking.bookingNumber}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Total: <span className="font-medium text-gray-900">₹{booking.totalAmount}</span></p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col space-y-2">
                      <Link to={`/bookings/${booking._id}`}>
                        <Button variant="secondary" size="sm" className="w-full">Details</Button>
                      </Link>
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <Button variant="danger" size="sm" onClick={() => handleCancel(booking._id)}>Cancel</Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyBookings;
