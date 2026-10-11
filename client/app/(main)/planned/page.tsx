'use client';

import React from 'react';
import { TaskPage } from '@/components/tasks/TaskPage';
import { Calendar } from 'lucide-react';

export default function PlannedPage() {
  return (
    <TaskPage
      filter="PLANNED"
      title="Planned"
      subtitle="Tasks with due dates"
      icon={<Calendar className="h-6 w-6 text-white" />}
      backgroundColor="bg-gradient-to-br from-green-400 to-green-600"
    />
  );
}
