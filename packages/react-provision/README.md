# react-provision

Create and compose context-based services in your React apps.

## Example

First create your providers:

```jsx
import { createStaticProvider } from "react-provision";
import { Analytics } from "analytics";
import axios from "axios";
import { createLogger } from "@company/logger";

export const AnalyticsProvider = createStaticProvider(
  Analytics({
    app: "Test",
  }),
);

const HttpProvider = createStaticProvider(
  axios.create({
    baseURL: "/api",
  }),
);
```

Then composes them all together and add them to your app.

```jsx
import { createContainer } from "react-provision";
import { AnalyticsProvider, HttpProvider } from "./lib/providers";

const Providers = createContainer([AnalyticsProvider, HttpProvider]);

export function App(props: Props) {
  const { children } = props;
  return <Providers>{children}</Provider>;
}
```

Then access the values of the providers.

```jsx
import { useProvider } from "react-provision";
import { AnalyticsProvider, HttpProvider } from "./lib/providers";

function MyComponent() {
  const analytics = useProvider(AnalyticsProvider);
  const http = useProvider(HttpProvider);
}
```

## Benefits

- Removes the need for third-party libraries to create their own context providers/
- No need for a dependency injection framework to access services throughout your application.
- Removes the ceremony needed to setup providers and hooks.

## Goals

- Make it easy to create and manage services through composition.
- Provide a set of services for common use cases, like logging, analytics, notifications, and more.
- Make it easier to create single page applications with Next.js and React.
