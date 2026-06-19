import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar }       from './components/layout/Sidebar';
import { Header }        from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { BoardView }     from './components/views/BoardView';
import { ListView }      from './components/views/ListView';
import { CalendarView }  from './components/views/CalendarView';
import { TagsView }      from './components/views/TagsView';
import { Modal }         from './components/ui/Modal';
import { TaskForm }      from './components/tasks/TaskForm';
import { TaskDetail }    from './components/tasks/TaskDetail';
import { useTasks }      from './hooks/useTasks';
import type { Task, FilterState, Status, CreateTaskDTO, UpdateTaskDTO } from './types.ts';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const DEFAULT_FILTERS: FilterState = {
  status:   'all',
  priority: 'all',
  category: 'all',
  search:   '',
  sortBy:   'createdAt',
  order:    'desc',
};

export default function App() {
  const [filters,     setFilters]     = useState<FilterState>(DEFAULT_FILTERS);
  const [activeView,  setActiveView]  = useState('dashboard');
  const [viewMode,    setViewMode]    = useState<'board' | 'list'>('board');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen,   setEditOpen]   = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTask,   setSelectedTask]   = useState<Task | null>(null);
  const [defaultStatus,  setDefaultStatus]  = useState<Status>('todo');

  const {
    tasks, stats, loading, error, demoMode, refetch,
    createTask, updateTask, updateStatus,
    deleteTask, addSubtask, toggleSubtask, deleteSubtask,
  } = useTasks(filters);

  // Keep selectedTask in sync with live task list
  useEffect(() => {
    if (!selectedTask) return;
    const live = tasks.find((t) => t.id === selectedTask.id);
    if (live) setSelectedTask(live);
  }, [tasks]); // intentionally omit selectedTask to avoid loop

  /* ── Handlers ── */

  const handleFilterChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const openNewTask = useCallback((status?: Status) => {
    setDefaultStatus(status || 'todo');
    setCreateOpen(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailOpen(false);
    setEditOpen(true);
  }, []);

  const openDetail = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    await deleteTask(id);
    setDetailOpen(false);
    setEditOpen(false);
    setSelectedTask(null);
  }, [deleteTask]);

  const handleStatusChange = useCallback(async (id: string, status: Status) => {
    await updateStatus(id, status);
  }, [updateStatus]);

  const handleCreateSubmit = async (data: CreateTaskDTO | UpdateTaskDTO) => {
    await createTask({ ...data, status: defaultStatus } as CreateTaskDTO);
    setCreateOpen(false);
  };

  const handleEditSubmit = async (data: CreateTaskDTO | UpdateTaskDTO) => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, data as UpdateTaskDTO);
    setEditOpen(false);
  };

  const handleAddSubtask = async (title: string) => {
    if (!selectedTask) return;
    await addSubtask(selectedTask.id, title);
    // selectedTask will update via the useEffect above
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!selectedTask) return;
    await toggleSubtask(selectedTask.id, subtaskId);
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!selectedTask) return;
    await deleteSubtask(selectedTask.id, subtaskId);
  };

  /* ── View renderer ── */

  const renderView = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-2 border-[#4169e1] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading tasks...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Connection Failed</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 bg-[#4169e1] text-white rounded-xl text-sm font-medium hover:bg-[#2952e3] transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView stats={stats} tasks={tasks} onViewTask={openDetail} onNewTask={() => openNewTask()} />;
      case 'board':
        return viewMode === 'board'
          ? <BoardView  tasks={tasks} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} onView={openDetail} onNewTask={openNewTask} />
          : <ListView   tasks={tasks} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} onView={openDetail} />;
      case 'list':
        return <ListView  tasks={tasks} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} onView={openDetail} />;
      case 'calendar':
        return <CalendarView tasks={tasks} onViewTask={openDetail} />;
      case 'tags':
        return <TagsView tasks={tasks} onViewTask={openDetail} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <span className="text-4xl mb-4">🚧</span>
            <p className="text-base font-semibold text-gray-500">Coming Soon</p>
            <p className="text-sm mt-1">This section is under construction</p>
          </div>
        );
    }
  };

  /* ── Render ── */
  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar
        stats={stats}
        activeView={activeView}
        onViewChange={setActiveView}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          filters={filters}
          onFilterChange={handleFilterChange}
          onNewTask={() => openNewTask()}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeView={activeView}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Demo mode banner */}
          {demoMode && (
            <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-[#f5c518]/10 border border-[#f5c518]/30 rounded-xl">
              <span className="text-[#f5c518] text-base flex-shrink-0 mt-0.5">⚡</span>
              <div>
                <span className="text-sm font-semibold text-[#f5c518]">Demo Mode</span>
                <span className="text-xs text-gray-400 ml-1.5">— Backend not connected. Changes reset on refresh.</span>
              </div>
            </div>
          )}
          {renderView()}
        </main>
      </div>

      {/* ── Modals ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Task" size="lg">
        <TaskForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task" size="lg">
        {selectedTask && (
          <TaskForm
            key={selectedTask.id}
            task={selectedTask}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Task Details" size="lg">
        {selectedTask && (
          <TaskDetail
            key={selectedTask.id}
            task={selectedTask}
            onEdit={() => openEdit(selectedTask)}
            onDelete={() => handleDelete(selectedTask.id)}
            onStatusChange={(s) => handleStatusChange(selectedTask.id, s)}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        )}
      </Modal>
    </div>
  );
}
