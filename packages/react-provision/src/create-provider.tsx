import React, {FunctionComponent, PropsWithChildren, useContext} from 'react';
import {ResolvePromise} from './use-promise';
import isPromise from 'is-promise';

type ContextValueFactory<ContextType> = () =>
  | Promise<ContextType>
  | ContextType;

export interface Provider<ContextType> extends FunctionComponent {
  context?: React.Context<ContextType | null>;
  displayName: string;
}

export interface ProviderOptions<ContextType> {
  name?: string;
  context?: React.Context<ContextType | null>;
}

function isContextFactory<ContextType>(
  value: unknown,
): value is ContextValueFactory<ContextType> {
  return typeof value === 'function';
}

/**
 * Create a new provider that can be access throughout the application. If a promise is returned we need to wrap
 * it in another component so that when we throw the promise the component state isn't lost.
 */
export function createProvider<ContextType>(
  getContextValue:
    | ContextValueFactory<ContextType>
    | ContextType
    | Promise<ContextType>,
  providerOptions: ProviderOptions<ContextType> = {},
): Provider<ContextType> {
  const {name, context} = providerOptions;
  const Context = context ?? React.createContext<ContextType | null>(null);

  const Provider: Provider<ContextType> = (props) => {
    const {children} = props;
    const value = isContextFactory(getContextValue)
      ? getContextValue()
      : getContextValue;

    if (isPromise(value)) {
      return (
        <ResolvePromise promise={value}>
          {(value) => (
            <Context.Provider value={value}>{children}</Context.Provider>
          )}
        </ResolvePromise>
      );
    }

    return <Context.Provider value={value}>{children}</Context.Provider>;
  };

  Provider.displayName = name ?? 'Provider';
  Provider.context = Context;
  return Provider;
}

/**
 * Mock a provider and set a dummy value on the context.
 */
export function mockProvider<T>(
  provider: Provider<T>,
  value: T,
): FunctionComponent {
  if (!provider.context) {
    throw new Error(
      `Context value not set on provider: ${provider.displayName}`,
    );
  }

  const {Provider} = provider.context;
  return (props: PropsWithChildren<unknown>) => {
    const {children} = props;
    return <Provider value={value}>{children}</Provider>;
  };
}

/**
 * Access the context value of a provider.
 */
export function useProvider<T>(provider: Provider<T>): T {
  if (!provider.context) {
    throw new Error(
      `Context value not set on provider: ${provider.displayName}.`,
    );
  }

  const value = useContext(provider.context);
  if (!value) {
    throw new Error('Provider not added to the root of the application.');
  }

  return value;
}
