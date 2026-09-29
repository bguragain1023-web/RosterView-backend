# RosterView

RosterView is a support-worker roster management system designed to manage workers, teams, clients, shifts, availability, shift swaps, and leave requests.

The project is being built as a full-stack TypeScript application with a Node.js/Express backend and a React frontend.

## Tech Stack

### Backend

- TypeScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- REST API

### Frontend

- React
- TypeScript

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Protected API routes

### User Management

- Create and manage users
- Worker, Team Leader, Coordinator and Admin roles
- User status management
- Team assignment

### Team Management

- Create and manage teams
- Assign Team Leaders
- Assign workers to teams
- Team-based access control

### Client Management

- Create, update and manage clients
- Active/inactive client status

### Shift Management

- Create and update shifts
- Assign workers to shifts
- Unassigned shifts
- Shift status management
- Shift conflict detection
- Worker availability checking
- Approved leave checking
- Weekly working-hour calculation
- Overtime calculation

### Worker Availability

- Recurring availability
- Specific-date availability
- Available/unavailable status
- Availability checked when assigning shifts

### Shift Swaps

- Workers can request shift swaps
- Team-based swap access
- Approval/rejection workflow

### Leave Requests

- Workers can submit leave requests
- Leave overlap prevention
- Pending, approved, rejected and cancelled statuses
- Team Leader approval for team members
- Admin/Coordinator approval
- Approved leave prevents shift assignment

## User Roles

| Role        | Main Responsibilities                                           |
| ----------- | --------------------------------------------------------------- |
| Admin       | Manage users, teams, permissions and overall system             |
| Coordinator | Manage rosters, shifts, workers and operational activities      |
| Team Leader | Manage team-related activities and approve team requests        |
| Worker      | View roster, manage availability, request shift swaps and leave |

## Backend Structure

The backend follows a layered structure separating responsibilities between:

- Routes
- Controllers
- Middleware
- Models
- Validation
- Database configuration

Authentication and permission middleware protect API endpoints, while controllers handle business logic and data access.

## API Base URL

When running locally:

```text
http://localhost:8000/api/v1
```

Main API resources include:

```text
/users
/clients
/shifts
/swapShift
/teams
/availability
/leaverequest
```

## Running Locally

### Prerequisites

Make sure you have installed:

- Node.js
- Yarn
- MongoDB

### Installation

Clone the repository and install dependencies:

```bash
yarn install
```

### Environment Variables

Create a `.env` file in the backend project:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8000
```

### Start the Backend

```bash
yarn dev
```

The API will run on:

```text
http://localhost:8000
```

## Project Status

### Backend

The main backend functionality is currently implemented, including authentication, RBAC, user/team/client management, roster management, availability, shift swaps, overtime calculation and leave management.

### Frontend

The React frontend is currently in development.

## Future Improvements

Possible future improvements include:

- Production deployment
- Automated testing
- Notifications
- Additional reporting features
- Further frontend improvements

## Author

Brazesh Guragain
