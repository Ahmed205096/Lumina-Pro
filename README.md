# Lumina Tasker

Lumina Tasker is a modern team workspace built for people who want task management to feel sharp, fast, and intentional. It combines a polished landing experience with a real authenticated productivity app: workspaces, Kanban boards, role-aware collaboration, invitations, task assignment, notifications, and activity tracking.

This is not a toy todo list. It is a full-stack task platform with a glassmorphic interface, workspace-level permissions, database-backed state, and team workflows that feel ready for real usage.

Live Demo :[https://lumina.ahmed-khattab.online/]

## What Makes It Great

- **Beautiful first impression**: a cinematic landing page with animated backgrounds, pricing, about pages, and a demo modal.
- **Real workspace system**: users can create workspaces, switch between them, and keep task data scoped to the selected workspace.
- **Team collaboration**: invite members, manage pending invites, view member directories, and support workspace roles like owner, admin, member, and viewer.
- **Role-aware task control**: owners and admins can assign tasks, set due dates, edit, and delete, while access checks protect workspace data.
- **Kanban workflow**: tasks move across `todo`, `inProgress`, and `done` columns with persisted order and status.
- **Task distribution**: assign teammates, set priority, choose due dates, and prevent invalid or past due dates.
- **Notifications and email**: task assignment and invite flows are backed by in-app notifications and Resend-powered emails.
- **Activity visibility**: workspace actions are logged so teams can understand what changed and when.
- **Profile and settings layer**: authenticated users can manage profile details and work inside a persistent application shell.
- **Optimized Architecture**: clean, modular React architecture utilizing custom hooks (`useWorkspaceRole`, `useDashboardData`, `useNotifications`) to manage complex API interactions and strict role-based access without redundant calls.

## Tech Stack

- **Framework**: Next.js 16 App Router
- **UI**: React 19, TypeScript, Tailwind CSS 4
- **Authentication**: NextAuth v5 with Google, GitHub, and Facebook providers
- **Database**: MongoDB with Mongoose
- **State**: Zustand for workspace and UI state
- **Drag and drop**: SortableJS / React SortableJS
- **Email**: Resend
- **Linting**: ESLint 9 with Next.js config

## Main Areas

```text
app/
  api/                 Server routes for auth, tasks, workspaces, invites, notifications, and email
  components/
    General/           Public pages: landing, pricing, about, login
    Lumina/            Authenticated app: dashboard, board, team, sidebar, settings, notifications
  db/                  Mongo connection and Mongoose models
  utils/auth/          NextAuth configuration and session helpers
store.ts               Zustand stores and workspace helpers
proxy.ts               Request/session routing layer
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root and add the required variables:

```env
MONGO_URI=

NEXTAUTH_SECRET=
NEXTAUTH_URL=http://lumina.ahmed-khattab.online
NEXT_PUBLIC_URL=http://lumina.ahmed-khattab.online

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

NEXT_RESEND_SECRET=
NEXT_RESEND_FROM_EMAIL="Lumina Pro <noreply@lumina.ahmed-khattab.online>"

NEXT_PUBLIC_GET_USER_INFO=/api/user
NEXT_PUBLIC_MANAGE_WORKS=/api/workspace/manage-workspace
NEXT_PUBLIC_WORKS_MEMBERS=/api/workspace
NEXT_PUBLIC_WORKS_INVITE=/api/invites
NEXT_PUBLIC_WORKS_PENDING_INVITES=/api/invites/pending
NEXT_PUBLIC_SEND_EMAIL=/api/send-email
NEXT_PUBLIC_NOTIFICATION=/api/notification
NEXT_PUBLIC_REMOVE_INVITE_ADD_MEMBER=/api/invites/pending
```

Run the development server:

```bash
npm run dev
```

For local development, open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Product Flow

1. A visitor lands on the Lumina marketing experience.
2. They authenticate through a supported OAuth provider.
3. The app creates or updates their user record in MongoDB.
4. They create a workspace and invite teammates.
5. Team members work from the dashboard, team pages, and Kanban board.
6. Owners/admins assign tasks, set priority and due dates, and trigger notifications.
7. Activity logs keep the workspace story visible.

## Data Models

The core models are intentionally simple and practical:

- **User**: identity, profile, role, and contact fields.
- **Workspace**: name, slug, owner, members, roles, and pending invited emails.
- **Task**: content, priority, status, order, workspace, assignees, and due date.
- **Notification**: recipient, sender, type, message, and linked entity.
- **ActivityLog**: workspace actions tied to tasks and users.
- **Email**: invitation/email state.

## Why This Project Stands Out

Lumina Tasker has the kind of architecture that can grow. The UI is already split into public and authenticated surfaces, server routes enforce workspace boundaries, state is centralized where it matters, and the product has enough workflow depth to feel like a serious collaboration tool.

It looks premium, but more importantly, it behaves like a real app.
