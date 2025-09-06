"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState<string>("");

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models"; // public/models folder in Next.js
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      startVideo();
    };
    loadModels();
  }, []);

  // Start webcam stream
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera not available:", err));
  };

  // Detect faces from video
  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.addEventListener("play", () => {
      const canvas = canvasRef.current;
      if (!canvas || !videoRef.current) return;

      const displaySize = {
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      };

      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoRef.current!, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resized = faceapi.resizeResults(detections, displaySize);

        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);

        if (detections.length > 0) {
          setDetections("✅ Face detected. Attendance Marked.");
          // 👉 Here you can call your backend API
          // fetch("http://localhost:5000/api/attendance", { method: "POST", body: JSON.stringify({ employeeId }) })
        } else {
          setDetections("❌ No face detected.");
        }
      }, 1000);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">Employee Attendance</h1>

      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="rounded-xl shadow-lg border"
          width="640"
          height="480"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0"
          width="640"
          height="480"
        />
      </div>

      <p className="mt-6 text-lg font-semibold">{detections}</p>
    </div>
  );
}
