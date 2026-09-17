import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { getNotifications, markAllAsRead, markAsRead } from '../../services/notificationService';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAll = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    fetchNotifications();
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Notifications</h1>
          <Button variant="secondary" onClick={handleMarkAll}>Mark All Read</Button>
        </div>
        
        {loading ? <Spinner /> : notifications.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No notifications</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {notifications.map(n => (
                <li key={n._id} className={`p-4 ${!n.isRead ? 'bg-indigo-50' : ''}`} onClick={() => !n.isRead && handleRead(n._id)}>
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900">{n.title}</p>
                    <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
