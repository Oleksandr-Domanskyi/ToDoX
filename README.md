# ToDoX — Architecture Documentation

## View
<h3 align="center">Plan Page</h3>
<img width="1280" height="636" alt="image" src="https://github.com/user-attachments/assets/355f2a6e-4e3c-4b32-b4a0-665451eb3e2e" />

<h3 align="center">Home Page</h3>
<img width="1915" height="853" alt="image" src="https://github.com/user-attachments/assets/8fa3e2a3-a5c5-455e-95c1-b8f718162341" />

<h3 align="center">Edit Mode</h3>
<img width="1280" height="402" alt="image" src="https://github.com/user-attachments/assets/49317708-cda4-40a1-9a6e-c4d554ea5c0b" />


## 1. System Purpose

ToDoX is a modular system for managing plans and tasks with support for
rich task descriptions using blocks (text, image, checklist, code). The
architecture is split into independent backend modules and a frontend
application built with Next.js, connected via strict API contracts.

The system provides:

-   A multi-module backend with CQRS and Clean Architecture
-   A Next.js frontend (App Router) with a feature-based structure
-   A unified task block format shared between backend and frontend

------------------------------------------------------------------------

## 2. Overall Architecture Overview

### 2.1 Logical Diagram

    [ Next.js Frontend ]
            |
            |  HTTP / JSON
            v
    [ ToDoX.API (Gateway) ]
            |
            +--> Account Module (Identity, Auth)
            |
            +--> Plans Module (Plans, Tasks, Blocks)

### Principles

-   The frontend is unaware of backend internals and communicates only
    via HTTP contracts
-   The backend is split into modules with dedicated layers:
    API → Application → Core → Infrastructure
-   All dependencies point inward (Dependency Inversion)

------------------------------------------------------------------------

## 3. Backend --- General Architecture

### 3.1 Backend Structure

    Backend
     ├── Modules
     │    ├── AccountModule
     │    │    ├── Account.API
     │    │    ├── Account.Application
     │    │    ├── Account.Core
     │    │    └── Account.Infrastructure
     │    ├── PlansModule
     │    │    ├── Plans.API
     │    │    ├── Plans.Application
     │    │    ├── Plans.Core
     │    │    └── Plans.Infrastructure
     │    └── SharedModules
     │         └── ToDoX.Infrastructure
     └── ToDoX.API (composition root)

Each module is an isolated vertical slice:

-   API --- HTTP endpoints
-   Application --- CQRS, MediatR, validation
-   Core --- domain model
-   Infrastructure --- EF Core, repositories, Identity

------------------------------------------------------------------------

### 3.2 Request Flow

    HTTP → Endpoint → Command/Query → MediatR → Handler
         → Domain/Core → Infrastructure → Result → HTTP Response

Errors are returned via `FluentResults.Result` and mapped to HTTP status
codes in the API layer.

------------------------------------------------------------------------

## 4. Account Module --- Authentication and Users

### 4.1 Purpose

The Account Module is responsible for:

-   User registration
-   Login and refresh tokens
-   Profile management
-   Authorization policies

------------------------------------------------------------------------

### 4.2 API Contracts

Base path: `/account`

| Method | URL               | Purpose           |
|--------|-------------------|-------------------|
| POST   | /account/login    | Authentication    |
| POST   | /account/refresh  | Token refresh     |
| GET    | /account/by-email | Get user by email |
| POST   | /account          | Create user       |
| PUT    | /account/{id}     | Update profile    |
| DELETE | /account          | Delete user       |

------------------------------------------------------------------------

### 4.3 Application Layer Architecture

CQRS is used:

-   Each operation is a Command or Query
-   Validation is executed via the MediatR pipeline

Example:

    AccountEndpoint → LoginCommand → LoginHandler → UserRepositoryServices

------------------------------------------------------------------------

### 4.4 Domain Entities

#### User

Extends `IdentityUser`.

Fields:

-   RegisteredAtUtc
-   LastUpdatedAtUtc
-   accountImage : UserImage

The `UserImage` value object encapsulates the image URL.

------------------------------------------------------------------------

### 4.5 Security

-   Bearer Token Authentication
-   Authorization policies:
    -   RequireAdmin --- Admin role
    -   User --- Default / Pro / Business subscription
    -   PaidUser --- Pro / Business

Passwords:

-   Minimum 12 characters\
-   Upper, Lower, Digit, NonAlphanumeric required

------------------------------------------------------------------------

## 5. Plans Module --- Plans and Tasks

### 5.1 Purpose

The Plans Module provides:

-   CRUD for Plan
-   CRUD for Task
-   Task block support
-   Block structure validation

