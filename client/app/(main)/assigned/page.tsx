'use client';

import React from 'react';
import { TaskPage } from '@/components/tasks/TaskPage';
import { UserCheck } from 'lucide-react';

export default function AssignedPage() {
  return (
    <TaskPage
      filter="ASSIGNED_TO_ME"
      title="Assigned to me"
      subtitle="Tasks assigned to you"
      icon={<UserCheck className="h-6 w-6 text-white" />}
      backgroundColor="bg-gradient-to-br from-blue-400 to-blue-600"
    />
  );
}
