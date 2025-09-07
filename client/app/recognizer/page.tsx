"use client";
import { useEffect, useRef } from "react";
import * as faceapi from "face-api.js";

const COOLDOWN_MS = 3000; // 3s cooldown for new faces
const SIMILARITY_THRESHOLD = 0.96; // cosine similarity threshold
const REMOVE_AFTER_MS = 5000; // remove faces not seen for 5s

// helper to compute cosine similarity for Float32Array
const cosineSimilarity = (a: Float32Array, b: Float32Array) => {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

type CachedFace = {
  embedding: Float32Array;
  name: string;
  id?: string;
  lastSeen: number;
};

export default function FaceDetectionWithAPI() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number | null>(null);

  const cachedFaces = useRef<CachedFace[]>([]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

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

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    const run = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptors();

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const now = Date.now();

      for (const det of detections) {
        const box = det.detection.box;
        const descriptor = det.descriptor;

        // find matching cached face by embedding similarity
        let match: CachedFace | undefined = cachedFaces.current.find(
          (f) => cosineSimilarity(f.embedding, descriptor) > SIMILARITY_THRESHOLD
        );

        let displayName = "Unknown";

        if (match) {
          displayName = match.name;
          match.lastSeen = now;
        } else {
          // new face: call API
          try {
            const res = await fetch("http://localhost:5000/api/employees/match", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ descriptor: Array.from(descriptor) }),
            });

            const data = await res.json();
            const name = data?.employee?.name || "Unknown";
            displayName = name;

            cachedFaces.current.push({
              embedding: descriptor,
              name,
              id: data?.employee?.id,
              lastSeen: now,
            });
          } catch (err) {
            console.error("Error fetching match:", err);
          }
        }

        // draw box
        ctx.strokeStyle = displayName !== "Unknown" ? "lime" : "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // draw label
        ctx.fillStyle = displayName !== "Unknown" ? "lime" : "red";
        ctx.font = "16px Arial";
        ctx.fillText(displayName, box.x, box.y - 8);
      }

      // remove old faces not seen for a while
      cachedFaces.current = cachedFaces.current.filter(
        (f) => now - f.lastSeen < REMOVE_AFTER_MS
      );
    };

    run();
    loopRef.current = window.setInterval(run, 200);
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
