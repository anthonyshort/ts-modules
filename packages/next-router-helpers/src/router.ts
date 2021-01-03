import {NextRouter} from 'next/router';
import {
  ClickHandler,
  CreateMockRouterOptions,
  Link,
  Route,
  RouteOptions,
  Router,
} from './types';
import {
  routeToString,
  findParameters,
  navigate,
  wantsNewTab,
  createMockNextRouter,
} from './helpers';

/**
 * Wrap the next router to provide helper functions that use Route objects instead of strings.
 * @param router NextRouter
 */
export function createRouter(router: NextRouter) {
  return new RouterHelpers(router);
}

/**
 * Create a mock next router and return RouterHelpers that can be used in tests.
 * @param options CreateMockRouterOptions
 */
export function createMockRouter(options: CreateMockRouterOptions) {
  const nextRouter = createMockNextRouter(options);
  return new RouterHelpers(nextRouter);
}

class RouterHelpers implements Router {
  nextRouter: NextRouter;

  constructor(router: NextRouter) {
    this.nextRouter = router;
  }

  /**
   * Get a value from the router.query and set it's type.
   * @param router Next router
   * @param key Query value
   */
  query<T>(key: string): T {
    return (this.nextRouter.query[key] as unknown) as T;
  }

  /**
   * Get a route parameter. This will throw if the route parameter doesn't exist.
   * @param key
   */
  param<T = string>(key: string): T {
    const parameters = findParameters(this.nextRouter.route);
    if (!parameters.includes(key)) {
      throw new Error(
        `The current page route does not contain the parameter "${key}". Did you mispell it?`,
      );
    }

    const value = this.query<T | undefined>(key);
    if (!value) {
      throw new Error(`Route parameter "${key}" doesn’t exist`);
    }

    return value;
  }

  /**
   * Prefetch a route object
   * @param route Route
   */
  async prefetch(route: Route) {
    return this.nextRouter.prefetch(route.pathname);
  }

  /**
   * Calls router.push with a route object. This will automatically generate the href and as params.
   *
   *    const router = useRouter();
   *    pushRoute(router, {
   *      pathname: '/admin/producer-dasboard/[uuid]',
   *      query: {
   *        uuid: '1',
   *        tab: 'requests'
   *      }
   *    })
   *
   * @param route The route information
   */
  async pushRoute(route: Route, options?: RouteOptions) {
    return navigate(this.nextRouter, route, 'push', options);
  }

  /**
   * Calls router.replace with a route object. This will automatically generate the href and as params.
   *
   *    const router = useRouter();
   *    pushRoute(router, {
   *      pathname: '/admin/producer-dasboard/[uuid]',
   *      query: {
   *        uuid: '1',
   *        tab: 'requests'
   *      }
   *    })
   *
   * @param route The route information
   */
  async replaceRoute(route: Route, options?: RouteOptions) {
    return navigate(this.nextRouter, route, 'replace', options);
  }

  /**
   * Create a link object that can be used in anchors and buttons.
   * @param route Route object
   * @param options Route options
   */
  createLink(route: Route, options?: RouteOptions): Link {
    return {
      isActive: this.isRouteActive(route),
      push: async () => this.pushRoute(route, options),
      replace: async () => this.replaceRoute(route, options),
      onClick: this.createClickHandler(route),
      href: routeToString(this.nextRouter, route),
    };
  }

  /**
   * Create a string that can be used as a href on an anchor from a route object
   * @param route Route object
   */
  createHref(route: Route) {
    return routeToString(this.nextRouter, route);
  }

  /**
   * Create a click handler to navigate to a route that can be used on buttons and anchors.
   * @param route Route object
   * @param options Route options
   */
  createClickHandler(route: Route, options?: RouteOptions): ClickHandler {
    return async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (wantsNewTab(event)) return;
      event.preventDefault();
      await this.pushRoute(route, options);
    };
  }

  /**
   * Check if a route is currently active.
   * @param route Route object
   */
  isRouteActive(route: Route) {
    return this.nextRouter.route.startsWith(route.pathname);
  }
}
