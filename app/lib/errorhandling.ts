import { NextResponse } from "next/server";

type Handler = (req: Request) => Promise<Response>;

export function withErrorHandling(handler: Handler) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      if (err.message === "FORBIDDEN" || err.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // .error("API Error:", err);

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
