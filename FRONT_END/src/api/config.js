/**
 * Centralize all API endpoints and configurations
 */

const API_ROOT = 'http://localhost:8000/api/v1';

export const API_BASE_URL = `${API_ROOT}/map`;

export const GEOSERVER_BASE_URL = '/geoserver/svg_workspace';

export const GEOSERVER_WMS_URL = `${GEOSERVER_BASE_URL}/wms`;
export const GEOSERVER_WFS_URL = `${GEOSERVER_BASE_URL}/ows`;

// Any other future API endpoints can go here
// export const AUTH_API = `${API_ROOT}/auth`;
// export const USER_API = `${API_ROOT}/users`;
