// faceService.ts
"use client";
import * as faceapi from "face-api.js";

/**
 * Initialize models (call this once at app startup).
 * Ensure that the /models directory exists in public folder.
 */
export async function loadFaceModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
}

/**
 * Start the camera and attach it to a video element.
 */
export async function startCamera(videoEl: HTMLVideoElement): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoEl.srcObject = stream;
  await videoEl.play();
  return stream;
}

/**
 * Stop the camera stream.
 */
export function stopCamera(videoEl: HTMLVideoElement) {
  const stream = videoEl.srcObject as MediaStream | null;
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    videoEl.srcObject = null;
  }
}

/**
 * Capture face embedding (128-d descriptor) from the current video frame.
 */
export async function captureFaceEmbedding(videoEl: HTMLVideoElement): Promise<number[] | null> {
  const result = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) return null;

  return Array.from(result.descriptor); // Float32Array -> number[]
}

/**
 * Verify face embedding by calling backend API.
 * @param descriptor Array of 128 floats
 */
export async function verifyFace(descriptor: number[]): Promise<{ success: boolean; message?: string }> {
    console.log("Verifying descriptor:", descriptor);
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descriptor }),
  });

  return await res.json();
}
