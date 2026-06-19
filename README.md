# Supreme's TaskFlow

A beautiful, full-stack task management platform built with React, TypeScript, TailwindCSS, and Express.

**Colors:** Black `#0a0a0f` · Royal Blue `#4169e1` · Yellow `#f5c518`

---

## Quick Start (Easiest way)

Open **two terminals** and run one command in each:

### Terminal 1 — Backend API
```bash
cd "Task Management Platform/backend"
npm run dev
```
API starts at → `http://localhost:5000`

### Terminal 2 — Frontend App
```bash
cd "Task Management Platform/frontend"
npm run dev
```
App opens at → `http://localhost:5173`

> Both must be running at the same time. The frontend talks to the backend via the Vite proxy.

---

## Or use the root script (runs both together)

```bash
cd "Task Management Platform"
npm run dev
```

---

## Project Structure

```
Task Management Platform/
├── backend/                  # Express + TypeScript REST API
│   └── src/
│       ├── types/index.ts    # Shared type definitions
│       ├── data/store.ts     # In-memory store (pre-seeded with 6 tasks)
│       ├── controllers/      # Route logic
│       ├── routes/           # API route definitions
│       ├── middleware/       # Error handlers
│       ├── app.ts            # Express setup + CORS
│       └── server.ts         # Entry point (port 5000)
│
└── frontend/                 # React 19 + Vite + TailwindCSS v4
    └── src/
        ├── types.ts          # TypeScript interfaces
        ├── api/taskApi.ts    # Axios HTTP client
        ├── hooks/useTasks.ts # Data + state management
        ├── utils/helpers.ts  # Config maps for priority/status/category
        ├── components/
        │   ├── ui/           # Button, Badge, Modal, Input, Select
        │   ├── layout/       # Sidebar, Header
        │   ├── tasks/        # TaskCard, TaskForm, TaskDetail
        │   └── views/        # Dashboard, Board, List, Calendar, Tags
        └── App.tsx           # Root app + routing
```

---

## Features

| Feature | Description |
|---|---|
| Dashboard | Stats overview, overdue tasks, high-priority items, completion rate |
| Board View | Kanban columns: To Do → In Progress → Review → Done |
| List View | Table view with inline status selector |
| Calendar View | Monthly calendar with tasks by due date |
| Tags View | Tag cloud + per-tag task breakdown with progress |
| Task Detail | Full detail modal with subtask checklist |
| Create / Edit | Form with priority, status, category, due date, assignee, tags |
| Subtasks | Add, toggle, delete with progress bar |
| Search & Filter | Real-time search + filter by status, priority, category |
| Overdue detection | Visual red indicators for past-due tasks |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/tasks | List tasks (supports ?status, ?priority, ?category, ?search) |
| GET | /api/tasks/stats | Task statistics |
| GET | /api/tasks/:id | Get single task |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| PATCH | /api/tasks/:id/status | Update status only |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/tasks/:id/subtasks | Add subtask |
| PATCH | /api/tasks/:id/subtasks/:sid | Toggle subtask complete |
| DELETE | /api/tasks/:id/subtasks/:sid | Delete subtask |
