import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, PlusCircle, Save, CheckCircle2 } from "lucide-react";

interface VideoFile {
  id: string;
  fileName: string;
  filePath: string;
  title: string;
  isActive?: boolean;
}

export function VideoManager() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        setVideos(data);
        setHasChanges(false); // Reset changes when loading videos
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load videos');
      }
    };

    fetchVideos();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    setSelectedFile(file);
  };

  const handleAddVideo = async () => {
    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!newVideoTitle.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newVideo: VideoFile = {
          id: data.fileName,
          fileName: data.fileName,
          filePath: data.filePath,
          title: newVideoTitle,
          isActive: videos.length === 0 // Make first video active by default
        };
        
        setVideos([...videos, newVideo]);
        toast.success('Video uploaded successfully');
        setNewVideoTitle('');
        setSelectedFile(null);
      } else {
        toast.error(data.error || 'Failed to upload video');
      }
    } catch (error) {
      toast.error('Error uploading video');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const response = await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Video deleted successfully');
        setVideos(videos.filter(video => video.fileName !== fileName));
      } else {
        toast.error(data.error || 'Failed to delete video');
      }
    } catch (error) {
      toast.error('Error deleting video');
      console.error('Delete error:', error);
    }
  };

  const handleSetActive = async (videoId: string) => {
    try {
      const updatedVideos = videos.map(video => ({
        ...video,
        isActive: video.id === videoId
      }));
      
      setVideos(updatedVideos);
      setHasChanges(true);
      toast.success('Video selected as active');
    } catch (error) {
      toast.error('Failed to update active video');
      console.error('Update error:', error);
    }
  };

  const handleSaveActiveVideo = async () => {
    const activeVideo = videos.find(video => video.isActive);
    if (!activeVideo) {
      toast.error('Please select an active video first');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/videos/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeVideoId: activeVideo.id }),
      });

      if (response.ok) {
        toast.success('Active video saved successfully');
        setHasChanges(false);
      } else {
        throw new Error('Failed to save active video');
      }
    } catch (error) {
      toast.error('Failed to save active video');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Videos</CardTitle>
        <CardDescription>Add or remove videos for the welcome screen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4 border p-4 rounded-lg">
            <h3 className="text-lg font-semibold">Add New Video</h3>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Video Title</Label>
                <Input
                  placeholder="Enter video title"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Select Video File</Label>
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept="video/*"
                  className="max-w-sm"
                />
              </div>
              <Button 
                onClick={handleAddVideo} 
                disabled={isUploading || !selectedFile || !newVideoTitle.trim()}
              >
                {isUploading ? "Uploading..." : <><PlusCircle className="mr-2 h-4 w-4" /> Add Video</>}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Current Videos</h3>
              <Button
                onClick={handleSaveActiveVideo}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
            {videos.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No videos uploaded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                      <video 
                        src={video.filePath} 
                        className="w-32 h-20 object-cover rounded"
                        controls
                      />
                      <div>
                        <h4 className="font-medium">{video.title}</h4>
                        <p className="text-sm text-gray-500">{video.fileName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={video.isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSetActive(video.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {video.isActive ? "Active" : "Set Active"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(video.fileName)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 