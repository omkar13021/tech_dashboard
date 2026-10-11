'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RootState, AppDispatch } from '@/store';
import { queryTasks, setSelectedTask } from '@/store/slices/taskSlice';
import { DynamicSidebar, MobileDynamicSidebar } from '@/components/layout/DynamicSidebar';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading: authLoading, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { selectedTask, isLoading: tasksLoading } = useSelector(
    (state: RootState) => state.tasks
  );
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize tasks on mount
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      dispatch(queryTasks(undefined));
      setIsInitialized(true);
    }
  }, [dispatch, isAuthenticated, isInitialized]);

  // Handle detail panel visibility
  useEffect(() => {
    if (selectedTask) {
      setShowDetailPanel(true);
    } else {
      setShowDetailPanel(false);
    }
  }, [selectedTask]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleCloseDetail = () => {
    setShowDetailPanel(false);
    dispatch(setSelectedTask(null));
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <DynamicSidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileDynamicSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className={cn(
        'flex flex-col min-w-0 overflow-hidden transition-all duration-300',
        showDetailPanel ? 'flex-1 md:mr-96' : 'flex-1'
      )}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="h-9 w-9 p-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {getPageTitle(pathname)}
          </h1>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={showDetailPanel}
        onClose={handleCloseDetail}
      />
    </div>
  );
};

// Helper function to get page title from pathname
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/': 'My Day',
    '/dashboard': 'Dashboard',
    '/my-day': 'My Day',
    '/important': 'Important',
    '/planned': 'Planned',
    '/assigned': 'Assigned to me',
    '/meetings': 'Meetings',
    '/tasks': 'Tasks',
    '/reports': 'Reports',
    '/team': 'Team',
    '/projects': 'Projects',
  };
  
  return titles[pathname] || 'Dashboard';
}

export default AppLayout;
