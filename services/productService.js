
import apiRequest from "@/lib/apiClient";

export async function getProducts() {
  return apiRequest("/products");
}

export async function getProductById(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  return apiRequest(`/products/${productId}`);
}
