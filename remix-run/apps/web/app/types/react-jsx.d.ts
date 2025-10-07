import * as React from "react";

// Comprehensive fix for React 18 JSX compatibility
declare module "react" {
  namespace JSX {
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  // Override problematic types
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
    children?: ReactNode;
  }
  
  interface ReactPortal {
    key: Key | null;
    children: ReactNode;
  }
}

// Type overrides for Dynamic Labs components
declare module "@dynamic-labs/sdk-react-core" {
  export const DynamicContextProvider: React.ComponentType<any>;
  export const DynamicWidget: React.ComponentType<any>;
}

declare module "@dynamic-labs/wagmi-connector" {
  export const DynamicWagmiConnector: React.ComponentType<any>;
}

declare module "wagmi" {
  export const WagmiProvider: React.ComponentType<any>;
}

declare module "@remix-run/react" {
  export const Outlet: React.ComponentType<any>;
  export const RemixServer: React.ComponentType<any>;
  export const RemixBrowser: React.ComponentType<any>;
}

export {};
