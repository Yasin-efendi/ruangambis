import { createRoute } from '@tanstack/react-router'

import { rootRoute } from './rootRoute'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>RuangAmbis</div>,
})