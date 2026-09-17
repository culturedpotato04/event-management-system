import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { searchEvents, getCategories } from '../../services/eventService';
import { Search, MapPin, Calendar, Tag } from 'lucide-react';

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;
      if (city) params.city = city;

      const [eventsData, catsData] = await Promise.all([
        searchEvents(params).catch(() => ({ data: [] })),
        getCategories().catch(() => [])
      ]);
      
      setEvents(eventsData.data || []);
      if (categories.length === 0) setCategories(catsData || []);
    } catch (err) {
      setError('Failed to fetch events. Database may be offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4 md:mb-0">Browse Events</h1>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search events..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            
            <select
              className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <Button type="submit">Search</Button>
          </form>
        </div>

        {error && <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">{error}</div>}

        {loading ? (
          <Spinner className="py-20" />
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No events found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search filters.</p>
            <Button className="mt-4" variant="secondary" onClick={() => { setQ(''); setCategory(''); setCity(''); fetchEvents(); }}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <div key={event._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                    {event.status === 'completed' && <Badge color="green">Completed</Badge>}
                    {event.status === 'cancelled' && <Badge color="red">Cancelled</Badge>}
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {new Date(event.startDateTime).toLocaleDateString()} at {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.venue && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {event.venue.name}, {event.venue.city}
                      </div>
                    )}
                    {event.category && (
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 mr-2 text-gray-400" />
                        {event.category.name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {event.minPrice !== undefined ? (event.minPrice === 0 ? 'Free' : `From ₹${event.minPrice}`) : 'View pricing'}
                  </span>
                  <Link to={`/events/${event._id}`}>
                    <Button size="sm">Get Tickets</Button>
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

export default EventListing;
