import { NextResponse } from "next/server";
import { ApiError } from "@/core/errors/api-error";

export function jsonError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message, errors: error.fieldErrors },
      { status: error.statusCode && error.statusCode >= 400 ? error.statusCode : 500 },
    );
  }
  return NextResponse.json(
    { message: "The backend could not be reached. Start it on port 5000 and try again." },
    { status: 503 },
  );
}
