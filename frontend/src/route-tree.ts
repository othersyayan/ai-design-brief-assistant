import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as projectRoute } from './routes/projects/$projectId';

export const routeTree = rootRoute.addChildren([
  indexRoute as never,
  projectRoute as never,
]);
