"use client";
import { useEffect, useRef, useState } from "react";
import { loadFaceModels, startCamera, stopCamera, captureFaceEmbedding, verifyFace } from "./faceService";

export default function FaceWidget() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    loadFaceModels().then(() => setModelsReady(true));
    return () => {
      if (videoRef.current) stopCamera(videoRef.current);
    };
  }, []);

  const handleStart = async () => {
    if (videoRef.current) {
      await startCamera(videoRef.current);
    }
  };

  const handleVerify = async () => {
    if (!videoRef.current) return;
    const descriptor = await captureFaceEmbedding(videoRef.current);
    if (!descriptor) {
      alert("No face detected");
      return;
    }

    const result = await verifyFace(descriptor);
    alert(result.success ? "✅ Verified!" : `❌ Failed: ${result.message}`);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay muted playsInline className="w-64 h-48 border" />
      <div className="flex gap-2 mt-2">
        <button onClick={handleStart} disabled={!modelsReady}>Start Camera</button>
        <button onClick={handleVerify} disabled={!modelsReady}>Verify</button>
      </div>
    </div>
  );
}
