import {useMemo} from 'react';

interface PromiseState {
  error?: unknown;
  response?: unknown;
}

const cache = new WeakMap<Promise<unknown>, PromiseState>();

export function usePromise<T>(promise: Promise<T>): T {
  const promiseState = cache.get(promise);

  // Existing promise
  if (promiseState) {
    if (promiseState.error) {
      throw promiseState.error;
    }

    if (promiseState.response) {
      return promiseState.response as T;
    }

    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw promise;
  }

  // New promise
  const state: PromiseState = {};
  cache.set(promise, state);

  promise
    .then((result) => {
      state.response = result;
    })
    .catch((error) => {
      state.error = error;
    });

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw promise;
}

type AsyncFn<T> = (...args: unknown[]) => Promise<T>;

/**
 * Run a function that returns a promise. It will be re-run whenever the
 * arguments change.
 */
export function usePromiseFn<T>(fn: AsyncFn<T>, deps: unknown[]): T {
  const promise = useMemo(async () => fn(...deps), deps);
  return usePromise(promise);
}

interface ResolvePromiseProps<T> {
  promise: Promise<T>;
  children: (value: T) => JSX.Element;
}

export function ResolvePromise<T>(props: ResolvePromiseProps<T>) {
  const {promise, children} = props;
  const value = usePromise(promise);
  return children(value);
}
