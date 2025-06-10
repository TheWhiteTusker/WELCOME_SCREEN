// src/app/api/news/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM "news"'); // Capital N to match actual table
    return NextResponse.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching news:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
    }

    await pool.query('INSERT INTO "news" (title) VALUES ($1)', [title]);
    return NextResponse.json({ message: "News added" });
  } catch (err: any) {
    console.error('Error adding news:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await pool.query('DELETE FROM "news" WHERE id = $1', [id]);
    return NextResponse.json({ message: "News deleted" });
  } catch (err: any) {
    console.error('Error deleting news:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
