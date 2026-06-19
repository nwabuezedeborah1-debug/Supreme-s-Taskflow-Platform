import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { BoardView } from './components/views/BoardView';
import { ListView } from './components/views/ListView';
import { CalendarView } from './components/views/CalendarView';
import { TagsView } from './components/views/TagsView';
import { Modal } from './components/ui/Modal';
import { TaskForm } from './components/tasks/TaskForm';
import { TaskDetail } from './components/tasks/TaskDetail';
import { useTasks } from './hooks/useTasks';
import type { Task, FilterState, Status, CreateTaskDTO, UpdateTaskDTO } from './types.ts';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const defaultFilters: FilterState = {
  status: 'all',
  priority: 'all',
  category: 'all',
  search: '',
  sortBy: 'createdAt',
  order: 'desc',
};

function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeView, setActiveView] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo');

  const {
    tasks, stats, loading, error, demoMode, refetch,
    createTask, updateTask, updateStatus,
    deleteTask, addSubtask, toggleSubtask, deleteSubtask,
  } = useTasks(filters);

  const handleFilterChange = useCallback((partial: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleNewTask = useCallback((status?: Status) => {
    setDefaultStatus(status || 'todo');
    setCreateModal(true);
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailModal(false);
    setEditModal(true);
  }, []);

  const handleView = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailModal(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    await deleteTask(id);
    setDetailModal(false);
    setSelectedTask(null);
  }, [deleteTask]);

  const handleStatusChange = useCallback(async (id: string, status: Status) => {
    await updateStatus(id, status);
    if (selectedTask?.id === id) {
      setSelectedTask((prev) => prev ? { ...prev, status } : null);
    }
  }, [updateStatus, selectedTask]);

  const handleCreateSubmit = async (data: CreateTaskDTO | UpdateTaskDTO) => {
    await createTask({ ...data, status: defaultStatus } as CreateTaskDTO);
    setCreateModal(false);
  };

  const handleEditSubmit = async (data: CreateTaskDTO | UpdateTaskDTO) => {
    if (!selectedTask) return;
    const updated = await updateTask(selectedTask.id, data as UpdateTaskDTO);
    setSelectedTask(updated);
    setEditModal(false);
  };

  const handleAddSubtask = async (title: string) => {
    if (!selectedTask) return;
    const updated = await addSubtask(selectedTask.id, title) as unknown as Task;
    // refresh selected task from tasks list after state update
    refetch();
    setSelectedTask((prev) => prev ? { ...prev } : null);
    // Let's just refetch and close won't happen
    const taskFromApi = tasks.find((t) => t.id === selectedTask.id);
    if (taskFromApi) setSelectedTask(taskFromApi);
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!selectedTask) return;
    await toggleSubtask(selectedTask.id, subtaskId);
    // update local selected task
    setSelectedTask((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        subtasks: prev.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
      };
    });
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!selectedTask) return;
    await deleteSubtask(selectedTask.id, subtaskId);
    setSelectedTask((prev) => {
      if (!prev) return null;
      return { ...prev, subtasks: prev.subtasks.filter((s) => s.id !== subtaskId) };
    });
  };

  const renderMainView = () => {
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
        return (
          <DashboardView
            stats={stats}
            tasks={tasks}
            onViewTask={handleView}
            onNewTask={() => handleNewTask()}
          />
        );
      case 'board':
        return viewMode === 'board' ? (
          <BoardView
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onView={handleView}
            onNewTask={handleNewTask}
          />
        ) : (
          <ListView
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onView={handleView}
          />
        );
      case 'list':
        return (
          <ListView
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onView={handleView}
          />
        );
      case 'calendar':
        return <CalendarView tasks={tasks} onViewTask={handleView} />;
      case 'tags':
        return <TagsView tasks={tasks} onViewTask={handleView} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <span className="text-5xl mb-4">🚧</span>
            <p className="text-lg font-semibold text-gray-500">Coming Soon</p>
            <p className="text-sm mt-1">This section is under construction</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <Sidebar stats={stats} activeView={activeView} onViewChange={setActiveView} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          filters={filters}
          onFilterChange={handleFilterChange}
          onNewTask={() => handleNewTask()}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeView={activeView}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {demoMode && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[#f5c518]/10 border border-[#f5c518]/30 rounded-xl text-sm">
              <span className="text-[#f5c518] text-lg">⚡</span>
              <div>
                <span className="font-semibold text-[#f5c518]">Demo Mode</span>
                <span className="text-gray-400 ml-2">— Backend not connected. All changes are local and will reset on refresh.</span>
              </div>
            </div>
          )}
          {renderMainView()}
        </main>
      </div>

      {/* Create Task Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create New Task" size="lg">
        <TaskForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setCreateModal(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Task" size="lg">
        {selectedTask && (
          <TaskForm
            task={selectedTask}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModal(false)}
          />
        )}
      </Modal>

      {/* Task Detail Modal */}
      <Modal open={detailModal} onClose={() => setDetailModal(false)} title="Task Details" size="lg">
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onEdit={() => handleEdit(selectedTask)}
            onDelete={() => handleDelete(selectedTask.id)}
            onStatusChange={(status) => handleStatusChange(selectedTask.id, status)}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
          />
        )}
      </Modal>
    </div>
  );
}

export default App;
