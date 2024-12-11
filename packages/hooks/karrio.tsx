"use client";

import React, {useState, useEffect} from "react";
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
import { getSession } from "next-auth/react";

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

  if (!getHost || !session) {
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
      host: getHost(),
      session,
    };
    console.log("Updated Client Context:", client);
    return client;
  };

  const contextValue = updateClient(references, session);

  console.log("ClientProvider: contextValue", contextValue);

  return (
    <APIClientsContext.Provider value={contextValue}>
      {children}
    </APIClientsContext.Provider>
  );
};

export async function useKarrio(): APIClientsContextProps {
  const creation = React.createContext(APIClientsContext)
  const context = React.useContext(creation);
  const { getHost } = useAPIMetadata();
  const [session, setSession] = useState<SessionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await getSession();
        setSession(sessionData as SessionType);
        console.log('Fetched session data:', sessionData);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  if (loading) {
    return context; // or return a loading state
  }

  if (!session) {
    throw new Error("Failed to fetch session data");
  }

  console.log('session', session);
  console.log("useKarrio: context", context);

  // If context is missing host or session, set them up
  if (!context.host || !context.session) {
    if (!getHost || !session) {
      throw new Error("Context is missing host or session, and they cannot be created");
    }
    context.host = getHost();
    context.session = session;
  }

  // Check if the graphql client is missing and set it up if necessary
  if (!context.graphql) {
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
  console.log("GraphQL Client:", client.graphql);

  return client;
}