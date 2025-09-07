"use client";
import { useEffect, useRef, useState } from "react";
import {
  loadFaceModels,
  startCamera,
  stopCamera,
  enrollFace,
  detectFaces,
} from "./faceService";

export default function FaceMoodBox({
  onEnroll,
}: {
  onEnroll: (data: { descriptor: number[]; thumbnail: string }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    let loopId: number | null = null;
    let runningDetect = false;

    (async () => {
      try {
        await loadFaceModels();
        if (!mounted) return;
        setModelsLoaded(true);

        if (videoRef.current && !videoRef.current.srcObject) {
          try {
            await startCamera(videoRef.current);
          } catch (err) {
            console.error("startCamera error:", err);
            return;
          }
        }

        loopId = window.setInterval(async () => {
          if (!mounted) return;
          const video = videoRef.current;
          if (!video || runningDetect) return;

          runningDetect = true;
          try {
            const detections = await detectFaces(video);
            if (detections && detections.length > 0) {
              // You can use mood logic here if needed
            }
          } catch (err) {
            console.error("Detection error:", err);
          } finally {
            runningDetect = false;
          }
        }, 200);
      } catch (err) {
        console.error("FaceMoodBox init error:", err);
      }
    })();

    return () => {
      mounted = false;
      if (loopId) clearInterval(loopId);
      if (videoRef.current) {
        try {
          stopCamera(videoRef.current);
        } catch (e) {
          console.warn("stopCamera error:", e);
        }
      }
    };
  }, []);

  const handleEnroll = async () => {
    if (!videoRef.current) return;
    try {
      const data = await enrollFace(videoRef.current);

      // 🔹 stop camera here
      stopCamera(videoRef.current);

      // 🔹 return data to parent
      onEnroll(data);
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full max-w-[800px] aspect-video border rounded-lg shadow-lg"
      />
      <button
        onClick={handleEnroll}
        className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg"
      >
        Confirm (Enroll)
      </button>
    </div>
  );
}
