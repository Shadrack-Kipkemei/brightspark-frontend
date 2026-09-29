"use client";

import { useMemo, useState } from "react";

/*
|--------------------------------------------------------------------------
| TEMPORARY STOCK DATA
|--------------------------------------------------------------------------
| This will later come from the Flask REST API + PostgreSQL.
*/

const initialStockItems = [
    {
        id: "ST001",
        product: "LED Bulb 12W",
        sku: "BS-LB-001",
        category: "Lighting",
        branch: "Roysambu",
        stock: 25,
        minimumStock: 5,
    },
    {
        id: "ST002",
        product: "Phone Charger",
        sku: "BS-PC-001",
        category: "Phone Accessories",
        branch: "Roysambu",
        stock: 15,
        minimumStock: 5,
    },
    {
        id: "ST003",
        product: "Bluetooth Speaker",
        sku: "BS-BS-001",
        category: "Electronics",
        branch: "Roysambu",
        stock: 20,
        minimumStock: 5,
    },
    {
        id: "ST004",
        product: "Digital Multimeter",
        sku: "BS-DM-001",
        category: "Electrical",
        branch: "Roysambu",
        stock: 8,
        minimumStock: 5,
    },
    {
        id: "ST005",
        product: "LED Flood Light",
        sku: "BS-FL-001",
        category: "Lighting",
        branch: "Rangau",
        stock: 12,
        minimumStock: 5,
    },
    {
        id: "ST006",
        product: "Extension Cable",
        sku: "BS-EC-001",
        category: "Electrical",
        branch: "Rangau",
        stock: 20,
        minimumStock: 5,
    },
    {
        id: "ST007",
        product: "Rechargeable Emergency Lamp",
        sku: "BS-EL-001",
        category: "Electronics",
        branch: "Rangau",
        stock: 7,
        minimumStock: 5,
    },
    {
        id: "ST008",
        product: "USB Type-C Cable",
        sku: "BS-UC-001",
        category: "Phone Accessories",
        branch: "Rangau",
        stock: 30,
        minimumStock: 10,
    },
];

/*
|--------------------------------------------------------------------------
| TEMPORARY CURRENT USER
|--------------------------------------------------------------------------
| Later this will come from JWT authentication.
*/

const currentUser = {
    id: "USR001",
    name: "Administrator",
    role: "admin",
};

/*
|--------------------------------------------------------------------------
| STOCK MOVEMENTS
|--------------------------------------------------------------------------
*/

const initialMovements = [
    {
        id: "MOV001",
        stockId: "ST003",
        product: "Bluetooth Speaker",
        branch: "Roysambu",
        type: "OPENING_STOCK",
        quantity: 20,
        previousStock: 0,
        newStock: 20,
        reason: "Opening stock",
        createdBy: "Administrator",
        createdAt: "2026-09-29 08:00",
        reversed: false,
        transferId: null,
    },
];

/*
|--------------------------------------------------------------------------
| STOCK TRANSFERS
|--------------------------------------------------------------------------
*/

const initialTransfers = [];

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

