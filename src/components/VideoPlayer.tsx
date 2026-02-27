"use client";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, poster, autoPlay = false }: VideoPlayerProps) {
  return (
    <div className="bg-black rounded-xl overflow-hidden aspect-video">
      <ReactPlayer
        playing={autoPlay}
        controls
        width="100%"
        height="100%"
        light={poster}
        pip
        config={{
          html: {
            attributes: {
              poster: poster,
            },
          },
        }}
      >
        {src}
      </ReactPlayer>
    </div>
  );
}