------------------------------------------------------------------------

### 5.2 API Contracts

#### Plans

  | Method | URL                  |
|--------|----------------------|
| GET    | `/plans`             |
| GET    | `/plans/{id}`        |
| POST   | `/plans/Create`      |
| PUT    | `/plans/Update`      |
| DELETE | `/plans/Delete/{id}` |

#### Tasks

| Method | URL                                           |
|--------|-----------------------------------------------|
| GET    | `/plans/{planId}/tasks`                       |
| GET    | `/plans/{planId}/tasks/{id}`                  |
| POST   | `/plans/{planId}/tasks/Create`                |
| PUT    | `/plans/{planId}/tasks/{taskId}/Update`      |
| DELETE | `/plans/{planId}/tasks/{taskId}/Delete`      |


------------------------------------------------------------------------

### 5.3 Domain Entities

#### PlanEntity

Fields:

-   Id
-   Name
-   Description
-   Tasks
-   CreatedAt
-   UpdatedAt

------------------------------------------------------------------------

#### TaskEntity

Fields:

-   Id
-   PlanId
-   Title
-   IsCompleted
-   Blocks
-   CreatedAt
-   UpdatedAt

Domain methods:

-   AddTextBlock
-   AddImageBlock
-   AddCheckListBlock
-   AddCodeBlock
-   RemoveBlockAt

------------------------------------------------------------------------

### 5.4 Task Block Model

All blocks inherit from `TaskDescriptionBlock`.

Supported types:

-   text
-   image
-   checklist
-   code

Common fields:

-   Order --- list order
-   Row --- grid row
-   Position --- left | right | full

JSON example:

``` json
{
  "type": "text",
  "Row": 0,
  "Position": "full",
  "Order": 0,
  "richTextJson": "{...}"
}
```

------------------------------------------------------------------------

### 5.5 TaskBlockUpdater

Domain service.

Algorithm:

1.  Deletes all existing task blocks
2.  Recreates blocks from DTO

Purpose:

-   Guarantee deterministic ordering
-   Eliminate block state desynchronization

------------------------------------------------------------------------

## 6. Frontend --- General Architecture

### 6.1 Technology Stack

-   Next.js (App Router)
-   TypeScript
-   TanStack React Query
-   TipTap Rich Text
-   dnd-kit (Drag & Drop)

------------------------------------------------------------------------

### 6.2 Project Structure

    app/
    features/
    shared/

Feature-based architecture:

-   each business domain has its own api, model, and ui

------------------------------------------------------------------------

## 7. Frontend --- Backend Integration

### 7.1 HTTP Client

`shared/api/http.ts`

-   Base URL: `NEXT_PUBLIC_API_URL`
-   Unified error handling
-   All requests return strictly typed data

------------------------------------------------------------------------

### 7.2 React Query

-   Query keys:
    -   `["plans"]`
    -   `["plan", id]`
    -   `["tasks", planId]`
-   Invalidation after create / update / delete

------------------------------------------------------------------------

## 8. Rich Text and Code Subsystem

### 8.1 RichText

-   TipTap
-   JSON document serialized to string

Components:

-   RichTextEditor
-   RichTextViewer
-   ReadOnlyRichText

------------------------------------------------------------------------

### 8.2 Code Blocks

-   highlight.js
-   ts, js, csharp, json

Components:

-   CodeEditor
-   CodeViewer

------------------------------------------------------------------------

## 9. End-to-End Flow

### Task Creation

    UI → POST /plans/{planId}/tasks/Create
       → MediatR Command
       → Handler
       → EF Core
       → SaveChanges
       → invalidateQueries(["tasks", planId])

------------------------------------------------------------------------

### Task Update

    PUT /plans/{planId}/tasks/{taskId}/Update
    → Handler → TaskBlockUpdater
    → Full block rebuild
    → SaveChanges
    → invalidateQueries

------------------------------------------------------------------------

## 10. Architectural Guarantees

The system guarantees:

-   Isolation of backend modules
-   No Infrastructure leakage into Application
-   Strict DTO contracts between frontend and backend
-   Deterministic block model
-   Full state synchronization via React Query

------------------------------------------------------------------------

## 11. Future Improvements

1.  Add API versioning
2.  Add optimistic updates
3.  Extract blocks into a separate bounded context
4.  Add audit logs for task changes
5.  Add autosave

------------------------------------------------------------------------

## 12. Conclusion

ToDoX is a full-featured modular system with:

-   Clean backend architecture
-   Modern frontend with rich UI
-   A strict data model for tasks and blocks

This documentation describes the system as a single end-to-end flow:
from UI to the database.
