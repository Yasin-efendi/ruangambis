import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'
import { DashboardPage } from '../pages/dashboard/DashboardPage'

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})