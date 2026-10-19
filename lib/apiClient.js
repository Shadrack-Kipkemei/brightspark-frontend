import API_BASE_URL from "./api";

async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    method = "GET",
    body,
    token,
    isFormData = false,
  } = options;

  const headers = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

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

  try {
    data = await response.json();
  } catch {
    data = null;
  }

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