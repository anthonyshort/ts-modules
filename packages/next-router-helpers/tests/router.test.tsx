import {createRouter} from '../src';
import {
  createMockNextRouter,
  replaceParameters,
  findParameters,
  routeToString,
} from '../src/helpers';

describe('Next router helpers', () => {
  describe('findParameters', () => {
    it('should find all of the params in a string', () => {
      expect(
        findParameters('/admin/producer-dashboard/[uuid]/page/[page]'),
      ).toEqual(['uuid', 'page']);
      expect(findParameters('/admin/producer-dashboard/[uuid]')).toEqual([
        'uuid',
      ]);
      expect(findParameters('/admin/producer-dashboard/')).toEqual([]);
    });
  });

  describe('replaceParameters', () => {
    it('should return the original string if there are no params', () => {
      expect(replaceParameters('/admin/producer-dashboard')).toBe(
        '/admin/producer-dashboard',
      );
      expect(replaceParameters('/admin/producer-dashboard/[uuid]')).toBe(
        '/admin/producer-dashboard/[uuid]',
      );
      expect(replaceParameters('/admin/producer-dashboard/[uuid]', {})).toBe(
        '/admin/producer-dashboard/[uuid]',
      );
    });
    it('should replace params if they exist', () => {
      const result = replaceParameters(
        '/admin/producer-dashboard/[page]/[uuid]',
        {
          uuid: '1',
          unused: '2',
        },
      );
      expect(result).toBe('/admin/producer-dashboard/[page]/1');
    });
  });

  describe('routeToString', () => {
    it('should use the basePath', () => {
      const router = createMockNextRouter({
        pathname: '/',
        basePath: '/foo',
      });
      const href = routeToString(router, {
        pathname: '/bar',
      });
      expect(href).toBe('/foo/bar');
    });
    it('should NOT use the basePath', () => {
      const router = createMockNextRouter({
        pathname: '/',
      });
      const href = routeToString(router, {
        pathname: '/bar',
      });
      expect(href).toBe('/bar');
    });
  });

  describe('pushRoute', () => {
    it('should call router push', async () => {
      const nextRouter = createMockNextRouter({
        pathname: '/',
      });
      const router = createRouter(nextRouter);
      const spy = jest.spyOn(nextRouter, 'push');
      await router.pushRoute(
        {
          pathname: '/admin/producer-dashboard/[uuid]',
          query: {
            uuid: '1',
            tab: 'requests',
          },
        },
        {
          shallow: true,
        },
      );
      expect(spy).toHaveBeenCalled();
      expect(spy).toHaveBeenLastCalledWith(
        {
          pathname: '/admin/producer-dashboard/[uuid]',
          query: {
            uuid: '1',
            tab: 'requests',
          },
        },
        {
          pathname: '/admin/producer-dashboard/1',
          query: {
            tab: 'requests',
          },
        },
        {
          shallow: true,
        },
      );
    });
  });
});
