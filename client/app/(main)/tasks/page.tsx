'use client';

import React from 'react';
import { TaskPage } from '@/components/tasks/TaskPage';
import { CheckSquare } from 'lucide-react';

export default function AllTasksPage() {
  return (
    <TaskPage
      filter="TASKS"
      title="Tasks"
      subtitle="All your tasks"
      icon={<CheckSquare className="h-6 w-6 text-white" />}
      backgroundColor="bg-gradient-to-br from-gray-500 to-gray-700"
    />
  );
}
