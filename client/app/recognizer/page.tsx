"use client";
import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SIMILARITY_THRESHOLD = 0.96; // strict matching
const DETECTION_INTERVAL = 500; // detection every 500ms
const COOLDOWN_MS = 5000; // min time before calling API again
const REMOVE_AFTER_MS = 500; // remove faces not seen for this long
const BOX_SMOOTHING = 0.3; // lerp factor for box smoothing

// cosine similarity
const cosineSimilarity = (a: Float32Array, b: Float32Array) => {
    let dot = 0,
        normA = 0,
        normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] ** 2;
        normB += b[i] ** 2;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

type CachedFace = {
    embedding: Float32Array;
    name: string;
    id?: string;
    lastSeen: number;
    lastApiCall: number;
    box: faceapi.Box;
};

interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}
export default function FaceDetectionWithAPI() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const loopRef = useRef<number | null>(null);
    const [loading, setLoading] = useState(true);

    const cachedFaces = useRef<CachedFace[]>([]);

    useEffect(() => {
        const loadModels = async () => {
            await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
            await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
            await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
            await faceapi.nets.faceExpressionNet.loadFromUri("/models");

            await startCamera();
            setLoading(false); // models + camera ready
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

        const runDetection = async () => {
            if (!videoRef.current) return;

            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions()
                .withFaceDescriptors();

            const now = Date.now();

            for (const det of detections) {
                const descriptor = det.descriptor;
                const box = det.detection.box;

                // Primary match: cosine similarity
                let match = cachedFaces.current.find(
                    (f) => cosineSimilarity(f.embedding, descriptor) > SIMILARITY_THRESHOLD
                );

                if (match) {
                    match.lastSeen = now;

                    // Smoothly update box

                    match.box = new faceapi.Box({
                        x: match.box.x * (1 - BOX_SMOOTHING) + box.x * BOX_SMOOTHING,
                        y: match.box.y * (1 - BOX_SMOOTHING) + box.y * BOX_SMOOTHING,
                        width: match.box.width * (1 - BOX_SMOOTHING) + box.width * BOX_SMOOTHING,
                        height: match.box.height * (1 - BOX_SMOOTHING) + box.height * BOX_SMOOTHING,
                    });

                } else {
                    // Add new unknown face
                    cachedFaces.current.push({
                        embedding: descriptor,
                        name: "Unknown",
                        lastSeen: now,
                        lastApiCall: 0,
                        box,
                    });
                }
            }

            // Remove old faces not seen recently
            cachedFaces.current = cachedFaces.current.filter(
                (f) => now - f.lastSeen < REMOVE_AFTER_MS
            );

            drawBoxes();
        };

        const drawBoxes = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            const now = Date.now();

            cachedFaces.current.forEach(async (f) => {
                // Call API if unknown or cooldown passed
                if (f.name === "Unknown" || now - f.lastApiCall > COOLDOWN_MS) {
                    try {
                        f.lastApiCall = now;
                        const res = await fetch("http://localhost:5000/api/employees/match", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ descriptor: Array.from(f.embedding) }),
                        });
                        const data = await res.json();
                        if (data?.greeting) {
                            toast.success(`${data.greeting[0]}\n ${data.greeting[1]}`, { position: "bottom-left" });
                        }
                        f.name = data?.employee?.name || "Unknown";
                        f.id = data?.employee?.id;
                    } catch (err) {
                        console.error("API error:", err);
                    }
                }

                // Draw box
                ctx.strokeStyle = f.name !== "Unknown" ? "lime" : "red";
                ctx.lineWidth = 2;
                ctx.strokeRect(f.box.x, f.box.y, f.box.width, f.box.height);

                // Draw label
                ctx.fillStyle = f.name !== "Unknown" ? "lime" : "red";
                ctx.font = "16px Arial";
                ctx.fillText(f.name, f.box.x, f.box.y - 8);
            });
        };

        runDetection();
        loopRef.current = window.setInterval(runDetection, DETECTION_INTERVAL);
    };

    return (
        <div className="relative w-full h-screen bg-gray-900 flex justify-center items-center">
            {/* Camera container */}
            {/* Home button */}
            <button
                className="absolute top-12 right-24 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition z-10 cursor-pointer"
                onClick={() => {
                    window.location.href = "/";
                }}
            >
                Close
            </button>
            <div className="relative w-full max-w-4xl">
                {loading && (
                    <div className="absolute inset-0 flex justify-center items-center bg-gray-900 bg-opacity-70 z-20">
                        {/* Circular loader */}
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className="w-full h-auto object-contain rounded-lg shadow-lg"
                    autoPlay
                    muted
                />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 h-full w-auto pointer-events-none"
                />
            </div>
            <ToastContainer />
        </div>
    );
}
