"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

const SIZES = ["XS", "S", "M", "L", "XL"];
const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "best_selling", label: "Best Selling" },
];

interface Props {
  categories: { name: string; slug: string }[];
  collections: { name: string; slug: string }[];
  currentParams: Record<string, string | undefined>;
}

export default function ShopFilters({ categories, collections, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(currentParams as Record<string, string>);
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page"); // reset pagination on any filter change
      router.push(`${pathname}?${params.toString()}`);
    },
    [currentParams, pathname, router]
  );

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginBottom: 40 }}>
      <label style={filterLabel}>
        Search
        <input
          type="search"
          defaultValue={currentParams.search ?? ""}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") updateParam("search", e.currentTarget.value);
          }}
          placeholder="Search pieces"
          style={filterInput}
        />
      </label>

      <label style={filterLabel}>
        Category
        <select
          value={currentParams.category ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("category", e.target.value || null)}
          style={filterInput}
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>

      <label style={filterLabel}>
        Collection
        <select
          value={currentParams.collection ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("collection", e.target.value || null)}
          style={filterInput}
        >
          <option value="">All</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>

      <label style={filterLabel}>
        Size
        <select
          value={currentParams.size ?? ""}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("size", e.target.value || null)}
          style={filterInput}
        >
          <option value="">All</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label style={filterLabel}>
        Availability
        <select
          value={currentParams.availability ?? "all"}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("availability", e.target.value)}
          style={filterInput}
        >
          <option value="all">All</option>
          <option value="in_stock">In Stock</option>
        </select>
      </label>

      <label style={filterLabel}>
        Sort by
        <select
          value={currentParams.sort ?? "featured"}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam("sort", e.target.value)}
          style={filterInput}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

const filterLabel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontFamily: "Inter, sans-serif",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "#3A2926",
};

const filterInput: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 13,
  padding: "9px 10px",
  border: "1px solid #765C4D66",
  background: "#F7F3EC",
  color: "#171515",
  minWidth: 140,
};
