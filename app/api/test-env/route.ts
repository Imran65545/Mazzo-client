import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        keys: Object.keys(process.env),
        hasJwtSecret: !!process.env.JWT_SECRET,
        mongoUriStartsWith: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) : 'undefined',
        nodeEnv: process.env.NODE_ENV,
    });
}
