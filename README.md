# RosterView — Backend

RosterView is a support-worker roster management system for managing workers,
teams, clients, shifts, availability, shift swaps and leave requests.

This is the Node.js/Express API. The React frontend lives in
[Rosterview-Frontend](https://github.com/bguragain1023-web/Rosterview-Frontend).

## Tech Stack

- TypeScript, Node.js, Express 5
- MongoDB with Mongoose
- JWT authentication, bcrypt password hashing
- REST API

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC) with permission checks on every route
- Per-user extra permissions on top of their role
- New staff get a temporary password and must change it on first login

### Teams as Areas

- Every client belongs to a team (area)
- Only workers in the client's team can be assigned to that client's shifts;
  workers without a team can't be assigned
- Coordinators work across all areas; team leaders manage only their own area

### User & Team Management

- Worker, Team Leader, Coordinator and Admin roles
- One worker belongs to one team; each team has at most one leader
- User status management (active/inactive)

### Client Management

- Create, update and deactivate clients
- Team leaders only see their own area's clients

### Shift Management

- Create, update, assign, cancel and reinstate shifts
- Unassigned shifts
- Shift conflict detection
- Worker availability and approved-leave checks when assigning
- Weekly working-hour and overtime calculation
- Past assigned shifts are marked completed automatically (hourly)

### Worker Availability

- Recurring weekly availability
- Specific-date availability

### Shift Swaps

- Workers request swaps with teammates, within the same Monday–Sunday week
- The colleague accepts, then a manager approves or rejects
- Both workers are re-checked (leave, availability, clashes) on approval

### Leave Requests

- Pending, approved, rejected and cancelled statuses
- Overlapping requests are prevented
- Team leaders review their team; admins and coordinators review everyone
- Approved leave unassigns the worker from their shifts in that period

### Data Safety Checks

Changes that would break upcoming shifts are refused with a clear message:

- Moving a worker to another team, changing their role or removing them from
  their team while they have upcoming assigned shifts
- Changing a client's team while upcoming shifts have workers from another team
- Deactivating a team that still has active clients

## User Roles

| Role        | Main Responsibilities                                              |
| ----------- | ------------------------------------------------------------------ |
| Admin       | Manage users, teams, clients, permissions and the whole roster     |
| Coordinator | Manage the roster, swaps and leave across every area               |
| Team Leader | Run their area: roster, swaps and leave for their clients and team |
| Worker      | View roster, manage availability, request shift swaps and leave    |

## Permissions

Permissions are named `resource:action`, for example `roster:assign` or
`leave:approve`. The seed script groups them into the four roles, and an admin
can give a user extra permissions on top of their role. Routes are protected
with `requirePermission(resource, action)`.

## Project Structure

```
src/
  server.ts          app setup, routes, start-up and the hourly job
  config/            database connection
  routers/           URL → middleware → controller for each resource
  controllers/       request handling and business rules
  middleware/        auth (JWT), permission checks, error handler
    validation/      request body validation per resource
  models/            Mongoose schemas and database queries
  helper/            dates, availability, hours and conflict helpers
  seed/              permissions, roles and first-admin seed script
  utlis/             AppError, bcrypt and JWT utilities
```

## API

Base URL when running locally:

```text
http://localhost:8000/api/v1
```

Main resources:

```text
/users
/clients
/shifts
/swapShift
/teams
/availability
/leaverequest
/permissions
```

## Running Locally

### Prerequisites

- Node.js 20+
- Yarn
- MongoDB (local or Atlas)

### Installation

```bash
git clone https://github.com/bguragain1023-web/RosterView-backend.git
cd RosterView-backend
yarn install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8000

# First admin, created by the seed script
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=choose_a_starting_password
```

If `MONGO_URL` is not set, it connects to `mongodb://localhost:27017/Rosterview`.

### Seed the Database

```bash
yarn seed
```

This creates all permissions, the four roles and the first admin from
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. It is safe to run again: existing
roles are updated and an existing admin is left alone.

Log in with the admin details; you'll be asked to set a new password, and can
then add other staff from the Admin dashboard.

### Start the API

```bash
yarn dev
```

The API runs on http://localhost:8000.

## Scripts

| Command      | What it does                                         |
| ------------ | ---------------------------------------------------- |
| `yarn dev`   | Start in watch mode with ts-node-dev                 |
| `yarn build` | Compile TypeScript to `dist/`                        |
| `yarn start` | Run the compiled build                               |
| `yarn seed`  | Create or update permissions, roles and first admin  |

## Project Status

Version 1 is complete: authentication, RBAC, user/team/client management,
teams as areas, roster management, availability, shift swaps, leave and
overtime calculation, with a matching React frontend.

## Future Improvements

- Live demo with demo accounts
- Incident reports
- Notifications
- Automated tests
- Fortnightly pay cycle

## Author

[Brazesh Guragain](https://www.brazeshguragain.com)
