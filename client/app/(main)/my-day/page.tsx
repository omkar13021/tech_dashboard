'use client';

import React from 'react';
import { TaskPage } from '@/components/tasks/TaskPage';
import { Sun } from 'lucide-react';
import { format } from 'date-fns';

export default function MyDayPage() {
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d');

  return (
    <TaskPage
      filter="MY_DAY"
      title="My Day"
      subtitle={formattedDate}
      icon={<Sun className="h-6 w-6 text-white" />}
      backgroundColor="bg-gradient-to-br from-teal-400 to-teal-600"
      backgroundImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
    />
  );
}
