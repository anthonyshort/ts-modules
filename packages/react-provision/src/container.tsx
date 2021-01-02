import React, {FunctionComponent, PropsWithChildren} from 'react';

interface Props {
  components: Array<React.FunctionComponent<PropsWithChildren<unknown>>>;
  children: React.ReactNode;
}

/**
 * Simple component that composes components together.
 */
export function Compose(props: Props): JSX.Element {
  const {components = [], children} = props;
  return (
    <>
      {
        // eslint-disable-next-line unicorn/no-array-reduce
        components.reduceRight((acc, Component) => {
          return <Component>{acc}</Component>;
        }, children)
      }
    </>
  );
}

/**
 * Create a container component that composes all of the sub-components together.
 */
export function createContainer(providers: FunctionComponent[]) {
  return (props: PropsWithChildren<unknown>): JSX.Element => {
    const {children} = props;
    return <Compose components={providers}>{children}</Compose>;
  };
}
