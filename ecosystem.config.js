module.exports = {
  apps: [
    {
      name: 'karrio-dashboard',
      script: 'npm',
      args: 'run dev',
      cwd: './apps/dashboard',
      env: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_DASHBOARD_URL: 'https://karrio.invente.co.uk',
        NEXT_PUBLIC_KARRIO_PUBLIC_URL: 'https://app.karrio.invente.co.uk',
      },
    },
    {
      name: 'karrio-api',
      script: 'npm',
      args: 'run dev',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'development',
        NEXT_PUBLIC_DASHBOARD_URL: 'https://karrio.invente.co.uk',
        NEXT_PUBLIC_KARRIO_PUBLIC_URL: 'https://app.karrio.invente.co.uk',
      },
    },
  ],
};