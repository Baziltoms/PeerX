const BASE_URL = '/api';

export const apiClient = async (endpoint, { method = 'GET', body, headers = {}, isFormData = false } = {}) => {
  const token = localStorage.getItem('peerx_token');

  const requestHeaders = {
    ...headers,
  };

  if (!isFormData) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text || `Server error (${response.status})` };
    }

    if (!response.ok) {
      // Handle expired session
      if (response.status === 401 && !endpoint.includes('/login')) {
        localStorage.removeItem('peerx_token');
        localStorage.removeItem('peerx_user');
        window.location.href = '/login';
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.message && err.message.includes('Failed to fetch')) {
      const connErr = new Error('Cannot connect to backend server. Please verify the API server is running on port 5001.');
      connErr.status = 503;
      throw connErr;
    }
    throw err;
  }
};

export const api = {
  get: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => apiClient(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => apiClient(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => apiClient(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => apiClient(endpoint, { ...options, method: 'DELETE' }),
  upload: (endpoint, formData, options = {}) =>
    apiClient(endpoint, { ...options, method: 'POST', body: formData, isFormData: true }),
};
