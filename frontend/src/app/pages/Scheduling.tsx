import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, MapPin, User, Users, Info, PartyPopper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../context/AuthContext';
import { Schedule, Faculty, Course } from '../types';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export function Scheduling() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [schRes, facRes, crsRes] = await Promise.all([
          fetchWithAuth('/schedules'),
          fetchWithAuth('/faculty'),
          fetchWithAuth('/courses')
        ]);
        const schData = schRes.ok ? await schRes.json() : { data: [] };
        const facData = facRes.ok ? await facRes.json() : { data: [] };
        const crsData = crsRes.ok ? await crsRes.json() : { data: [] };

        setSchedules(schData.data || []);
        setFacultyList(facData.data || []);
        setCourses(crsData.data || []);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const schedulesByDay = days.map(day => ({
    day,
    schedules: schedules.filter(s => s.day === day)
  }));

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Schedules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF7F11] to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-[#FF7F11] tracking-tight">
              Scheduling
            </h1>
            <p className="text-sm text-gray-500 font-medium font-sans mt-0.5">
              Manage course timelines and faculty assignments
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Schedules</p>
                <p className="text-2xl font-bold text-gray-900">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rooms Used</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(schedules.map(s => s.room)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Teaching Faculty</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(schedules.map(s => s.facultyId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {schedulesByDay.map(({ day, schedules }) => (
              <div key={day}>
                <h3 className="font-semibold text-gray-900 mb-3">{day}</h3>
                {schedules.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No classes scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {schedules.map((schedule) => {
                      const faculty = facultyList.find(f => ((f.id).toString() === (schedule.facultyId).toString()));
                      const course = courses.find(c => c.code === schedule.courseCode);

                      return (
                        <div key={schedule.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {schedule.courseCode} - {course?.name || 'Course'}
                                </h4>
                                <Badge variant="outline">{schedule.section}</Badge>
                                <Badge
                                  variant={schedule.type === 'Lecture' ? 'default' : 'secondary'}
                                  className={schedule.type === 'Laboratory' ? 'bg-purple-100 text-purple-700' : ''}
                                >
                                  {schedule.type}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{schedule.timeStart} - {schedule.timeEnd}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <MapPin className="w-4 h-4" />
                                  <span>{schedule.room}</span>
                                </div>
                                {faculty && (
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span>{faculty.firstName} {faculty.lastName}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Room Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Room Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from(new Set(schedules.map(s => s.room))).map((room) => {
              const roomSchedules = schedules.filter(s => s.room === room);
              return (
                <div key={room} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{room}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {roomSchedules.length} schedule{roomSchedules.length !== 1 ? 's' : ''} per week
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Utilization</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {Math.round((roomSchedules.length / 25) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
