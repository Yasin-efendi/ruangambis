import { createRouter } from '@tanstack/react-router'

import { rootRoute } from '../routes/rootRoute'
import { indexRoute } from '../routes/indexRoute'
import { loginRoute } from '../routes/loginRoute'
import { dashboardRoute } from '../routes/dashboardRoute'

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
])

export const router = createRouter({
  routeTree,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}