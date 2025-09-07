"use client";
import { useEffect, useRef, useState } from "react";
import {
  loadFaceModels,
  startCamera,
  stopCamera,
  enrollFace,
  detectFaces,
} from "./faceService";

export default function FaceMoodBox() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [mood, setMood] = useState<string>("");

  useEffect(() => {
    (async () => {
      await loadFaceModels();
      setModelsLoaded(true);
      if (videoRef.current) await startCamera(videoRef.current);

      // start loop
      const loop = setInterval(async () => {
        if (!videoRef.current) return;
        const detections = await detectFaces(videoRef.current);
        if (detections.length > 0) {
          // find mood with highest probability
          const expressions = detections[0].expressions;
          const best = Object.entries(expressions).reduce((a, b) =>
            a[1] > b[1] ? a : b
          );
          setMood(best[0]); // e.g. "happy", "neutral", "angry"
        }
      }, 200);

      return () => {
        clearInterval(loop);
        if (videoRef.current) stopCamera(videoRef.current);
      };
    })();
  }, []);

  const handleEnroll = async () => {
    if (!videoRef.current) return;
    const data = await enrollFace(videoRef.current);
    console.log("Descriptor:", data.descriptor);
    console.log("Thumbnail:", data.thumbnail);
  };

  return (
    <div className="flex flex-col items-center">
      <video ref={videoRef} autoPlay muted playsInline className="w-64 h-64 border" />
      <p className="mt-2">Mood: {mood || "Detecting..."}</p>
      <button onClick={handleEnroll} className="mt-3 px-4 py-2 bg-green-500">
        Confirm (Enroll)
      </button>
    </div>
  );
}
