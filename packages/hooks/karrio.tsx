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

export const ClientProvider = ({
  children,
  ...pageData
}: ClientProviderProps): JSX.Element => {
  const { getHost, references } = useAPIMetadata();
  const {
    query: { data: session },
  } = useSyncedSession();
  const updateClient = (ref: any, session: any) => ({
    ...setupRestClient(getHost(), session),
    isAuthenticated: !!session?.accessToken,
    pageData,
  });

  if (!getHost || !getHost() || !session) return <></>;

  return (
    <APIClientsContext.Provider value={updateClient(references, session)}>
      {children}
    </APIClientsContext.Provider>
  );
};

export function useKarrio(): APIClientsContextProps {
  const context = React.useContext(APIClientsContext);
  if (!context) {
    throw new Error("useKarrio must be used within a ClientProvider");
  }

  // Check if the graphql client is missing and set it up if necessary
  if (!context.graphql) {
    if (!context.host || !context.session) {
      throw new Error("Context is missing host or session");
    }
    const updatedClient = setupRestClient(context.host, context.session);
    context.graphql = updatedClient.graphql;
  }

  console.log('context and that', context);
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

export function setupRestClient(host: string, session?: SessionType): KarrioClient {
  const client = new KarrioClient({ basePath: url$`${host || ""}` });
  console.log('this is the client', client, host);

  client.interceptors.request.use(requestInterceptor(session));
  client.graphql = new GraphQLClient({ endpoint: `${host}/graphql` });

  console.log("Initialized RestClient:", { client, session, host });

  return client;
}