import apiRequest from "@/lib/apiClient";

/**
 * Get all public products.
 */
export async function getProducts() {
  return apiRequest("/products");
}

/**
 * Get one public product.
 */
export async function getProductById(productId) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  return apiRequest(`/products/${productId}`);
}

/**
 * Get active branches available to public customers.
 */
export async function getPublicBranches() {
  return apiRequest("/branches/public");
}

/**
 * Get product availability for a specific branch.
 */
export async function getProductAvailability(
  productId,
  branchId
) {
  if (!productId) {
    throw new Error("Product ID is required.");
  }

  if (!branchId) {
    throw new Error("Branch ID is required.");
  }

  return apiRequest(
    `/products/${productId}/availability?branch_id=${encodeURIComponent(
      branchId
    )}`
  );
}