// src/app/api/guests/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT guests FROM "Guest_Names" WHERE id = 1');
    const guests = result.rows[0]?.guests || [];
    return NextResponse.json(guests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const guests = await req.json(); // this is the updated guest array
    await pool.query('UPDATE "Guest_Names" SET guests = $1 WHERE id = 1', [JSON.stringify(guests)]);
    return NextResponse.json({ message: "Guests updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
