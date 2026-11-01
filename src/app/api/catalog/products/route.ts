import { NextResponse } from "next/server";
import { listProducts } from "@/features/catalog/application/get-catalog";
import { parseCatalogSearchParams } from "@/features/catalog/domain/catalog-query";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseCatalogSearchParams(url.searchParams);
  const state = await listProducts(filters);
  if (state.status === "error") return NextResponse.json(state, { status: 502 });
  return NextResponse.json(state.data);
}
