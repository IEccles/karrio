"use client";

import React from "react";
import {
  SessionType,
  KarrioClient,
  Metadata,
  UserType,
  GetWorkspaceConfig_workspace_config,
} from "@karrio/types";
import { get_organizations_organizations } from "@karrio/types/graphql/ee";
import { getCookie, KARRIO_API, logger, url$ } from "@karrio/lib";
import { useAPIMetadata } from "@karrio/hooks/api-metadata";
import { useSyncedSession } from "@karrio/hooks/session";

logger.debug("API clients initialized for Server: " + KARRIO_API);

type ClientProviderProps = {
  children?: React.ReactNode;
};
type APIClientsContextProps = KarrioClient & {
  isAuthenticated?: boolean;
  pageData?: {
    orgId?: string;
    user?: UserType;
    pathname?: string;
    metadata?: Metadata;
    organizations?: get_organizations_organizations[];
    workspace_config?: GetWorkspaceConfig_workspace_config;
  };
};

export const APIClientsContext = React.createContext<APIClientsContextProps>(
  {} as APIClientsContextProps
);

export const ClientProvider = ({ children }) => {
  const { getHost, references } = useAPIMetadata();
  const { query: { data: session } } = useSyncedSession();

  if (!getHost || !getHost() || !session) {
    console.error("Missing dependencies: getHost or session", {
      getHost: getHost?.(),
      session,
    });
    return <div>Loading...</div>; // Provide fallback UI
  }

  const updateClient = (ref, session) => {
    const client = {
      ...setupRestClient(getHost(), session),
      isAuthenticated: !!session?.accessToken,
      pageData,
    };
    console.log("Updated Client Context:", client);
    return client;
  };

  const contextValue = updateClient(references, session);

  return (
    <APIClientsContext.Provider value={contextValue}>
      {children}
    </APIClientsContext.Provider>
  );
};

export function useKarrio(): APIClientsContextProps {
  const context = React.useContext(APIClientsContext);

  if (!context || Object.keys(context).length === 0) {
    console.error("APIClientsContext is not properly initialized:", context);
    throw new Error(
      "useKarrio must be used within a ClientProvider. Ensure that your application is wrapped in <ClientProvider>."
    );
  }

  return context;
}

function requestInterceptor(session?: SessionType) {
  return (config: any = { headers: {} }) => {
    const testHeader: any = session?.testMode
      ? { "x-test-mode": session.testMode }
      : {};
    const authHeader: any = session?.accessToken
      ? { authorization: `Bearer ${session.accessToken}` }
      : {};
    const orgHeader: any = session?.orgId
      ? { "x-org-id": getCookie("orgId") }
      : {};

    config.headers = {
      ...config.headers,
      ...authHeader,
      ...orgHeader,
      ...testHeader,
    };

    return config;
  };
}

function setupRestClient(host: string, session?: SessionType): KarrioClient {
  const client = new KarrioClient({ basePath: url$`${host || ""}` });

  client.interceptors.request.use(requestInterceptor(session));
  client.graphql = new GraphQLClient({ endpoint: `${host}/graphql` });

  console.log("Initialized RestClient:", { client, session, host });

  return client;
}
