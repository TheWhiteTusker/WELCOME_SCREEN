import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { activeVideoId } = await request.json();
    
    if (!activeVideoId) {
      return NextResponse.json(
        { error: 'No active video ID provided' },
        { status: 400 }
      );
    }

    // Save the active video ID to a JSON file
    const configPath = path.join(process.cwd(), 'public', 'uploads', 'active-video.json');
    await writeFile(configPath, JSON.stringify({ activeVideoId }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving active video:', error);
    return NextResponse.json(
      { error: 'Error saving active video' },
      { status: 500 }
    );
  }
}
