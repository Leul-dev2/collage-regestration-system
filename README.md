# AAU Registration System

![Daily Auto Commit](https://github.com/Leul-dev2/collage-regestration-system/actions/workflows/daily.yml/badge.svg)
![Commit Activity](https://img.shields.io/github/commit-activity/m/Leul-dev2/collage-regestration-system?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/Leul-dev2/collage-regestration-system?style=for-the-badge)

> A production-quality university admission platform with a modern daily auto-commit workflow, developer productivity tracking, and polished documentation.

<!--AUTO_UPDATE_MARKER-->Last auto update: 2026-06-28T13:49:18Z<!--AUTO_UPDATE_MARKER_END-->

## What this repo includes

- Professional **GitHub Actions** daily auto-commit system (`.github/workflows/daily.yml`)
- A `daily-log.md` file that receives timestamped daily entries and programming quotes
- A polished, readable project overview and developer setup guide
- Support for **dark/light-friendly** markdown with clean badges and icon-based sections
- Optional guidance for logging **coding progress** and **LeetCode practice**

## Daily Dev Log

The `daily-log.md` file is updated automatically every day by GitHub Actions.
It is designed for:

- recording daily progress summaries
- tracking sprint work
- logging LeetCode or coding practice
- keeping the GitHub contribution graph active

### Open the daily log

- `daily-log.md`

### Suggested daily entry format

- **Date**: YYYY-MM-DD
- **Focus area**: feature, bug, architecture
- **What I shipped**
- **What I learned**
- **LeetCode / skills**
- **Next action**

## Commit Statistics

![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Leul-dev2/collage-regestration-system?style=flat-square)

This repository tracks activity through daily automated commits and manual contributions.

## Contribution Trail

![GitHub contribution chart](https://ghchart.rshah.org/6e5494/Leul-dev2)

A daily workflow helps maintain a steady contributions footprint and keeps this repo active.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Leul-dev2/collage-regestration-system.git
cd collage-regestration-system
```

### 2. Install dependencies

This repository contains a backend and frontend workspace.

#### Backend

```bash
cd apps/backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Configure environment variables

Copy the example env file for each app and configure the values.

```bash
cd apps/backend
cp .env.example .env
cd ../frontend
cp .env.example .env.local
```

### 4. Run the services

```bash
cd apps/backend
npm run dev
```

```bash
cd apps/frontend
npm run dev
```

### 5. Enable GitHub Actions

The daily workflow is already configured in `.github/workflows/daily.yml`.
Push this repository to GitHub and Actions will run daily at 12:00 UTC.

## How the workflow works

- Runs automatically every day via cron
- Supports manual execution through `workflow_dispatch`
- Checks out the repository with full history
- Appends a new entry to `daily-log.md`
- Updates `README.md` with the latest timestamp
- Commits only when there are actual changes
- Pushes the update back to the default branch

## Optional progress tracker

Track your daily coding or LeetCode progress in `daily-log.md` using one of these sections:

- `Coding Progress`
- `Problem Solving`
- `Learning Notes`

You can also create a custom `progress/leetcode.md` file and link it here.

## Project architecture

```
apps/
  backend/   # Express + Prisma + PostgreSQL API
  frontend/  # Next.js 16 + Tailwind CSS + React
```

## Notes

- The workflow uses `contents: write` permission to commit and push updates safely.
- The auto-update marker in this README is rewritten each run.
- The repository is ready to appear professional with daily activity and clear developer documentation.
