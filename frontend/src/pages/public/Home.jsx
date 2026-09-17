import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import { searchEvents } from '../../services/eventService';
import Spinner from '../../components/ui/Spinner';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await searchEvents({ limit: 3 });
        setEvents(data.data || []);
      } catch (err) {
        setError('Failed to fetch events. Our database might be currently unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Discover Your Next Experience
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-indigo-100">
            Book tickets to the best events, concerts, and workshops happening around you.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link to="/events">
              <Button variant="secondary" size="lg">Browse All Events</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Events */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Upcoming Events</h2>
        
        {loading ? (
          <Spinner className="py-12" />
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 text-center">{error}</div>
        ) : events.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No events found at the moment.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="text-sm text-gray-500 mb-2">
                    📅 {new Date(event.startDateTime).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <Link to={`/events/${event._id}`}>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Home;
