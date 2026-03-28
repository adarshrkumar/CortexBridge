# Possible Routes

## Auth

- `/login` — sign in
- `/logout` — sign out
- `/register` — create account

## Dashboard

- `/` — overview / home dashboard

## Orgs

- `/orgs` — list orgs
- `/orgs/new` — create org
- `/orgs/[org]` — org overview
- `/orgs/[org]/settings` — org settings (name, billing, danger zone)
- `/orgs/[org]/members` — manage members and roles

## Projects

- `/orgs/[org]/projects` — list projects in org
- `/orgs/[org]/projects/new` — create project
- `/orgs/[org]/projects/[project]` — project overview
- `/orgs/[org]/projects/[project]/settings` — project settings

## Instructions

- `/orgs/[org]/projects/[project]/instructions` — view/edit default instructions
- `/orgs/[org]/projects/[project]/instructions/[branch]` — view/edit branch-specific instructions

## Code Styles

- `/orgs/[org]/projects/[project]/styles` — view/edit default code style rules
- `/orgs/[org]/projects/[project]/styles/[branch]` — view/edit branch-specific style rules
