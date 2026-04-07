import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Megaphone, Plus, Bell, AlertCircle, Info, CheckCircle2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const mockAnnouncements = [
  {
    id: '1',
    title: 'Midterm Examination Schedule Released',
    content: 'The midterm examination schedule for the 2nd semester has been posted. Please check your student portal for the complete schedule.',
    type: 'important',
    date: '2026-03-10',
    author: 'Academic Office',
  },
  {
    id: '2',
    title: 'IT Week 2026 - Call for Participants',
    content: 'Join us for IT Week 2026! Various competitions including programming contests, hackathons, and tech talks. Registration now open.',
    type: 'event',
    date: '2026-03-08',
    author: 'IT Society',
  },
  {
    id: '3',
    title: 'System Maintenance Notice',
    content: 'The student portal will undergo scheduled maintenance on March 15, 2026 from 12:00 AM to 6:00 AM. Services will be temporarily unavailable.',
    type: 'warning',
    date: '2026-03-07',
    author: 'IT Services',
  },
  {
    id: '4',
    title: 'Scholarship Application Deadline Extended',
    content: "Good news! The deadline for scholarship applications has been extended until March 20, 2026. Don't miss this opportunity!",
    type: 'success',
    date: '2026-03-05',
    author: 'Finance Office',
  },
  {
    id: '5',
    title: 'New Library Operating Hours',
    content: 'Starting March 15, the library will be open from 7:00 AM to 10:00 PM on weekdays and 8:00 AM to 6:00 PM on weekends.',
    type: 'info',
    date: '2026-03-03',
    author: 'Library Services',
  },
];

export function Announcements() {
  const [filter, setFilter] = useState('all');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'important':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'event':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'important':
        return <AlertCircle className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      case 'warning':
        return <Bell className="w-5 h-5" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? mockAnnouncements 
    : mockAnnouncements.filter(a => a.type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF7F11] to-orange-600 bg-clip-text text-transparent">
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Stay updated with the latest news and updates</p>
        </div>
        <Button 
          onClick={() => toast.success('New Announcement feature coming soon!')}
          className="bg-gradient-to-r from-[#FF7F11] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card 
          className={`cursor-pointer transition-all shadow-lg hover:shadow-xl ${filter === 'all' ? 'ring-2 ring-[#FF7F11]' : ''}`}
          onClick={() => setFilter('all')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-[#FF7F11]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">All</p>
                <p className="text-xl font-bold">{mockAnnouncements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all shadow-lg hover:shadow-xl ${filter === 'important' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setFilter('important')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Important</p>
                <p className="text-xl font-bold text-red-600">
                  {mockAnnouncements.filter(a => a.type === 'important').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all shadow-lg hover:shadow-xl ${filter === 'event' ? 'ring-2 ring-purple-500' : ''}`}
          onClick={() => setFilter('event')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Events</p>
                <p className="text-xl font-bold text-purple-600">
                  {mockAnnouncements.filter(a => a.type === 'event').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all shadow-lg hover:shadow-xl ${filter === 'warning' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setFilter('warning')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-xl font-bold text-yellow-600">
                  {mockAnnouncements.filter(a => a.type === 'warning').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all shadow-lg hover:shadow-xl ${filter === 'info' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFilter('info')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-xl font-bold text-blue-600">
                  {mockAnnouncements.filter(a => a.type === 'info').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(announcement.type)} shadow-lg`}>
                  {getTypeIcon(announcement.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-gray-600">
                        By {announcement.author} • {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <Badge className={`${getTypeColor(announcement.type)} gap-1`}>
                      {getTypeIcon(announcement.type)}
                      {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mt-3">{announcement.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
