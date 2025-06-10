import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadsDir);

    // Read active video configuration
    let activeVideoId = null;
    try {
      const configPath = path.join(uploadsDir, 'active-video.json');
      const configData = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configData);
      activeVideoId = config.activeVideoId;
    } catch (error) {
      console.log('No active video configuration found', error);
    }

    // Filter for video files and create video objects
    const videos = files
      .filter(file => file.match(/\.(mp4|webm|mov)$/i))
      .map(file => ({
        id: file,
        fileName: file,
        filePath: `/uploads/${file}`,
        title: file.replace(/\.[^/.]+$/, ""), // Remove file extension for title
        isActive: file === activeVideoId
      }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Error fetching videos' },
      { status: 500 }
    );
  }
} 