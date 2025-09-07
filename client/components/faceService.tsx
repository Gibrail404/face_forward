"use client";
import * as faceapi from "face-api.js";

// Keys for localStorage
const LS_DESCRIPTOR_KEY = "myapp_face_descriptor_v1";
const LS_THUMB_KEY = "myapp_face_thumbnail_v1";

export async function loadFaceModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  await faceapi.nets.faceExpressionNet.loadFromUri("/models"); // add moods
}

export async function startCamera(videoEl: HTMLVideoElement) {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoEl.srcObject = stream;
  await videoEl.play();
}

export function stopCamera(videoEl: HTMLVideoElement) {
  if (videoEl.srcObject) {
    const stream = videoEl.srcObject as MediaStream;
    stream.getTracks().forEach((t) => t.stop());
    videoEl.srcObject = null;
  }
}

export function captureSnapshot(videoEl: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

/**
 * Enroll once and save descriptor + snapshot
 */
export async function enrollFace(videoEl: HTMLVideoElement) {
  const result = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) throw new Error("No face detected");

  const descriptorArray = Array.from(result.descriptor);
  const thumbnail = captureSnapshot(videoEl);

  localStorage.setItem(LS_DESCRIPTOR_KEY, JSON.stringify(descriptorArray));
  localStorage.setItem(LS_THUMB_KEY, thumbnail);

  return { descriptor: descriptorArray, thumbnail };
}

export function getStoredEnrollment() {
  const stored = localStorage.getItem(LS_DESCRIPTOR_KEY);
  const thumb = localStorage.getItem(LS_THUMB_KEY);
  return {
    descriptor: stored ? JSON.parse(stored) : null,
    thumbnail: thumb || null,
  };
}

export async function verifyFace(descriptor: number[]) {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ descriptor }),
  });
  return res.json();
}

/**
 * Live detection loop — returns mood, landmarks, bounding boxes, etc.
 */
export async function detectFaces(videoEl: HTMLVideoElement) {
  const detections = await faceapi
    .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withFaceDescriptors(); // optional if you want live vectors too

  return detections.map((d) => ({
    box: d.detection.box, // {x,y,width,height}
    landmarks: d.landmarks, // facial points
    expressions: d.expressions, // mood probabilities
    descriptor: Array.from(d.descriptor), // 128D vector
  }));
}
