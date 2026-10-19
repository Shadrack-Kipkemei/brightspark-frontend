import API_BASE_URL from "./api";

async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    token,
    isFormData = false,
  } = options;

  const headers = {};

  // JSON requests need Content-Type.
  // Do NOT manually set Content-Type for FormData.
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // Add JWT access token when one is provided.
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers,
      body: isFormData
        ? body
        : body
          ? JSON.stringify(body)
          : undefined,
    }
  );

  let data = null;

  // Try to read the backend response as JSON.
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Convert backend errors into JavaScript errors.
  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.msg ||
      "An unexpected error occurred."
    );
  }

  return data;
}

export default apiRequest;