import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import Card from '../../components/ui/Card';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const OrganizerDashboard = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Organizer Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome back, {user?.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center hover:bg-gray-50 transition">
            <Calendar className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Manage Events</h3>
            <p className="text-sm text-gray-500 mt-2">Create and edit your events</p>
          </Card>
          
          <Card className="p-6 text-center hover:bg-gray-50 transition">
            <MapPin className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Manage Venues</h3>
            <p className="text-sm text-gray-500 mt-2">Add or update physical venues</p>
          </Card>

          <Card className="p-6 text-center hover:bg-gray-50 transition">
            <Ticket className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Ticket Inventory</h3>
            <p className="text-sm text-gray-500 mt-2">Monitor sales and capacities</p>
          </Card>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Notice: The full Organizer Management suite interface will be activated in the next deployment phase. 
                Currently utilizing native backend filtering for security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrganizerDashboard;
