export const getTenantAndIntegrationKey = (tenantId: string, integrationId: string) => {
    return `${tenantId}-${integrationId}`;
}
export const splitTenantAndIntegrationKey = (tenantAndIntegrationKey: string) => {
    const [tenantId, integrationId] = tenantAndIntegrationKey.split('-');
    return { tenantId, integrationId };
}