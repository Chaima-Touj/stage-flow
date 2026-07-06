# Progression — Dashboard Admin

> Suivi de l'avancement des sections du Dashboard Admin (structure validée dans `ANALYSE_DASHBOARD_ADMIN.md`, backend correspondant dans `BACKEND_ADMIN_RECAP.md`).

## Sections (sidebar `MENUS.admin`)

- [x] **Tableau de bord** — page réelle et connectée
- [ ] Utilisateurs — placeholder ("Section à venir")
- [ ] Formations — placeholder ("Section à venir")
- [ ] Demandes d'inscription — placeholder ("Section à venir")
- [ ] Inscriptions — placeholder ("Section à venir")
- [ ] Statistiques — placeholder ("Section à venir")
- [ ] Paramètres — placeholder ("Section à venir")

## Notes

- **Tableau de bord** : données **réelles**, pas mockées. La page (`client/src/pages/dashboard/AdminDashboard.jsx`) appelle `GET /api/admin/dashboard-stats` (`client/src/services/admin.service.js`) au montage, via l'instance `api` partagée du projet (token admin injecté automatiquement par l'intercepteur axios existant). Affiche : total étudiants, total formations, demandes en attente, inscriptions actives (4 stat-cards), l'évolution des inscriptions par mois (line chart Recharts) et la répartition des formations par niveau (donut chart Recharts). Réutilise intégralement les classes CSS et le thème déjà utilisés dans `StudentDashboard.jsx` (`sd-stat-card`, `sd-card`, `sd-empty-box`, `sd-skeleton`, variables `--primary`/`--bg-card`/`--border`), aucune nouvelle dépendance ajoutée.
- Toutes les routes `/dashboard/admin/*` sont protégées côté frontend par `ProtectedRoute` avec vérification du rôle (`role="admin"`) en plus de l'authentification, en cohérence avec la protection `authorize("admin")` déjà en place côté backend.
- Les 6 autres sections ne sont que des coquilles de navigation (route + `DashboardLayout` + message "Section à venir") — aucune logique métier n'y a encore été développée.
