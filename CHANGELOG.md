# Changelog

All notable changes to Mission Control will be documented in this file.

## [1.0.0] - 2026-02-27

### Added
- Initial release
- Dashboard with agent status grid
- Task board with Kanban and list views
- Memory search with FTS5
- Calendar integration
- Cron job monitoring
- Dark mode theme
- Responsive design
- Docker deployment
- Static export support
- 27 E2E tests
- 25 API tests
- Complete documentation

### Components
- `Sidebar` — Navigation with badges
- `Breadcrumbs` — Dynamic breadcrumb trail
- `TaskDetailModal` — Full task view
- `SearchBar` — Debounced search input
- `SearchResults` — Virtualized result list
- `AgentStatusGrid` — Visual agent cards
- `MetricsWidgets` — Stats display
- `HealthIndicators` — Status badges
- `AlertBanner` — Failure notifications

### API Endpoints
- `/api/v1/tasks` — Task CRUD
- `/api/v1/memory/search` — FTS5 search
- `/api/v1/agents` — Agent status
- `/api/v1/system/status` — Health check
- `/api/v1/calendar/events` — Calendar
- `/api/v1/cron/jobs` — Cron management
- `/api/v1/sync/*` — Data sync

### Features
- Real-time agent status updates
- Drag-and-drop task management
- Deep linking for shareable views
- Mobile-friendly responsive design
- Accessibility support
- Performance monitoring

### Documentation
- README with quick start
- SETUP.md — Installation guide
- CUSTOMIZATION.md — Widget development
- API.md — Backend reference
- CONTRIBUTING.md — Contribution guidelines

### Deployment
- Docker support with docker-compose
- PM2 production setup
- Vercel deployment
- Railway deployment
- Static export for any host

---

## Future Releases

### [1.1.0] - Planned

- WebSocket real-time updates
- Custom theme builder
- Widget marketplace
- Plugin system
- Multi-language support

### [1.2.0] - Planned

- Mobile app
- Advanced analytics
- Team collaboration features
- Audit logs
- Backup/restore UI

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — Breaking changes
- **MINOR** — New features, backward compatible
- **PATCH** — Bug fixes, backward compatible

---

[1.0.0]: https://github.com/openclaw/mission-control/releases/tag/v1.0.0
