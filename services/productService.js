import apiRequest from "../lib/apiClient";

export async function getProducts(
  token
) {
  return apiRequest("/products", {
    token,
  });
}

export async function getProduct(
  productId,
  token
) {
  return apiRequest(
    `/products/${productId}`,
    {
      token,
    }
  );
}

export async function searchProducts(
  query,
  token
) {
  return apiRequest(
    `/products/search?q=${encodeURIComponent(query)}`,
    {
      token,
    }
  );
}

export async function createProduct(
  formData,
  token
) {
  return apiRequest("/products", {
    method: "POST",
    body: formData,
    token,
    isFormData: true,
  });
}

export async function updateProduct(
  productId,
  formData,
  token
) {
  return apiRequest(
    `/products/${productId}`,
    {
      method: "PUT",
      body: formData,
      token,
      isFormData: true,
    }
  );
}

export async function deleteProductImage(
  productId,
  token
) {
  return apiRequest(
    `/products/${productId}/image`,
    {
      method: "DELETE",
      token,
    }
  );
}

export async function activateProduct(
  productId,
  token
) {
  return apiRequest(
    `/products/${productId}/activate`,
    {
      method: "PATCH",
      token,
    }
  );
}

export async function deactivateProduct(
  productId,
  token
) {
  return apiRequest(
    `/products/${productId}/deactivate`,
    {
      method: "PATCH",
      token,
    }
  );
}