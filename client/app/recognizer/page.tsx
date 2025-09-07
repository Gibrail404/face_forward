"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const COOLDOWN_MS = 3000; // 3 seconds cooldown per face

export default function FaceDetectionWithAPI() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const lastLogTime = useRef<Map<number, number>>(new Map());
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceNames, setFaceNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setModelsLoaded(true);
      await startCamera();
      startDetectionLoop();
    };

    loadModels();

    return () => {
      stopCamera();
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startDetectionLoop = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const run = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors(); // include embeddings

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      detections.forEach(async (det, idx) => {
        const { box } = det.detection;
        const x = box.x + box.width * 0.25; // adjust position if needed
        const y = box.y;
        const width = box.width;
        const height = box.height;

        // Draw box
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Get last API call timestamp for cooldown
        const now = Date.now();
        const lastTime = lastLogTime.current.get(idx) || 0;

        if (now - lastTime > COOLDOWN_MS) {
          lastLogTime.current.set(idx, now);

          // Send descriptor to API for identification
          const res = await fetch("http://localhost:5000/api/employees/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descriptor: Array.from(det.descriptor) }),
          });
          const data = await res.json();
          const name = data?.user?.name || "Unknown";

          // Update state
          setFaceNames((prev) => new Map(prev).set(idx, name));
        }

        // Draw name above box
        ctx.fillStyle = "red";
        ctx.font = "16px Arial";
        const displayName = faceNames.get(idx) || "Unknown";
        ctx.fillText(displayName, x, y - 8);
      });
    };

    run(); // first run immediately
    loopRef.current = window.setInterval(run, 200); // repeat every 200ms
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <video ref={videoRef} className="w-full h-auto" autoPlay muted />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
