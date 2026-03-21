import { useEffect, useState } from 'react';

const GRAPHQL_ENDPOINT = 'http://localhost:3000/graphql';
const PAGE_SIZE = 20;

type Tenant = {
  id: string;
  name: string;
};

type Integration = {
  id: string;
  source: string;
  sourceUrl: string;
  sourceFileExtension: string;
};

type SyncRun = {
  id: string;
  status: string;
  totalRecords: number;
  totalRecordsProcessed: number;
  totalRecordsFailed: number;
  totalRecordsSkipped: number;
  startedAt: string;
  completedAt: string | null;
};

type Seaport = {
  id: string;
  portName: string;
  locode: string;
  countryIso: string | null;
  timezoneOlson: string | null;
  latitude: string;
  longitude: string;
};

type SeaportConnection = {
  nodes: Seaport[];
  count: number;
  pageInfo: {
    startCursor: string | null;
    endCursor: string | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

async function graphQLRequest<T>(query: string, variables?: Record<string, unknown>) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.[0]?.message ?? 'Request failed');
  }

  if (!payload.data) {
    throw new Error('No data returned from GraphQL');
  }

  return payload.data;
}

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return 'Placeholder';
  }

  return String(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Placeholder';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const [syncRun, setSyncRun] = useState<SyncRun | null>(null);
  const [seaportConnection, setSeaportConnection] = useState<SeaportConnection | null>(null);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [integrationsLoading, setIntegrationsLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [seaportsLoading, setSeaportsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    async function loadTenants() {
      try {
        setTenantsLoading(true);
        const data = await graphQLRequest<{ tenants: Tenant[] }>(
          `
            query Tenants {
              tenants {
                id
                name
              }
            }
          `,
        );

        setTenants(data.tenants);
        setSelectedTenantId(data.tenants[0]?.id ?? '');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load tenants');
      } finally {
        setTenantsLoading(false);
      }
    }

    void loadTenants();
  }, []);

  useEffect(() => {
    if (!selectedTenantId) {
      setIntegrations([]);
      setSelectedIntegrationId('');
      setSyncRun(null);
      setSeaportConnection(null);
      return;
    }

    async function loadIntegrations() {
      try {
        setIntegrationsLoading(true);
        setError(null);
        const data = await graphQLRequest<{ tenantActiveIntegrations: Integration[] }>(
          `
            query TenantActiveIntegrations($tenantId: String!) {
              tenantActiveIntegrations(tenantId: $tenantId) {
                id
                source
                sourceUrl
                sourceFileExtension
              }
            }
          `,
          { tenantId: selectedTenantId },
        );

        setIntegrations(data.tenantActiveIntegrations);
        setSelectedIntegrationId((currentValue) => {
          const stillExists = data.tenantActiveIntegrations.some(
            (integration) => integration.id === currentValue,
          );

          if (stillExists) {
            return currentValue;
          }

          return data.tenantActiveIntegrations[0]?.id ?? '';
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load integrations');
        setIntegrations([]);
        setSelectedIntegrationId('');
      } finally {
        setIntegrationsLoading(false);
      }
    }

    void loadIntegrations();
  }, [selectedTenantId]);

  async function loadSeaports(direction?: 'next' | 'previous') {
    if (!selectedTenantId || !selectedIntegrationId) {
      setSeaportConnection(null);
      return;
    }

    const pageInfo = seaportConnection?.pageInfo;
    const variables: Record<string, unknown> = {
      tenantId: selectedTenantId,
      integrationId: selectedIntegrationId,
      first: PAGE_SIZE,
    };

    if (direction === 'next' && pageInfo?.endCursor) {
      variables.after = pageInfo.endCursor;
    }

    if (direction === 'previous' && pageInfo?.startCursor) {
      variables.before = pageInfo.startCursor;
    }

    try {
      setSeaportsLoading(true);
      const data = await graphQLRequest<{ tenantSeaports: SeaportConnection }>(
        `
          query TenantSeaports(
            $tenantId: String!
            $integrationId: String!
            $first: Int!
            $after: String
            $before: String
          ) {
            tenantSeaports(
              tenantId: $tenantId
              integrationId: $integrationId
              first: $first
              after: $after
              before: $before
            ) {
              count
              nodes {
                id
                portName
                locode
                countryIso
                timezoneOlson
                latitude
                longitude
              }
              pageInfo {
                startCursor
                endCursor
                hasPreviousPage
                hasNextPage
              }
            }
          }
        `,
        variables,
      );

      setSeaportConnection(data.tenantSeaports);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load seaports');
      setSeaportConnection(null);
    } finally {
      setSeaportsLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedTenantId || !selectedIntegrationId) {
      setSyncRun(null);
      setSeaportConnection(null);
      return;
    }

    async function loadSelectedData() {
      try {
        setReportLoading(true);
        setError(null);
        const [syncRunData] = await Promise.all([
          graphQLRequest<{ tenantSyncRunReport: SyncRun | null }>(
            `
              query TenantSyncRunReport($tenantId: String!, $integrationId: String!) {
                tenantSyncRunReport(tenantId: $tenantId, integrationId: $integrationId) {
                  id
                  status
                  totalRecords
                  totalRecordsProcessed
                  totalRecordsFailed
                  totalRecordsSkipped
                  startedAt
                  completedAt
                }
              }
            `,
            {
              tenantId: selectedTenantId,
              integrationId: selectedIntegrationId,
            },
          ),
          loadSeaports(),
        ]);

        setSyncRun(syncRunData.tenantSyncRunReport);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load tenant report');
        setSyncRun(null);
      } finally {
        setReportLoading(false);
      }
    }

    void loadSelectedData();
  }, [selectedTenantId, selectedIntegrationId]);

  return (
    <main className="page-shell">
      <section className="dashboard-card">
        <div className="hero-row">
          <div className="section-heading">
            <p className="eyebrow">Tenant Monitor</p>
            <h1>Tenant integration and seaport overview</h1>
            <p className="lede">
              Pick a tenant, review its active integration, inspect the latest sync run, and page
              through seaport records in batches of 20.
            </p>
          </div>

          <button
            type="button"
            className="theme-switch"
            onClick={() => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>

        {error ? <div className="error-banner">{error}</div> : null}

        <section className="panel">
          <div className="panel-header">
            <h2>Selection</h2>
            <span>{tenantsLoading || integrationsLoading ? 'Loading...' : 'Ready'}</span>
          </div>

          <div className="selection-grid">
            <label className="field">
              <span>Tenant</span>
              <select
                value={selectedTenantId}
                onChange={(event) => setSelectedTenantId(event.target.value)}
                disabled={tenantsLoading || tenants.length === 0}
              >
                {tenants.length === 0 ? (
                  <option value="">Placeholder</option>
                ) : (
                  tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="field">
              <span>Integration</span>
              <select
                value={selectedIntegrationId}
                onChange={(event) => setSelectedIntegrationId(event.target.value)}
                disabled={integrationsLoading || integrations.length === 0}
              >
                {integrations.length === 0 ? (
                  <option value="">Placeholder</option>
                ) : (
                  integrations.map((integration) => (
                    <option key={integration.id} value={integration.id}>
                      {integration.source} · {integration.sourceFileExtension}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Latest Sync Run</h2>
            <span>{reportLoading ? 'Loading...' : 'Syncrun report'}</span>
          </div>

          <div className="metrics-grid">
            <article className="metric-card">
              <span>Status</span>
              <strong>{formatValue(syncRun?.status)}</strong>
            </article>
            <article className="metric-card">
              <span>Total records</span>
              <strong>{formatValue(syncRun?.totalRecords)}</strong>
            </article>
            <article className="metric-card">
              <span>Processed</span>
              <strong>{formatValue(syncRun?.totalRecordsProcessed)}</strong>
            </article>
            <article className="metric-card">
              <span>Failed</span>
              <strong>{formatValue(syncRun?.totalRecordsFailed)}</strong>
            </article>
            <article className="metric-card">
              <span>Skipped</span>
              <strong>{formatValue(syncRun?.totalRecordsSkipped)}</strong>
            </article>
            <article className="metric-card">
              <span>Started</span>
              <strong>{formatDate(syncRun?.startedAt)}</strong>
            </article>
            <article className="metric-card wide">
              <span>Completed</span>
              <strong>{formatDate(syncRun?.completedAt)}</strong>
            </article>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Seaports</h2>
            <div className="pager">
              <button
                type="button"
                onClick={() => void loadSeaports('previous')}
                disabled={!seaportConnection?.pageInfo.hasPreviousPage || seaportsLoading}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => void loadSeaports('next')}
                disabled={!seaportConnection?.pageInfo.hasNextPage || seaportsLoading}
              >
                Next
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Locode</th>
                  <th>Country</th>
                  <th>Timezone</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {seaportsLoading ? (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      Loading seaports...
                    </td>
                  </tr>
                ) : seaportConnection?.nodes.length ? (
                  seaportConnection.nodes.map((seaport) => (
                    <tr key={seaport.id}>
                      <td>{formatValue(seaport.portName)}</td>
                      <td>{formatValue(seaport.locode)}</td>
                      <td>{formatValue(seaport.countryIso)}</td>
                      <td>{formatValue(seaport.timezoneOlson)}</td>
                      <td>{formatValue(seaport.latitude)}</td>
                      <td>{formatValue(seaport.longitude)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="empty-cell">
                      Placeholder
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="table-footnote">
            Showing {seaportConnection?.count ?? 0} record(s) on this page.
          </p>
        </section>
      </section>
    </main>
  );
}

export default App;
