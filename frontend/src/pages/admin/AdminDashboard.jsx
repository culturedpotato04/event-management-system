import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { getDashboard } from '../../services/adminService';
import { Users, Calendar, Ticket, CreditCard, Star } from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getDashboard();
        setMetrics(data);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <MainLayout><Spinner className="py-20" /></MainLayout>;
  if (error) return <MainLayout><div className="text-center py-20 text-red-600">{error}</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">System Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Users className="h-8 w-8" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.users.total}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-green-600">{metrics.users.active} Active</span>
              <span className="text-red-600">{metrics.users.inactive} Inactive</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-8 w-8" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Total Events</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.events.total}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <span>{metrics.events.published} Published</span>
              <span>{metrics.events.completed} Completed</span>
              <span>{metrics.events.draft} Draft</span>
              <span>{metrics.events.cancelled} Cancelled</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Ticket className="h-8 w-8" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.bookings.total}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm text-gray-600">
              <span className="text-green-600">{metrics.bookings.confirmed} Confirmed</span>
              <span className="text-yellow-600">{metrics.bookings.pending} Pending</span>
              <span className="text-red-600">{metrics.bookings.cancelled} Cancelled</span>
              <span className="text-gray-500">{metrics.bookings.failed} Failed</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <CreditCard className="h-8 w-8" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Total Payments</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.payments.total}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-bold text-gray-900">₹{metrics.payments.revenue}</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Star className="h-8 w-8" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Reviews</p>
                <h3 className="text-2xl font-bold text-gray-900">{metrics.reviews.total}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-gray-600">Average Rating:</span>
              <span className="font-bold text-gray-900">{metrics.reviews.averageRating} / 5</span>
            </div>
          </Card>

        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
