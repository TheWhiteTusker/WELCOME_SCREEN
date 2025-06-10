"use client"

import { useEffect, useRef, useState } from "react"
// import { supabase } from "./lib/supabase"

type Guest = {
  name: string
  designation: string
  department: string
}

type WelcomeData = {
  id: number
  guests: Guest[]
}

type NewsItem = {
  id: number
  title: string
}

interface Video {
  id: string;
  fileName: string;
  filePath: string;
  title: string;
  isActive: boolean;
}

export default function Page() {
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const tickerRef = useRef<HTMLDivElement>(null)
  const [reloadCount, setReloadCount] = useState(0)
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)

  useEffect(() => {
    fetchWelcomeData()
    fetchNewsData()
    fetchVideos()
  }, [])

  useEffect(() => {
    loadWeatherWidget()
  }, [reloadCount])

  useEffect(() => {
    if (videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [videos.length]);

  const fetchWelcomeData = async () => {
    try {
      const response = await fetch("/api/guests");
      const guests = await response.json();

      if (Array.isArray(guests)) {
        setWelcomeData({
          id: 1,           // static ID
          guests: guests,  // this is the full array of guest objects
        });
      } else {
        console.error("Unexpected guest data format", guests);
      }
    } catch (error) {
      console.error("Error fetching welcome data", error);
    }
  };


  const fetchNewsData = async () => {
    try {
      const response = await fetch("/api/news");
      const data = await response.json();

      if (Array.isArray(data)) {
        setNewsItems(data);
      } else {
        console.error("Invalid news data format", data);
      }
    } catch (error) {
      console.error("Error fetching news data", error);
    }
  };

  const fetchVideos = async () => {
    try {
      // Fetch videos
      const videosResponse = await fetch('/api/videos');
      const videosData = await videosResponse.json();
      setVideos(videosData);

      // Fetch active video configuration
      const activeConfigResponse = await fetch('/uploads/active-video.json');
      if (activeConfigResponse.ok) {
        const { activeVideoId } = await activeConfigResponse.json();
        const active = videosData.find((video: Video) => video.id === activeVideoId) || videosData[0];
        setActiveVideo(active);
      } else {
        // If no active video config, use the first video
        setActiveVideo(videosData[0]);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      // If there are videos but error fetching config, use the first video
      if (videos.length > 0) {
        setActiveVideo(videos[0]);
      }
    }
  };

  const loadWeatherWidget = () => {
    const existingScript = document.querySelector("script[src='https://weatherwidget.io/js/widget.min.js']")
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement("script")
    script.src = "https://weatherwidget.io/js/widget.min.js"
    script.async = true
    script.onload = () => console.log("Weather widget loaded successfully")
    script.onerror = () => {
      console.error("Weather widget failed to load, retrying...")
      if (reloadCount < 3) {
        setTimeout(() => setReloadCount((prev) => prev + 1), 5000)
      }
    }
    document.body.appendChild(script)
  }


  useEffect(() => {
    if (!tickerRef.current) return;

    const ticker = tickerRef.current;

    // Clean old clones if any
    const oldClones = ticker.parentNode?.querySelectorAll(".ticker-clone");
    oldClones?.forEach((clone) => clone.remove());

    // Clone ticker content
    const clone = ticker.cloneNode(true) as HTMLElement;
    clone.classList.add("ticker-clone");
    ticker.parentNode?.appendChild(clone);

    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = `${ticker.offsetWidth}px`; // Next to original
    clone.style.whiteSpace = "nowrap";

    const calculateDuration = () => {
      const tickerWidth = ticker.offsetWidth;
      const cloneWidth = clone.offsetWidth;
      const totalWidth = tickerWidth + cloneWidth;
      const speed = 50; // pixels per second
      const duration = totalWidth / speed;

      ticker.style.animation = `ticker-scroll ${duration}s linear infinite`;
      clone.style.animation = `ticker-scroll ${duration}s linear infinite`;
    };

    calculateDuration();

    window.addEventListener("resize", calculateDuration);
    return () => {
      window.removeEventListener("resize", calculateDuration);
    };
  }, [newsItems]);



  return (
    <div className="flex flex-col h-screen bg-gray-100 p-10">
      {/* Header */}
      <div className="bg-black text-white py-3 text-center">
        <h1 className="text-2xl font-bold">Welcome to Connected Ecosystem Experience Center</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden py-10">
        {/* Main Display */}
        <div className="flex-1 relative overflow-hidden">
          {activeVideo ? (
            <video
              key={activeVideo.id}
              className="absolute inset-0 w-full h-full"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src={activeVideo.filePath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No videos available</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        {welcomeData && Array.isArray(welcomeData.guests) && welcomeData.guests.length > 0 && (
          <div className="w-full md:w-[30%] flex flex-col border-t md:border-t-0 md:border-l-3 border-red-600">
            <div className="p-6 text-center overflow-auto">
              <h3 className="text-black text-2xl font-bold">GETC</h3>
              <h3 className="text-black text-2xl mb-6 font-bold">Welcomes</h3>
              {welcomeData && Array.isArray(welcomeData.guests) && welcomeData.guests.map((guest, index) => (
                <div key={index} className="mb-0 flex flex-col items-center text-center">
                  <h4 className="text-xl text-black font-bold">{guest.name}</h4>
                  <p className="text-red-600 font-medium">{guest.designation}</p>
                  <p className="text-red-600">{guest.department}</p>
                  {index !== welcomeData.guests.length - 1 && (
                    <div className="w-1/2 my-4 border-t-2 border-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <a
          className="weatherwidget-io"
          href="https://forecast7.com/en/12d9777d59/bengaluru/"
          data-label_1="BENGALURU"
          data-label_2="WEATHER"
          data-theme="mountains"
        >
          BENGALURU WEATHER
        </a>
      </div>

      {/* News Ticker */}
      <div className="bg-black text-white py-3 px-2 overflow-hidden relative">
        <div className="ticker-container overflow-hidden relative w-full">
          <div
            ref={tickerRef}
            className="ticker-content inline-block whitespace-nowrap"
            style={{
              animation: "none",
              willChange: "transform",
            }}
          >
            {newsItems.map((item, index) => (
              <span key={item.id} className="text-lg">
                {item.title}
                {index < newsItems.length - 1 && <span className="mx-8">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Global styles for ticker animation */}
      <style jsx global>{`
  .ticker-container {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  }

  .ticker-content {
    display: inline-block;
    white-space: nowrap;
  }

  @keyframes ticker-scroll {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
`}</style>
    </div>
  )
}
