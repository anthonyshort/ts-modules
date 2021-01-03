import url from 'url';
import {NextRouter} from 'next/router';
import {Query, Route, CreateMockRouterOptions, RouteOptions} from './types';
import {EventEmitter} from 'events';

const noop = (): void => undefined;

function omit(object: Record<string, string>, properties: string[]) {
  const keys = Object.keys(object);
  const response: Record<string, string> = {};
  for (const key of keys) {
    const value = object[key];
    if (!properties.includes(key)) {
      response[key] = value;
    }
  }

  return response;
}

/**
 * Get all of the matches within a string
 * @param regex Any regex object
 * @param str A string to find the matches in
 * @param matches Internal argument to build the matches
 */
function findMatches(
  regex: RegExp,
  string: string,
  matches: string[] = [],
): string[] {
  const response = regex.exec(string);
  const match = response && response[1]!;
  if (match) {
    matches.push(match);
    findMatches(regex, string, matches);
  }

  return matches;
}

/**
 * Find all matching params within a string
 * @param pathname The url with [:id] type params
 */
export function findParameters(pathname: string): string[] {
  return findMatches(/\[([a-zA-Z\d]+)]/g, pathname);
}

/**
 * Returns a new query object without the values of the params
 * @param pathname The url with params
 * @param query Object of params
 */
export function removeParameters(pathname: string, query: Query): Query {
  return omit(query, findParameters(pathname));
}

/**
 * Replace all params within a url with values from an object
 * @param str
 * @param params
 */
export function replaceParameters(string: string, parameters?: Query): string {
  if (!parameters) return string;
  let pathname = string;
  Object.keys(parameters).forEach((key) => {
    const value = parameters[key];
    pathname = pathname.replace(`[${key}]`, value);
  });
  return pathname;
}

/**
 * Take a route with a pathname and optional query and turn it into a real path.
 * This will also replace any params, like [:id], within the string
 * @param route The route to transform into a string
 */
export function routeToString(
  router: Pick<NextRouter, 'basePath'>,
  route: Route,
): string {
  const {pathname, query = {}} = route;
  const {basePath = ''} = router;

  return url.format({
    pathname: `${basePath}${replaceParameters(pathname, query)}`,
    query: removeParameters(pathname, query),
  });
}

/**
 * When a user clicks a link determine if they're trying to open in a new tab.
 * @param event
 */
export function wantsNewTab(event: any): boolean {
  const {nodeName} = event.currentTarget;
  const target = event.currentTarget.getAttribute('target');

  // HTML target attribute
  if (target && target !== '_self') {
    return true;
  }

  // ignore click for new tab / new window behavior
  // https://github.com/zeit/next.js/blob/canary/packages/next/client/link.tsx#L140
  if (
    nodeName === 'A' &&
    (event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      (event.nativeEvent && event.nativeEvent.which === 2))
  ) {
    return true;
  }

  return false;
}

/**
 * This function creates a mock NextRouter object that can be used in tests and stories. Just call createMockRouter
 * with a pathname and an optional query object. This will return a plain object with the same
 * shape as NextRouter.
 *
 * You can spy on this router in tests by using `jest.spyOn(router, 'push')`. This will let you assert that the router
 * was correctly called using `expect(router.push).toHaveBeenCalledWith(...)`.
 *
 *    const router = createMockRouter({
 *      pathname: '/admin/producer-dashboard/requests/[uuid]',
 *      query: {
 *        uuid: 'sdfsdf'
 *      }
 *    })
 *
 * You can use this as a replacement for the router in <RouterProvider> to set the router on React's context.
 * @param options
 */
export function createMockNextRouter(
  options: CreateMockRouterOptions,
): NextRouter {
  const {pathname, query = {}, basePath = ''} = options;

  return {
    pathname,
    isFallback: false,
    basePath,
    query,
    asPath: routeToString(
      {basePath: ''},
      {
        pathname,
        query,
      },
    ),
    route: pathname,
    back: noop,
    beforePopState: noop,
    push: async () => Promise.resolve(true),
    replace: async () => Promise.resolve(true),
    reload: noop,
    prefetch: async () => Promise.resolve(),
    events: new EventEmitter(),
  };
}

/**
 * Calls router.push or router.replace
 */
export async function navigate(
  router: NextRouter,
  route: Route,
  type: 'push' | 'replace',
  options?: RouteOptions,
): Promise<boolean> {
  const {pathname, query} = route;
  const queryWithoutParameters = omit(query || {}, findParameters(pathname));
  const shouldScroll = pathname.includes('#');
  const success = await router[type](
    {
      pathname,
      query,
    },
    {
      pathname: replaceParameters(pathname, query),
      query: queryWithoutParameters,
    },
    options,
  );
  if (success && shouldScroll) {
    window.scrollTo(0, 0);
    document.body.focus();
  }

  return success;
}
