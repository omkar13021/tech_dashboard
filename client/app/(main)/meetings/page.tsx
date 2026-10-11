'use client';

import React from 'react';
import { TaskPage } from '@/components/tasks/TaskPage';
import { Video } from 'lucide-react';

export default function MeetingsPage() {
  return (
    <TaskPage
      filter="MEETINGS"
      title="Meetings"
      subtitle="Scheduled meetings and calls"
      icon={<Video className="h-6 w-6 text-white" />}
      backgroundColor="bg-gradient-to-br from-purple-400 to-purple-600"
    />
  );
}
