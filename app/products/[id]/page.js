"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ImageOff,
  MapPin,
  Package,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

import {
  getProductById,
  getPublicBranches,
  getProductAvailability,
} from "@/services/productService";

import { useCart } from "@/components/cart/CartContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000/api";

const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");


/**
 * Convert a backend image path or external image URL
 * into a URL that the browser can display.
 */
function getImageUrl(product) {
  const image = product?.image_url || product?.image;

  if (!image) {
    return null;
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_ORIGIN}/${image.replace(/^\/+/, "")}`;
}


export default function ProductDetailsPage({ params }) {
  const { id } = use(params);

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [availability, setAvailability] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingAvailability, setLoadingAvailability] =
    useState(false);

  const [error, setError] = useState("");
  const [branchError, setBranchError] = useState("");

  const [addedToCart, setAddedToCart] = useState(false);


  // =====================================================
  // LOAD PRODUCT
  // =====================================================

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProductById(id);

      if (!response?.success || !response?.product) {
        throw new Error("Product could not be found.");
      }

      setProduct(response.product);
    } catch (err) {
      console.error("Failed to load product:", err);

      setError(
        err?.message ||
        "Unable to load this product."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);


  // =====================================================
  // LOAD PUBLIC BRANCHES
  // =====================================================

  const loadBranches = useCallback(async () => {
    try {
      setLoadingBranches(true);
      setBranchError("");

      const response = await getPublicBranches();

      if (!response?.success) {
        throw new Error(
          "Unable to load available branches."
        );
      }

      const activeBranches = response.branches || [];

      setBranches(activeBranches);

      /*
       * Automatically select the first active branch.
       *
       * The customer can change it afterwards.
       */
      if (activeBranches.length > 0) {
        setSelectedBranchId(
          activeBranches[0].id
        );
      }
    } catch (err) {
      console.error(
        "Failed to load branches:",
        err
      );

      setBranchError(
        err?.message ||
        "Unable to load branches."
      );
    } finally {
      setLoadingBranches(false);
    }
  }, []);


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProduct();
    loadBranches();
  }, [
    loadProduct,
    loadBranches,
  ]);


  // =====================================================
  // LOAD PRODUCT AVAILABILITY
  // =====================================================

  const loadAvailability = useCallback(
    async () => {
      if (!id || !selectedBranchId) {
        setAvailability(null);
        return;
      }

      try {
        setLoadingAvailability(true);

        const response =
          await getProductAvailability(
            id,
            selectedBranchId
          );

        if (!response?.success) {
          throw new Error(
            "Unable to check product availability."
          );
        }

        setAvailability(response);
      } catch (err) {
        console.error(
          "Failed to load product availability:",
          err
        );

        setAvailability(null);

        setBranchError(
          err?.message ||
          "Unable to check availability."
        );
      } finally {
        setLoadingAvailability(false);
      }
    },
    [
      id,
      selectedBranchId,
    ]
  );


  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);


  // =====================================================
  // HANDLE BRANCH CHANGE
  // =====================================================

  function handleBranchChange(event) {
    const branchId = event.target.value;

    setSelectedBranchId(branchId);
    setAvailability(null);
    setBranchError("");
    setAddedToCart(false);
  }


  // =====================================================
  // ADD TO CART
  // =====================================================

  function handleAddToCart() {
    if (
      !product ||
      !availability ||
      !availability.is_available ||
      !availability.price_from ||
      availability.quantity <= 0
    ) {
      return;
    }

    /*
     * Add the product using the selected branch's
     * currently displayed public price.
     */
    addToCart({
      ...product,

      price: availability.price_from,

      stock: availability.quantity,

      branch_id:
        availability.branch?.id ||
        selectedBranchId,

      branch_name:
        availability.branch?.name || "",

      branch_location:
        availability.branch?.location || "",

      selected_branch_id:
        selectedBranchId,
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);
  }


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-center">
            <RefreshCw
              className="animate-spin text-slate-700"
              size={28}
            />
          </div>
        </div>
      </main>
    );
  }


  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error || !product) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h1 className="text-xl font-bold text-red-800">
              Product Not Found
            </h1>

            <p className="mt-3 text-sm text-red-700">
              {error ||
                "This product could not be found."}
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }


  // =====================================================
  // INACTIVE PRODUCT
  // =====================================================

  if (!product.is_active) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
            <h1 className="text-xl font-bold text-slate-800">
              Product Unavailable
            </h1>

            <p className="mt-3 text-sm text-slate-600">
              This product is currently unavailable.
              Please check our other products.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }


  const imageUrl = getImageUrl(product);

  const isAvailable =
    availability?.is_available === true &&
    Number(availability?.quantity || 0) > 0;

  const price =
    availability?.price_from;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ============================================= */}
        {/* BACK LINK */}
        {/* ============================================= */}

        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to Products
        </Link>


        {/* ============================================= */}
        {/* PRODUCT */}
        {/* ============================================= */}

        <div className="grid gap-10 lg:grid-cols-2">

          {/* =========================================== */}
          {/* IMAGE */}
          {/* =========================================== */}

          <div className="flex min-h-[400px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="max-h-[500px] w-full object-contain p-6"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400">
                <ImageOff size={50} />

                <p className="mt-3 text-sm">
                  No product image
                </p>
              </div>
            )}

          </div>


          {/* =========================================== */}
          {/* INFORMATION */}
          {/* =========================================== */}

          <div>

            {/* CATEGORY */}

            {product.category && (
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {product.category}
              </p>
            )}


            {/* NAME */}

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>


            {/* SKU */}

            {product.sku && (
              <p className="mt-3 text-sm text-slate-500">
                SKU: {product.sku}
              </p>
            )}


            {/* DESCRIPTION */}

            {product.description && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-slate-900">
                  Description
                </h2>

                <p className="mt-2 leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}


            {/* UNIT */}

            {product.unit && (
              <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                <Package size={18} />
                <span>
                  Sold by:{" "}
                  <strong className="text-slate-900">
                    {product.unit}
                  </strong>
                </span>
              </div>
            )}


            {/* ======================================= */}
            {/* BRANCH SELECTION */}
            {/* ======================================= */}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-2">
                <MapPin
                  size={19}
                  className="text-slate-700"
                />

                <h2 className="font-semibold text-slate-900">
                  Choose Your Branch
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Select a branch to see its current stock
                and price.
              </p>


              {loadingBranches ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Loading branches...
                </div>
              ) : branches.length === 0 ? (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  No branches are currently available.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {branches.map((branch) => (
                    <label
                      key={branch.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        selectedBranchId === branch.id
                          ? "border-slate-900 bg-white shadow-sm"
                          : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="branch"
                        value={branch.id}
                        checked={
                          selectedBranchId === branch.id
                        }
                        onChange={
                          handleBranchChange
                        }
                        className="mt-1 h-4 w-4"
                      />

                      <div>
                        <p className="font-semibold text-slate-900">
                          {branch.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {branch.location}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}


              {branchError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {branchError}
                </div>
              )}

            </div>


            {/* ======================================= */}
            {/* AVAILABILITY */}
            {/* ======================================= */}

            {selectedBranchId && (
              <div className="mt-6">

                {loadingAvailability ? (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />
                    Checking branch availability...
                  </div>
                ) : availability ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                    {/* PRICE */}

                    {price !== null &&
                    price !== undefined ? (
                      <div>
                        <p className="text-sm text-slate-500">
                          Price
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900">
                          KSh{" "}
                          {Number(price).toLocaleString(
                            "en-KE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-700">
                        Contact us for current pricing.
                      </p>
                    )}


                    {/* STOCK */}

                    <div className="mt-4 flex items-center gap-2">

                      <Package
                        size={19}
                        className={
                          isAvailable
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />

                      {isAvailable ? (
                        <p className="text-sm text-green-700">
                          <strong>
                            {availability.quantity}
                          </strong>{" "}
                          {availability.unit} available at{" "}
                          <strong>
                            {availability.branch.name}
                          </strong>
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-red-600">
                          Currently out of stock at{" "}
                          {availability.branch.name}.
                        </p>
                      )}

                    </div>


                    {/* ADD TO CART */}

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!isAvailable}
                      className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold transition ${
                        isAvailable
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "cursor-not-allowed bg-slate-200 text-slate-500"
                      }`}
                    >
                      <ShoppingCart size={19} />

                      {addedToCart
                        ? "Added to Cart"
                        : isAvailable
                          ? "Add to Cart"
                          : "Out of Stock"}
                    </button>


                    {addedToCart && (
                      <p className="mt-3 text-center text-sm font-medium text-green-600">
                        Product added to your cart.
                      </p>
                    )}

                  </div>
                ) : null}

              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}