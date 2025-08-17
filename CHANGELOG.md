# Changelog

## [Unreleased]

### 🐛 Fixed - 2025-08-17 08:01:00 UTC

- **🔧 Dashboard Navigation: Fixed nested router-outlet issue**
  - **Files**: src/app/dashboard/project/index-project/index-project.component.html (L1-18 → L1-3)
  - **Result**: Resolved duplicate sidebar and navigation appearing when clicking Projects link. The index-project component was incorrectly including its own sidebar and top-nav components while being rendered inside the main dashboard layout, causing a nested dashboard appearance.

### 🐛 Fixed - 2025-08-17 08:04:00 UTC

- **🔧 Dashboard Routing: Added missing authorities route**
  - **Files**: src/app/dashboard/dashboard-routing.module.ts (L8-9, L25-30)
  - **Result**: Fixed the Public Authorities link in the sidebar that was not loading. Added the authorities route configuration with proper admin guard protection.