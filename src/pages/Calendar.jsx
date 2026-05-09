import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope,
  Plus,
  Loader2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // TODO: Implement sessions API endpoint in backend
  // For now, use empty array since sessions backend is not yet implemented
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      // Return empty array until sessions API is implemented
      return [];
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const sessionsByDate = useMemo(() => {
    const map = {};
    if (Array.isArray(sessions)) {
      sessions.forEach(session => {
        const dateKey = format(new Date(session.created_date), 'yyyy-MM-dd');
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(session);
      });
    }
    return map;
  }, [sessions]);

  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Calendar</h1>
                <p className="text-xs text-slate-500">Your sessions by date</p>
              </div>
            </div>
            
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Calendar Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 border-b border-slate-100">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const daySessions = sessionsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] p-2 border-b border-r border-slate-100 ${
                      !isCurrentMonth ? 'bg-slate-50/50' : ''
                    } ${isToday ? 'bg-teal-50/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        !isCurrentMonth ? 'text-slate-400' : 
                        isToday ? 'text-teal-600 font-bold' : 'text-slate-700'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {daySessions.length > 0 && (
                        <Badge variant="secondary" className="h-5 text-xs">
                          {daySessions.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map(session => (
                        <Link
                          key={session.id}
                          to={createPageUrl('Sessions')}
                          className="block p-1.5 bg-teal-50 hover:bg-teal-100 rounded text-xs text-slate-700 truncate transition-colors"
                        >
                          <div className="font-medium truncate">{session.title || 'Untitled'}</div>
                          {session.patient_name && (
                            <div className="text-slate-500 truncate text-[10px]">{session.patient_name}</div>
                          )}
                        </Link>
                      ))}
                      {daySessions.length > 3 && (
                        <Link
                          to={createPageUrl('Sessions')}
                          className="block p-1 text-[10px] text-teal-600 hover:text-teal-700"
                        >
                          +{daySessions.length - 3} more
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-800">
              {Object.keys(sessionsByDate).length}
            </div>
            <div className="text-sm text-slate-500">Days with sessions</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-800">
              {sessions.length}
            </div>
            <div className="text-sm text-slate-500">Total sessions</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-800">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}