export default function AdminStockPage() {
    const [stockItems, setStockItems] =
        useState(initialStockItems);

    const [movements, setMovements] =
        useState(initialMovements);

    const [transfers, setTransfers] =
        useState(initialTransfers);

    const [branch, setBranch] =
        useState("all");

    const [search, setSearch] =
        useState("");

    const [stockFilter, setStockFilter] =
        useState("all");

    /*
    |--------------------------------------------------------------------------
    | MODAL STATES
    |--------------------------------------------------------------------------
    */

    const [showAddStock, setShowAddStock] =
        useState(false);

    const [showHistory, setShowHistory] =
        useState(false);

    const [showReverse, setShowReverse] =
        useState(false);

    const [showTransfer, setShowTransfer] =
        useState(false);

    const [showTransfers, setShowTransfers] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | SELECTED RECORDS
    |--------------------------------------------------------------------------
    */

    const [selectedProduct, setSelectedProduct] =
        useState(null);

    const [selectedMovement, setSelectedMovement] =
        useState(null);

    /*
    |--------------------------------------------------------------------------
    | FORM DATA
    |--------------------------------------------------------------------------
    */

    const [quantity, setQuantity] =
        useState("");

    const [reason, setReason] =
        useState("");

    const [destinationBranch, setDestinationBranch] =
        useState("");

    /*
    |--------------------------------------------------------------------------
    | FILTER STOCK
    |--------------------------------------------------------------------------
    */

    const filteredStock = useMemo(() => {
        return stockItems.filter((item) => {

            const matchesBranch =
                branch === "all" ||
                item.branch === branch;

            const matchesSearch =
                item.product
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                item.sku
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const matchesStockFilter =
                stockFilter === "all" ||
                (stockFilter === "low" &&
                    item.stock <= item.minimumStock) ||
                (stockFilter === "available" &&
                    item.stock > item.minimumStock);

            return (
                matchesBranch &&
                matchesSearch &&
                matchesStockFilter
            );
        });
    }, [
        stockItems,
        branch,
        search,
        stockFilter,
    ]);

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    const totalStock = stockItems.reduce(
        (total, item) =>
            total + item.stock,
        0
    );

    const lowStockCount =
        stockItems.filter(
            (item) =>
                item.stock <= item.minimumStock
        ).length;

    const roysambuStock =
        stockItems
            .filter(
                (item) =>
                    item.branch === "Roysambu"
            )
            .reduce(
                (total, item) =>
                    total + item.stock,
                0
            );

    const rangauStock =
        stockItems
            .filter(
                (item) =>
                    item.branch === "Rangau"
            )
            .reduce(
                (total, item) =>
                    total + item.stock,
                0
            );

    /*
    |--------------------------------------------------------------------------
    | ADD STOCK
    |--------------------------------------------------------------------------
    */

    const openAddStock = (
        product = null
    ) => {
        setSelectedProduct(product);
        setQuantity("");
        setReason("");
        setShowAddStock(true);
    };

    const closeAddStock = () => {
        setShowAddStock(false);
        setSelectedProduct(null);
        setQuantity("");
        setReason("");
    };

    const handleAddStock = (event) => {
        event.preventDefault();

        const amount = Number(quantity);

        if (!selectedProduct) {
            alert("Please select a product.");
            return;
        }

        if (!amount || amount <= 0) {
            alert("Enter a valid quantity.");
            return;
        }

        if (!reason.trim()) {
            alert("Please provide a reason.");
            return;
        }

        const previousStock =
            selectedProduct.stock;

        const newStock =
            previousStock + amount;

        /*
        | Update stock
        */

        setStockItems((current) =>
            current.map((item) =>
                item.id === selectedProduct.id
                    ? {
                        ...item,
                        stock: newStock,
                    }
                    : item
            )
        );

        /*
        | Create movement
        */

        const movement = {
            id: `MOV${Date.now()}`,
            stockId: selectedProduct.id,
            product: selectedProduct.product,
            branch: selectedProduct.branch,
            type: "STOCK_ADDITION",
            quantity: amount,
            previousStock,
            newStock,
            reason: reason.trim(),
            createdBy: currentUser.name,
            createdAt:
                new Date().toLocaleString(),
            reversed: false,
            transferId: null,
        };

        setMovements((current) => [
            movement,
            ...current,
        ]);

        closeAddStock();
    };

    /*
    |--------------------------------------------------------------------------
    | HISTORY
    |--------------------------------------------------------------------------
    */

    const openHistory = (product) => {
        setSelectedProduct(product);
        setShowHistory(true);
    };

    const closeHistory = () => {
        setShowHistory(false);
        setSelectedProduct(null);
    };

    /*
    |--------------------------------------------------------------------------
    | REVERSE STOCK
    |--------------------------------------------------------------------------
    */

    const openReverse = (movement) => {
        setSelectedMovement(movement);
        setReason("");
        setShowReverse(true);
    };

    const closeReverse = () => {
        setShowReverse(false);
        setSelectedMovement(null);
        setReason("");
    };

    const handleReverse = (event) => {
        event.preventDefault();

        if (!selectedMovement) {
            return;
        }

        if (selectedMovement.reversed) {
            alert("This movement has already been reversed.");
            return;
        }

        if (!reason.trim()) {
            alert("Please provide a reason.");
            return;
        }

        const stockItem =
            stockItems.find(
                (item) =>
                    item.id ===
                    selectedMovement.stockId
            );

        if (!stockItem) {
            alert("Stock item not found.");
            return;
        }

        const reversalQuantity =
            -selectedMovement.quantity;

        const previousStock =
            stockItem.stock;

        const newStock =
            previousStock +
            reversalQuantity;

        /*
        | Update stock
        */

        setStockItems((current) =>
            current.map((item) =>
                item.id ===
                    selectedMovement.stockId
                    ? {
                        ...item,
                        stock: newStock,
                    }
                    : item
            )
        );

        /*
        | Mark original movement reversed
        */

        setMovements((current) =>
            current.map((movement) =>
                movement.id ===
                    selectedMovement.id
                    ? {
                        ...movement,
                        reversed: true,
                    }
                    : movement
            )
        );

        /*
        | Create reversal movement
        */

        const reversalMovement = {
            id: `MOV${Date.now()}`,
            stockId:
                selectedMovement.stockId,
            product:
                selectedMovement.product,
            branch:
                selectedMovement.branch,
            type: "STOCK_REVERSAL",
            quantity: reversalQuantity,
            previousStock,
            newStock,
            reason: reason.trim(),
            createdBy: currentUser.name,
            createdAt:
                new Date().toLocaleString(),
            reversed: false,
            transferId: null,
        };

        setMovements((current) => [
            reversalMovement,
            ...current,
        ]);

        closeReverse();
    };

    /*
    |--------------------------------------------------------------------------
    | OPEN TRANSFER
    |--------------------------------------------------------------------------
    */

    const openTransfer = (product) => {
        setSelectedProduct(product);
        setQuantity("");
        setReason("");
        setDestinationBranch("");
        setShowTransfer(true);
    };

    const closeTransfer = () => {
        setShowTransfer(false);
        setSelectedProduct(null);
        setQuantity("");
        setReason("");
        setDestinationBranch("");
    };

    /*
    |--------------------------------------------------------------------------
    | TRANSFER STOCK
    |--------------------------------------------------------------------------
    */

    const handleTransfer = (event) => {
        event.preventDefault();

        if (!selectedProduct) {
            alert("Please select a product.");
            return;
        }

        const amount = Number(quantity);

        if (!amount || amount <= 0) {
            alert("Enter a valid quantity.");
            return;
        }

        if (amount > selectedProduct.stock) {
            alert(
                "You cannot transfer more stock than the available quantity."
            );
            return;
        }

        if (
            !destinationBranch ||
            destinationBranch ===
            selectedProduct.branch
        ) {
            alert(
                "Please select a different destination branch."
            );
            return;
        }

        if (!reason.trim()) {
            alert("Please provide a transfer reason.");
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | FIND DESTINATION STOCK
        |--------------------------------------------------------------------------
        */

        const destinationProduct =
            stockItems.find(
                (item) =>
                    item.product ===
                    selectedProduct.product &&
                    item.branch ===
                    destinationBranch
            );

        if (!destinationProduct) {
            alert(
                "This product does not exist in the destination branch."
            );
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | TRANSFER ID
        |--------------------------------------------------------------------------
        */

        const transferId =
            `TRF${Date.now()}`;

        /*
        |--------------------------------------------------------------------------
        | SOURCE STOCK
        |--------------------------------------------------------------------------
        */

        const sourcePreviousStock =
            selectedProduct.stock;

        const sourceNewStock =
            sourcePreviousStock - amount;

        /*
        |--------------------------------------------------------------------------
        | DESTINATION STOCK
        |--------------------------------------------------------------------------
        */

        const destinationPreviousStock =
            destinationProduct.stock;

        const destinationNewStock =
            destinationPreviousStock + amount;

        /*
        |--------------------------------------------------------------------------
        | UPDATE BOTH BRANCHES
        |--------------------------------------------------------------------------
        */

        setStockItems((current) =>
            current.map((item) => {

                if (
                    item.id ===
                    selectedProduct.id
                ) {
                    return {
                        ...item,
                        stock: sourceNewStock,
                    };
                }

                if (
                    item.id ===
                    destinationProduct.id
                ) {
                    return {
                        ...item,
                        stock: destinationNewStock,
                    };
                }

                return item;
            })
        );

        /*
        |--------------------------------------------------------------------------
        | TRANSFER RECORD
        |--------------------------------------------------------------------------
        */

        const transfer = {
            id: transferId,
            product:
                selectedProduct.product,
            sku:
                selectedProduct.sku,
            fromBranch:
                selectedProduct.branch,
            toBranch:
                destinationBranch,
            quantity: amount,
            reason: reason.trim(),
            status: "COMPLETED",
            createdBy: currentUser.name,
            createdAt:
                new Date().toLocaleString(),
        };

        setTransfers((current) => [
            transfer,
            ...current,
        ]);

        /*
        |--------------------------------------------------------------------------
        | TRANSFER OUT MOVEMENT
        |--------------------------------------------------------------------------
        */

        const transferOut = {
            id: `MOV${Date.now()}-OUT`,
            stockId:
                selectedProduct.id,
            product:
                selectedProduct.product,
            branch:
                selectedProduct.branch,
            type: "TRANSFER_OUT",
            quantity: -amount,
            previousStock:
                sourcePreviousStock,
            newStock:
                sourceNewStock,
            reason:
                `Transfer to ${destinationBranch}: ${reason.trim()}`,
            createdBy:
                currentUser.name,
            createdAt:
                new Date().toLocaleString(),
            reversed: false,
            transferId,
        };

        /*
        |--------------------------------------------------------------------------
        | TRANSFER IN MOVEMENT
        |--------------------------------------------------------------------------
        */

        const transferIn = {
            id: `MOV${Date.now()}-IN`,
            stockId:
                destinationProduct.id,
            product:
                destinationProduct.product,
            branch:
                destinationBranch,
            type: "TRANSFER_IN",
            quantity: amount,
            previousStock:
                destinationPreviousStock,
            newStock:
                destinationNewStock,
            reason:
                `Transfer from ${selectedProduct.branch}: ${reason.trim()}`,
            createdBy:
                currentUser.name,
            createdAt:
                new Date().toLocaleString(),
            reversed: false,
            transferId,
        };

        /*
        |--------------------------------------------------------------------------
        | SAVE MOVEMENTS
        |--------------------------------------------------------------------------
        */

        setMovements((current) => [
            transferOut,
            transferIn,
            ...current,
        ]);

        closeTransfer();
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <div className="p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <p className="text-sm font-semibold text-[#FE7401]">
                            Inventory Management
                        </p>

                        <h1 className="mt-1 text-3xl font-bold text-[#02337D]">
                            Stock Management
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage stock, corrections and transfers
                            between BrightSpark branches.
                        </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() =>
                                setShowTransfers(true)
                            }
                            className="rounded-xl border border-[#02337D] px-5 py-3 font-semibold text-[#02337D] hover:bg-blue-50"
                        >
                            Stock Transfers
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                openAddStock()
                            }
                            className="rounded-xl bg-[#FE7401] px-5 py-3 font-semibold text-white hover:bg-[#D85F00]"
                        >
                            + Add Stock
                        </button>

                    </div>

                </div>

                {/* SUMMARY CARDS */}

                <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

                    <SummaryCard
                        title="Total Stock"
                        value={totalStock.toLocaleString()}
                        description="Units across both branches"
                        icon="📦"
                    />

                    <SummaryCard
                        title="Roysambu"
                        value={roysambuStock.toLocaleString()}
                        description="Lumumba Drive"
                        icon="🏪"
                    />

                    <SummaryCard
                        title="Rangau"
                        value={rangauStock.toLocaleString()}
                        description="Rangau Branch"
                        icon="🏪"
                    />

                    <SummaryCard
                        title="Low Stock"
                        value={lowStockCount}
                        description="Products need attention"
                        icon="⚠️"
                        warning
                    />

                </div>

                {/* FILTERS */}

                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                    <div className="grid gap-5 lg:grid-cols-3">

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Branch
                            </label>

                            <select
                                value={branch}
                                onChange={(event) =>
                                    setBranch(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                            >

                                <option value="all">
                                    All Branches
                                </option>

                                <option value="Roysambu">
                                    Roysambu - Lumumba Drive
                                </option>

                                <option value="Rangau">
                                    Rangau
                                </option>

                            </select>

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Search
                            </label>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search product or SKU..."
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Stock Status
                            </label>

                            <select
                                value={stockFilter}
                                onChange={(event) =>
                                    setStockFilter(
                                        event.target.value
                                    )
                                }
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                            >

                                <option value="all">
                                    All Stock
                                </option>

                                <option value="low">
                                    Low Stock
                                </option>

                                <option value="available">
                                    Available
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* LOW STOCK ALERT */}

                {lowStockCount > 0 && (
                    <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">

                        <div className="flex gap-4">

                            <div className="text-2xl">
                                ⚠️
                            </div>

                            <div>

                                <h2 className="font-bold text-orange-800">
                                    Low Stock Alert
                                </h2>

                                <p className="mt-1 text-sm text-orange-700">
                                    {lowStockCount} product
                                    {lowStockCount !== 1
                                        ? "s are"
                                        : " is"}{" "}
                                    at or below the minimum
                                    stock level.
                                </p>

                            </div>

                        </div>

                    </div>
                )}

                {/* STOCK TABLE */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 p-5">

                        <h2 className="font-bold text-[#02337D]">
                            Stock Inventory
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                            {filteredStock.length} products shown
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1250px]">

                            <thead>

                                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">

                                    <th className="px-5 py-4">
                                        Product
                                    </th>

                                    <th className="px-5 py-4">
                                        Category
                                    </th>

                                    <th className="px-5 py-4">
                                        Branch
                                    </th>

                                    <th className="px-5 py-4">
                                        Stock
                                    </th>

                                    <th className="px-5 py-4">
                                        Minimum
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-right">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredStock.map(
                                    (item) => {

                                        const isLowStock =
                                            item.stock <=
                                            item.minimumStock;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-100 last:border-0"
                                            >

                                                <td className="px-5 py-4">

                                                    <p className="font-semibold text-gray-800">
                                                        {item.product}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {item.sku}
                                                    </p>

                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {item.category}
                                                </td>

                                                <td className="px-5 py-4">

                                                    <BranchBadge
                                                        branch={item.branch}
                                                    />

                                                </td>

                                                <td className="px-5 py-4">

                                                    <span
                                                        className={`text-lg font-bold ${isLowStock
                                                            ? "text-red-600"
                                                            : "text-gray-800"
                                                            }`}
                                                    >
                                                        {item.stock}
                                                    </span>

                                                    <span className="ml-1 text-xs text-gray-400">
                                                        units
                                                    </span>

                                                </td>

                                                <td className="px-5 py-4 text-sm text-gray-600">
                                                    {item.minimumStock}
                                                </td>

                                                <td className="px-5 py-4">

                                                    {isLowStock ? (
                                                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                                            Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                                            In Stock
                                                        </span>
                                                    )}

                                                </td>

                                                <td className="px-5 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openHistory(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            History
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openAddStock(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg border border-[#02337D] px-3 py-2 text-xs font-semibold text-[#02337D] hover:bg-blue-50"
                                                        >
                                                            Add
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openTransfer(
                                                                    item
                                                                )
                                                            }
                                                            className="rounded-lg bg-[#02337D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#01265C]"
                                                        >
                                                            Transfer
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                    {filteredStock.length === 0 && (
                        <div className="p-10 text-center text-sm text-gray-500">
                            No stock records found.
                        </div>
                    )}

                </div>

            </div>

            {/* ================================================================== */}
            {/* ADD STOCK MODAL                                                     */}
            {/* ================================================================== */}

            {showAddStock && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">

                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6">

                            <div>

                                <h2 className="text-xl font-bold text-[#02337D]">
                                    Add Stock
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Record a new stock movement.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeAddStock}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <div className="max-h-[calc(90vh-105px)] overflow-y-auto">

                            <form
                                onSubmit={handleAddStock}
                                className="space-y-5 p-6"
                            >

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Product
                                    </label>

                                    {selectedProduct ? (
                                        <div className="rounded-xl bg-gray-50 p-4">

                                            <p className="font-semibold text-gray-800">
                                                {selectedProduct.product}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {selectedProduct.sku}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {selectedProduct.branch}
                                            </p>

                                            <p className="mt-2 text-sm text-gray-600">
                                                Current stock:{" "}
                                                <strong>
                                                    {selectedProduct.stock}
                                                </strong>
                                            </p>

                                        </div>
                                    ) : (
                                        <select
                                            required
                                            value=""
                                            onChange={(event) => {

                                                const product =
                                                    stockItems.find(
                                                        (item) =>
                                                            item.id ===
                                                            event.target.value
                                                    );

                                                setSelectedProduct(
                                                    product
                                                );

                                            }}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                                        >

                                            <option value="">
                                                Select product
                                            </option>

                                            {stockItems.map(
                                                (item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.product} -{" "}
                                                        {item.branch}
                                                    </option>
                                                )
                                            )}

                                        </select>
                                    )}

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={quantity}
                                        onChange={(event) =>
                                            setQuantity(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter quantity"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Reason
                                    </label>

                                    <textarea
                                        required
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(
                                                event.target.value
                                            )
                                        }
                                        rows={3}
                                        placeholder="e.g. New stock received from supplier"
                                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                                    />

                                </div>

                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

                                    <p className="text-xs leading-5 text-blue-800">
                                        This action creates a stock movement
                                        record. The original stock history will
                                        remain available for auditing.
                                    </p>

                                </div>

                                <div className="flex gap-3">

                                    <button
                                        type="button"
                                        onClick={closeAddStock}
                                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={!selectedProduct}
                                        className="flex-1 rounded-xl bg-[#02337D] px-4 py-3 font-semibold text-white hover:bg-[#01265C] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add Stock
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                </div>
            )}

            {/* ================================================================== */}
            {/* TRANSFER STOCK MODAL                                                */}
            {/* ================================================================== */}

            {showTransfer && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl">

                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#FE7401]">
                                    Branch Transfer
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                                    Transfer Stock
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={closeTransfer}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <div className="max-h-[calc(90vh-105px)] overflow-y-auto">

                            <form
                                onSubmit={handleTransfer}
                                className="space-y-5 p-6"
                            >

                                {/* PRODUCT */}

                                <div className="rounded-xl bg-gray-50 p-4">

                                    <p className="font-semibold text-gray-800">
                                        {selectedProduct.product}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {selectedProduct.sku}
                                    </p>

                                    <div className="mt-3 flex justify-between">

                                        <div>

                                            <p className="text-xs text-gray-500">
                                                From
                                            </p>

                                            <p className="font-semibold text-[#02337D]">
                                                {selectedProduct.branch}
                                            </p>

                                        </div>

                                        <div className="text-xl text-gray-400">
                                            →
                                        </div>

                                        <div>

                                            <p className="text-xs text-gray-500">
                                                Available
                                            </p>

                                            <p className="font-semibold text-gray-800">
                                                {selectedProduct.stock}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                                {/* DESTINATION */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Destination Branch
                                    </label>

                                    <select
                                        required
                                        value={destinationBranch}
                                        onChange={(event) =>
                                            setDestinationBranch(
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                                    >

                                        <option value="">
                                            Select destination
                                        </option>

                                        {selectedProduct.branch !==
                                            "Roysambu" && (
                                                <option value="Roysambu">
                                                    Roysambu - Lumumba Drive
                                                </option>
                                            )}

                                        {selectedProduct.branch !==
                                            "Rangau" && (
                                                <option value="Rangau">
                                                    Rangau
                                                </option>
                                            )}

                                    </select>

                                </div>

                                {/* QUANTITY */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Quantity to Transfer
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        max={
                                            selectedProduct.stock
                                        }
                                        required
                                        value={quantity}
                                        onChange={(event) =>
                                            setQuantity(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter quantity"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                                    />

                                </div>

                                {/* REASON */}

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Reason
                                    </label>

                                    <textarea
                                        required
                                        value={reason}
                                        onChange={(event) =>
                                            setReason(
                                                event.target.value
                                            )
                                        }
                                        rows={3}
                                        placeholder="e.g. Rangau requires additional stock"
                                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#02337D]"
                                    />

                                </div>

                                {/* INFORMATION */}

                                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

                                    <p className="text-xs leading-5 text-orange-800">
                                        This will reduce stock at{" "}
                                        <strong>
                                            {selectedProduct.branch}
                                        </strong>{" "}
                                        and increase the same product's
                                        stock at the destination branch.
                                        The transfer will be recorded in
                                        the stock history of both branches.
                                    </p>

                                </div>

                                {/* BUTTONS */}

                                <div className="flex gap-3">

                                    <button
                                        type="button"
                                        onClick={closeTransfer}
                                        className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="flex-1 rounded-xl bg-[#02337D] px-4 py-3 font-semibold text-white hover:bg-[#01265C]"
                                    >
                                        Transfer Stock
                                    </button>

                                </div>

                            </form>
                        </div>

                    </div>

                </div>
            )}

            {/* ================================================================== */}
            {/* HISTORY MODAL                                                       */}
            {/* ================================================================== */}

            {showHistory && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-200 p-6">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#FE7401]">
                                    Stock Audit Trail
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                                    {selectedProduct.product}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedProduct.branch} •{" "}
                                    {selectedProduct.sku}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={closeHistory}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-6">

                            {movements.filter(
                                (movement) =>
                                    movement.stockId ===
                                    selectedProduct.id
                            ).length === 0 ? (
                                <div className="py-10 text-center text-sm text-gray-500">
                                    No stock movements recorded.
                                </div>
                            ) : (
                                <div className="space-y-4">

                                    {movements
                                        .filter(
                                            (movement) =>
                                                movement.stockId ===
                                                selectedProduct.id
                                        )
                                        .map((movement) => (
                                            <MovementCard
                                                key={movement.id}
                                                movement={movement}
                                                onReverse={openReverse}
                                            />
                                        ))}

                                </div>
                            )}

                        </div>

                        <div className="border-t border-gray-200 p-5 text-right">

                            <button
                                type="button"
                                onClick={closeHistory}
                                className="rounded-xl bg-[#02337D] px-5 py-3 font-semibold text-white hover:bg-[#01265C]"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ================================================================== */}
            {/* REVERSE MODAL                                                       */}
            {/* ================================================================== */}

            {showReverse && selectedMovement && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">

                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

                        <div className="border-b border-gray-200 p-6">

                            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                                Stock Correction
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                                Reverse Stock Entry
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                The original movement will remain in
                                the audit history.
                            </p>

                        </div>

                        <form
                            onSubmit={handleReverse}
                            className="space-y-5 p-6"
                        >

                            <div className="rounded-xl bg-gray-50 p-4">

                                <p className="font-semibold text-gray-800">
                                    {selectedMovement.product}
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    {selectedMovement.branch}
                                </p>

                                <div className="mt-3 grid grid-cols-2 gap-4">

                                    <div>

                                        <p className="text-xs text-gray-500">
                                            Original Entry
                                        </p>

                                        <p className="mt-1 font-bold text-gray-800">
                                            +
                                            {
                                                selectedMovement.quantity
                                            }
                                        </p>

                                    </div>

                                    <div>

                                        <p className="text-xs text-gray-500">
                                            Current Stock
                                        </p>

                                        <p className="mt-1 font-bold text-gray-800">
                                            {
                                                stockItems.find(
                                                    (item) =>
                                                        item.id ===
                                                        selectedMovement.stockId
                                                )?.stock
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Reason for Reversal
                                </label>

                                <textarea
                                    required
                                    value={reason}
                                    onChange={(event) =>
                                        setReason(
                                            event.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="e.g. Typing error — entered 100 instead of 10"
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-red-500"
                                />

                            </div>

                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">

                                <p className="text-xs leading-5 text-red-700">
                                    This will create a new reversal
                                    transaction. The original transaction
                                    will not be deleted.
                                </p>

                            </div>

                            <div className="flex gap-3">

                                <button
                                    type="button"
                                    onClick={closeReverse}
                                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-600"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                                >
                                    Confirm Reversal
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* ================================================================== */}
            {/* TRANSFERS LIST MODAL                                                */}
            {/* ================================================================== */}

            {showTransfers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl">

                        <div className="flex items-center justify-between border-b border-gray-200 p-6">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-[#FE7401]">
                                    Inventory Movement
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-[#02337D]">
                                    Stock Transfers
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Transfers between Roysambu and Rangau.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowTransfers(false)
                                }
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-6">

                            {transfers.length === 0 ? (
                                <div className="py-12 text-center">

                                    <div className="text-4xl">
                                        📦
                                    </div>

                                    <h3 className="mt-3 font-semibold text-gray-800">
                                        No transfers yet
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Stock transfers between branches
                                        will appear here.
                                    </p>

                                </div>
                            ) : (
                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[850px]">

                                        <thead>

                                            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">

                                                <th className="px-4 py-4">
                                                    Transfer ID
                                                </th>

                                                <th className="px-4 py-4">
                                                    Product
                                                </th>

                                                <th className="px-4 py-4">
                                                    From
                                                </th>

                                                <th className="px-4 py-4">
                                                    To
                                                </th>

                                                <th className="px-4 py-4">
                                                    Quantity
                                                </th>

                                                <th className="px-4 py-4">
                                                    Status
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {transfers.map(
                                                (transfer) => (
                                                    <tr
                                                        key={transfer.id}
                                                        className="border-b border-gray-100"
                                                    >

                                                        <td className="px-4 py-4 text-sm font-semibold text-[#02337D]">
                                                            {transfer.id}
                                                        </td>

                                                        <td className="px-4 py-4">

                                                            <p className="font-semibold text-gray-800">
                                                                {transfer.product}
                                                            </p>

                                                            <p className="text-xs text-gray-400">
                                                                {transfer.sku}
                                                            </p>

                                                        </td>

                                                        <td className="px-4 py-4 text-sm">
                                                            {transfer.fromBranch}
                                                        </td>

                                                        <td className="px-4 py-4 text-sm">
                                                            {transfer.toBranch}
                                                        </td>

                                                        <td className="px-4 py-4 text-sm font-bold">
                                                            {transfer.quantity}
                                                        </td>

                                                        <td className="px-4 py-4">

                                                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                                                                {transfer.status}
                                                            </span>

                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            )}

                        </div>

                        <div className="border-t border-gray-200 p-5 text-right">

                            <button
                                type="button"
                                onClick={() =>
                                    setShowTransfers(false)
                                }
                                className="rounded-xl bg-[#02337D] px-5 py-3 font-semibold text-white hover:bg-[#01265C]"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

function SummaryCard({
    title,
    value,
    description,
    icon,
    warning = false,
}) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-gray-500">
                        {title}
                    </p>

                    <p
                        className={`mt-2 text-2xl font-bold ${warning
                            ? "text-red-600"
                            : "text-[#02337D]"
                            }`}
                    >
                        {value}
                    </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    {icon}
                </div>

            </div>

            <p className="mt-3 text-xs text-gray-500">
                {description}
            </p>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| BRANCH BADGE
|--------------------------------------------------------------------------
*/

function BranchBadge({ branch }) {
    const isRoysambu =
        branch === "Roysambu";

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isRoysambu
                ? "bg-blue-50 text-[#02337D]"
                : "bg-orange-50 text-[#FE7401]"
                }`}
        >
            {branch}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| MOVEMENT CARD
|--------------------------------------------------------------------------
*/

function MovementCard({
    movement,
    onReverse,
}) {
    const isPositive =
        movement.quantity > 0;

    const isReversal =
        movement.type ===
        "STOCK_REVERSAL";

    const isTransfer =
        movement.type ===
        "TRANSFER_IN" ||
        movement.type ===
        "TRANSFER_OUT";

    return (
        <div
            className={`rounded-xl border p-5 ${movement.reversed
                ? "border-gray-200 bg-gray-50 opacity-70"
                : "border-gray-200 bg-white"
                }`}
        >

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-4">

                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isReversal
                            ? "bg-red-100"
                            : isTransfer
                                ? "bg-blue-100"
                                : isPositive
                                    ? "bg-green-100"
                                    : "bg-gray-100"
                            }`}
                    >
                        {isReversal
                            ? "↩️"
                            : isTransfer
                                ? "↔️"
                                : isPositive
                                    ? "↗️"
                                    : "↘️"}
                    </div>

                    <div>

                        <div className="flex flex-wrap items-center gap-2">

                            <p className="font-bold text-gray-800">
                                {formatMovementType(
                                    movement.type
                                )}
                            </p>

                            {movement.reversed && (
                                <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                                    Reversed
                                </span>
                            )}

                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            {movement.reason}
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                            {movement.createdAt} •{" "}
                            {movement.createdBy}
                        </p>

                        {movement.transferId && (
                            <p className="mt-1 text-xs font-semibold text-[#02337D]">
                                Transfer:{" "}
                                {movement.transferId}
                            </p>
                        )}

                    </div>

                </div>

                <div className="flex items-center gap-5">

                    <div className="text-right">

                        <p
                            className={`text-lg font-bold ${movement.quantity > 0
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {movement.quantity > 0
                                ? "+"
                                : ""}
                            {movement.quantity}
                        </p>

                        <p className="text-xs text-gray-400">
                            {movement.previousStock} →{" "}
                            {movement.newStock}
                        </p>

                    </div>

                    {movement.type ===
                        "STOCK_ADDITION" &&
                        !movement.reversed && (
                            <button
                                type="button"
                                onClick={() =>
                                    onReverse(movement)
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                                Reverse
                            </button>
                        )}

                </div>

            </div>

        </div>
    );
}

/*
|--------------------------------------------------------------------------
| MOVEMENT TYPE
|--------------------------------------------------------------------------
*/

function formatMovementType(type) {
    const types = {
        OPENING_STOCK:
            "Opening Stock",

        STOCK_ADDITION:
            "Stock Addition",

        STOCK_REVERSAL:
            "Stock Reversal",

        SALE:
            "Sale",

        ADJUSTMENT:
            "Stock Adjustment",

        RETURN:
            "Customer Return",

        DAMAGED:
            "Damaged Stock",

        TRANSFER_IN:
            "Transfer In",

        TRANSFER_OUT:
            "Transfer Out",
    };

    return types[type] || type;
}