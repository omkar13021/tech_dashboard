'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useAuth } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sun,
  AlertCircle,
  Calendar,
  Video,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  ListTodo,
  Users,
  FolderKanban,
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks } = useSelector((state: RootState) => state.tasks);

  // Calculate stats
  const todayTasks = tasks.filter(t => t.isMyDay && !t.isCompleted);
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.isCompleted) return false;
    const dueDate = parseISO(t.dueDate);
    return isPast(dueDate) && !isToday(dueDate);
  });
  const upcomingMeetings = tasks.filter(t => t.isMeeting && !t.isCompleted);
  const assignedTasks = tasks.filter(t => t.assigneeId && !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/my-day">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-yellow-500">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  My Day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayTasks.length}</div>
                <p className="text-xs text-gray-500">tasks for today</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Overdue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
              <p className="text-xs text-gray-500">tasks past due</p>
            </CardContent>
          </Card>

          <Link href="/meetings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-purple-500" />
                  Meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
                <p className="text-xs text-gray-500">upcoming</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assigned">
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{assignedTasks.length}</div>
                <p className="text-xs text-gray-500">tasks assigned</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  Today's Focus
                </CardTitle>
                <CardDescription>Tasks planned for today</CardDescription>
              </div>
              <Link href="/my-day">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sun className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No tasks planned for today</p>
                  <Link href="/my-day">
                    <Button variant="link" className="mt-2">
                      Add tasks to My Day
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.dueTime || 'No time set'}
                          </p>
                        )}
                      </div>
                      {task.priority !== 'MEDIUM' && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            task.priority === 'URGENT' && 'bg-red-100 text-red-700',
                            task.priority === 'HIGH' && 'bg-orange-100 text-orange-700'
                          )}
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {todayTasks.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{todayTasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Progress
              </CardTitle>
              <CardDescription>Your task completion rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{completionRate}%</div>
                <p className="text-sm text-gray-500">completion rate</p>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold">{completedTasks.length}</div>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold">{totalTasks - completedTasks.length}</div>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Tasks Alert */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Overdue Tasks
              </CardTitle>
              <CardDescription className="text-red-600/70">
                These tasks need your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {task.dueDate && format(parseISO(task.dueDate), 'MMM d')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/my-day">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center p-4">
              <Sun className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm font-medium">My Day</p>
            </Card>
          </Link>
          <Link href="/important">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center p-4">
              <ListTodo className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-medium">Important</p>
            </Card>
          </Link>
          <Link href="/projects">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center p-4">
              <FolderKanban className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
              <p className="text-sm font-medium">Projects</p>
            </Card>
          </Link>
          <Link href="/team">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center p-4">
              <Users className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
              <p className="text-sm font-medium">Team</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
