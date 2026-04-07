import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Users,
  UserCog,
  Calendar,
  PartyPopper,
  TrendingUp,
  Award,
  History,
  Activity,
  Terminal,
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../context/AuthContext";
import { Student, Faculty, Schedule, Event } from "../types";

export function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentRes, facultyRes, scheduleRes, eventRes, logRes] = await Promise.all([
          fetchWithAuth('/students'),
          fetchWithAuth('/faculty'),
          fetchWithAuth('/schedules'),
          fetchWithAuth('/events'),
          fetchWithAuth('/system-logs')
        ]);
        const sData = studentRes.ok ? await studentRes.json() : { data: [] };
        const fData = facultyRes.ok ? await facultyRes.json() : { data: [] };
        const schData = scheduleRes.ok ? await scheduleRes.json() : { data: [] };
        const evData = eventRes.ok ? await eventRes.json() : { data: [] };
        const logData = logRes.ok ? await logRes.json() : { data: [] };
        setStudents(sData.data || []);
        setFaculty(fData.data || []);
        setSchedules(schData.data || []);
        setEvents(evData.data || []);
        setRecentLogs(logData.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
  }

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: Users,
      color: "text-[#FF7F11]",
      bgColor: "bg-orange-50",
    },
    {
      title: "Active Faculty",
      value: faculty.filter((f) => f.status === "Active")
        .length,
      icon: UserCog,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Class Schedules",
      value: schedules.length,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Upcoming Events",
      value: events.length,
      icon: PartyPopper,
      color: "text-[#FF7F11]",
      bgColor: "bg-orange-50",
    },
  ];

  const activeStudents = students.filter(
    (s) => s.status === "Active",
  );
  const avgGPA = activeStudents.length > 0
    ? activeStudents.reduce((sum, s) => sum + s.gpa, 0) / activeStudents.length
    : 0;
  const studentsWithVarsity = students.filter((s) =>
    s.sportsSkills.some((skill) => skill.level === "Varsity"),
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF7F11] to-orange-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to College of Computing Studies Comprehensive
          System
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-l-4 border-l-[#FF7F11] shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-[#FF7F11]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Academic Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  Average GPA
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {avgGPA.toFixed(2)}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Dean's List Candidates (GPA ≥ 3.75)
                </p>
                <p className="text-2xl font-semibold text-green-600">
                  {
                    activeStudents.filter((s) => s.gpa >= 3.75)
                      .length
                  }{" "}
                  Students
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              Sports & Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  Varsity Athletes
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                  {studentsWithVarsity}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Active Organizations
                </p>
                <p className="text-2xl font-semibold text-purple-600">
                  {
                    new Set(
                      students.flatMap((s) =>
                        s.affiliations.map(
                          (a) => a.organization,
                        ),
                      ),
                    ).size
                  }{" "}
                  Organizations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid (Logs and Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Activity */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#FF7F11]/10 to-transparent border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF7F11]" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <p className="text-center text-gray-500 py-4 italic">No recent activity detected.</p>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-1">{log.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{log.user?.name || 'System'}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b">
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-[#FF7F11]" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {event.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-gray-500">
                      <span>{event.date}</span>
                      <span>•</span>
                      <span>{event.venue}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      event.type === "Curricular"
                        ? "bg-green-100 text-green-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}