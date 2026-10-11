'use client';

import React from 'react';
import { TaskPage } from '@/components/tasks/TaskPage';
import { Star } from 'lucide-react';

export default function ImportantPage() {
  return (
    <TaskPage
      filter="IMPORTANT"
      title="Important"
      subtitle="Tasks marked as important"
      icon={<Star className="h-6 w-6 text-white" />}
      backgroundColor="bg-gradient-to-br from-rose-400 to-rose-600"
    />
  );
}
