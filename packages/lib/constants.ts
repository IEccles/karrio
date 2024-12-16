import { env } from "next-runtime-env";

// Public environment variables
export const BASE_PATH = (env("NEXT_PUBLIC_BASE_PATH") || "/").replace(
  "//",
  "/",
);
export const TEST_BASE_PATH = (BASE_PATH + "/test").replace("//", "/");
export const KARRIO_PUBLIC_URL = env("NEXT_PUBLIC_KARRIO_PUBLIC_URL");
export const MULTI_TENANT = Boolean(env("NEXT_PUBLIC_MULTI_TENANT"));
export const DASHBOARD_URL = env("NEXT_PUBLIC_DASHBOARD_URL");
export const DASHBOARD_VERSION = env("NEXT_PUBLIC_DASHBOARD_VERSION");

// Server-only environment variables
let KARRIO_URL: string | undefined;
let KARRIO_API: string | undefined;
let POSTHOG_KEY: string | undefined;
let POSTHOG_HOST: string | undefined;
let NEXTAUTH_SECRET: string | undefined;
let TENANT_ENV_KEY: string | undefined;
let KARRIO_ADMIN_URL: string | undefined;
let KARRIO_ADMIN_API_KEY: string | undefined;

if (typeof window === "undefined") {
  KARRIO_URL = env("KARRIO_URL") || env("KARRIO_HOSTNAME") || KARRIO_PUBLIC_URL;
  KARRIO_API = 'https://karrio.invente.co.uk';
  POSTHOG_KEY = env("POSTHOG_KEY") || env("NEXT_PUBLIC_POSTHOG_KEY");
  POSTHOG_HOST = env("POSTHOG_HOST") || env("NEXT_PUBLIC_POSTHOG_HOST");
  NEXTAUTH_SECRET = env("NEXTAUTH_SECRET") || env("JWT_SECRET");
  TENANT_ENV_KEY = env("TENANT_ENV_KEY");
  KARRIO_ADMIN_URL = env("KARRIO_ADMIN_URL");
  KARRIO_ADMIN_API_KEY = env("KARRIO_ADMIN_API_KEY");
} else {
  KARRIO_API = KARRIO_PUBLIC_URL;
  POSTHOG_KEY = env("NEXT_PUBLIC_POSTHOG_KEY");
  POSTHOG_HOST = env("NEXT_PUBLIC_POSTHOG_HOST");
}

export {
  KARRIO_URL,
  KARRIO_API,
  POSTHOG_KEY,
  POSTHOG_HOST,
  NEXTAUTH_SECRET,
  TENANT_ENV_KEY,
  KARRIO_ADMIN_URL,
  KARRIO_ADMIN_API_KEY,
};
