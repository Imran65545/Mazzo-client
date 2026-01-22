import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthRequest extends NextRequest {
  user?: { id: string };
}

export function protect(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (req: AuthRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      req.user = { id: decoded.id };
      return handler(req);
    } catch {
      return NextResponse.json({ message: "Token invalid" }, { status: 401 });
    }
  };
}

export function getUserIdFromToken(req: NextRequest): string | null {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}
