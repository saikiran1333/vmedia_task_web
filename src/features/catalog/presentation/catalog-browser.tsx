"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATALOGUE_BUDGETS,
  CATALOGUE_ORDERS,
  CATALOGUE_SORTS,
  LatestRequest,
  catalogPath,
  catalogSearchParams,
  emptyCatalogFilters,
  parseCatalogSearchParams,
  type CatalogFilters,
} from "@/features/catalog/domain/catalog-query";
import type { Occasion, ProductPage } from "@/features/catalog/domain/entities/product";
import type { LoadState } from "@/features/catalog/application/get-catalog";
import { ProductGrid } from "@/features/catalog/presentation/product-card";
import { SkeletonGrid } from "@/features/catalog/presentation/state-message";

const sortLabels: Record<string, string> = {
  name: "Name",
  price: "Price",
  newest: "Newest",
  updated: "Recently updated",
};

export function CatalogBrowser({
  initialFilters,
  initialState,
  occasions,
}: {
  initialFilters: CatalogFilters;
  initialState: LoadState<ProductPage>;
  occasions: Occasion[];
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [search, setSearch] = useState(initialFilters.q);
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const filtersRef = useRef(filters);
  const guard = useRef(new LatestRequest());
  const abortRef = useRef<AbortController | null>(null);
  const timer = useRef<number | null>(null);
  filtersRef.current = filters;

  async function apply(next: CatalogFilters, updateHistory: boolean) {
    const requestId = guard.current.start();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setFilters(next);
    filtersRef.current = next;
    setLoading(true);
    if (updateHistory) window.history.replaceState(null, "", catalogPath(next));
    try {
      const response = await fetch(`/api/catalog/products?${catalogSearchParams(next).toString()}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const payload = (await response.json()) as ProductPage & { title?: string; detail?: string; action?: string };
      if (!guard.current.isCurrent(requestId)) return;
      if (!response.ok || !Array.isArray(payload.items)) {
        setState({
          status: "error",
          title: payload.title || "The catalogue could not be loaded",
          detail: payload.detail || payload.message || "The request did not succeed.",
          action: payload.action || "Try again.",
        });
      } else {
        setState({ status: "ready", data: payload });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      if (!guard.current.isCurrent(requestId)) return;
      setState({
        status: "error",
        title: "Backend unreachable",
        detail: "The catalogue request did not finish.",
        action: "Check that the API on port 5000 is running, then try again.",
      });
    } finally {
      if (guard.current.isCurrent(requestId)) setLoading(false);
    }
  }

  useEffect(() => {
    function onPop() {
      const next = parseCatalogSearchParams(new URLSearchParams(window.location.search));
      setSearch(next.q);
      void apply(next, false);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // apply is recreated each render; the listener only needs the latest filters from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(patch: Partial<CatalogFilters>, resetPage = true) {
    const next = { ...filtersRef.current, ...patch, page: resetPage ? 1 : (patch.page ?? filtersRef.current.page) };
    void apply(next, true);
  }

  function onSearch(value: string) {
    setSearch(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      update({ q: value.trim().slice(0, 80) });
    }, 300);
  }

  const catalogueOccasions = occasions.filter((occasion) => occasion.catalogueFilter && occasion.name);
  const data = state.status === "ready" ? state.data : null;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / Math.max(data.pageSize, 1))) : 1;

  return (
    <div>
      <form
        className="tg-filters"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: search.trim().slice(0, 80) });
        }}
      >
        <label className="tg-field">
          Search
          <input value={search} maxLength={80} onChange={(event) => onSearch(event.target.value)} type="search" />
        </label>
        <label className="tg-field">
          Category
          <select value={filters.category} onChange={(event) => update({ category: event.target.value })}>
            <option value="">All categories</option>
            <option>Drinkware</option>
            <option>Apparel</option>
            <option>Work Essentials</option>
            <option>Wellness</option>
          </select>
        </label>
        <label className="tg-field">
          Occasion
          <select value={filters.occasion} onChange={(event) => update({ occasion: event.target.value })}>
            <option value="">All occasions</option>
            {catalogueOccasions.map((occasion) => (
              <option key={occasion.name} value={occasion.name ?? ""}>
                {occasion.enquiryLabel}
              </option>
            ))}
          </select>
        </label>
        <label className="tg-field">
          Budget
          <select value={filters.budget} onChange={(event) => update({ budget: event.target.value })}>
            <option value="">Any budget</option>
            {CATALOGUE_BUDGETS.map((budget) => (
              <option key={budget}>{budget}</option>
            ))}
          </select>
        </label>
        <label className="tg-field">
          Sort
          <select value={filters.sort} onChange={(event) => update({ sort: event.target.value })}>
            {CATALOGUE_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {sortLabels[sort]}
              </option>
            ))}
          </select>
        </label>
        <label className="tg-field">
          Order
          <select value={filters.order} onChange={(event) => update({ order: event.target.value })}>
            {CATALOGUE_ORDERS.map((order) => (
              <option key={order} value={order}>
                {order === "asc" ? "Ascending" : "Descending"}
              </option>
            ))}
          </select>
        </label>
        <label className="tg-check">
          <input type="checkbox" checked={filters.justIn} onChange={(event) => update({ justIn: event.target.checked })} />
          Just in
        </label>
        <label className="tg-check">
          <input
            type="checkbox"
            checked={filters.fastSelling}
            onChange={(event) => update({ fastSelling: event.target.checked })}
          />
          Fast selling
        </label>
        <button
          type="button"
          className="tg-button-secondary"
          onClick={() => {
            setSearch("");
            void apply(emptyCatalogFilters(), true);
          }}
        >
          Clear filters
        </button>
      </form>

      {loading ? <SkeletonGrid /> : null}
      {!loading && state.status === "error" ? (
        <div className="tg-alert" role="alert">
          <h2 className="tg-title">{state.title}</h2>
          <p className="tg-muted">{state.detail}</p>
          <p className="tg-muted">{state.action}</p>
          <button type="button" className="tg-button" onClick={() => void apply(filtersRef.current, false)}>
            Try again
          </button>
        </div>
      ) : null}
      {!loading && data && data.total === 0 ? (
        <div className="tg-alert">
          <h2 className="tg-title">Nothing matches</h2>
          <p className="tg-muted">No products match these filters.</p>
          <button
            type="button"
            className="tg-button"
            onClick={() => {
              setSearch("");
              void apply(emptyCatalogFilters(), true);
            }}
          >
            Clear filters
          </button>
        </div>
      ) : null}
      {!loading && data && data.total > 0 ? (
        <>
          <p className="tg-muted">
            {data.total} {data.total === 1 ? "product" : "products"}
          </p>
          <ProductGrid products={data.items} />
          <div className="tg-pager" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="tg-button-secondary"
              disabled={data.page <= 1}
              onClick={() => update({ page: data.page - 1 }, false)}
            >
              Previous
            </button>
            <span>
              Page {data.page} of {pageCount}
            </span>
            <button
              type="button"
              className="tg-button-secondary"
              disabled={data.page >= pageCount}
              onClick={() => update({ page: data.page + 1 }, false)}
            >
              Next
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
