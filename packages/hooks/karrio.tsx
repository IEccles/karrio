"use client";

import React, { useState, useEffect} from "react";
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
import { GraphQLClient } from 'graphql-request';

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

export function useKarrio(): APIClientsContextProps {
  const creation = React.createContext(APIClientsContext)
  const context = React.useContext(creation);

  // If context is missing host or session, set them up
  if (!context.host) {
    const host = 'https://karrio.invente.co.uk'
    console.log('Fetched host:', host);
    if (!host) {
      throw new Error("Context is missing host, and it cannot be created");
    }
    context.host = host;
  }

  // Check if the graphql client is missing and set it up if necessary
  if (!context.graphql) {
    const updatedClient = setupRestClient(context.host);
    context.graphql = updatedClient.graphql;
  }

  return context;
}

function requestInterceptor(session?: SessionType) {
  return (config: any = { headers: {} }) => {
    const testHeader: any = !!session?.testMode
      ? { "x-test-mode": session.testMode }
      : {};
    const authHeader: any = !!session?.accessToken
      ? { authorization: `Bearer ${session.accessToken}` }
      : {};
    const orgHeader: any = !!session?.orgId
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

export function setupRestClient(host: string, session?: SessionType): GraphQLClient {
  const headers: any = {};

  if (session?.testMode) {
    headers['x-test-mode'] = session.testMode;
  }
  if (session?.accessToken) {
    headers['authorization'] = `Bearer ${session.accessToken}`;
  }
  if (session?.orgId) {
    headers['x-org-id'] = getCookie('orgId');
  }

  const endpoint = `${host}/graphql`;
  console.log('setupRestClient: Initializing GraphQLClient with endpoint:', endpoint);

  const client = new GraphQLClient(endpoint, {
    headers,
  });

  console.log('setupRestClient: Initialized GraphQLClient:', { client, session, host });

  return client;
}