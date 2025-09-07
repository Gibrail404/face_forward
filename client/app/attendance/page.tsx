"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Initializing...");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      setStatus("Loading face recognition models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setModelsLoaded(true);
      setStatus("Models loaded. Starting camera...");
      startVideo();
    };
    loadModels();
  }, []);

  // Start webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setStatus("Error accessing webcam"));
  };

  // Detect face continuously
  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const displaySize = {
          width: videoRef.current.width,
          height: videoRef.current.height,
        };

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvasRef.current
          .getContext("2d")
          ?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        if (detections.length > 0) {
          setStatus("Face detected ✅");
          // 🚀 Call your backend to mark attendance
          // fetch("http://localhost:5000/api/attendance/mark", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //     Authorization: `Bearer ${localStorage.getItem("token")}`,
          //   },
          //   body: JSON.stringify({ employeeId: "EMP123" }),
          // });
        } else {
          setStatus("No face detected ❌");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [modelsLoaded]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 drop-shadow-md">
        Attendance via Face Recognition
      </h2>

      <div className="relative shadow-xl rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
          className="rounded-xl"
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          className="absolute top-0 left-0"
        />
      </div>

      <div className="mt-6 px-6 py-3 bg-white shadow-md rounded-xl text-center">
        <p className="text-gray-700 font-medium">{status}</p>
      </div>
    </div>
  );
}
