export type Query = Record<string, string>;

/**
 * This represents a "route" within next. The pathname can contain params, like [:uuid]
 * and the query is optional. The values for the params exist as part of the query.
 *
 *      const route: Route = {
 *        pathname: '/admin/producer-dasboard/[uuid]',
 *        query: {
 *          uuid: '1',
 *          tab: 'requests'
 *        }
 *      }
 *
 * This format is used by most of the router helpers.
 */
export interface Route {
  pathname: string;
  query?: Query;
}

export interface CreateMockRouterOptions {
  pathname: string;
  asPath?: string;
  query?: Record<string, string>;
  basePath?: string;
}

export interface RouteOptions {
  shallow?: boolean;
}

export type ClickHandler = (
  event: React.MouseEvent<HTMLElement, MouseEvent>,
) => void;

export interface Link {
  isActive: boolean;
  push: () => Promise<boolean>;
  replace: () => Promise<boolean>;
  onClick: ClickHandler;
  href: string;
}

export interface Router {
  query<T>(key: string): T;
  param<T = string>(key: string): T;
  prefetch(route: Route): Promise<void>;
  pushRoute(route: Route, options?: RouteOptions): Promise<boolean>;
  replaceRoute(route: Route, options?: RouteOptions): Promise<boolean>;
  createLink(route: Route, options?: RouteOptions): Link;
  createHref(route: Route): string;
  createClickHandler(route: Route, options?: RouteOptions): ClickHandler;
  isRouteActive(route: Route): boolean;
}
