

"use client";
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import FaceMoodBox from "./face";
import api from "@/utils/api";

const AddEmployee = ({ updateUser, setUpdateUser }: { updateUser: any, setUpdateUser: any }) => {
  const [formData, setFormData] = useState({
    emp_id: "",
    name: "",
    department: "",
    email: "",
  });

  useEffect(() => {
    if (updateUser && Object.keys(updateUser).length !== 0) {
      setFormData(updateUser);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [updateUser]);

  const [photo, setPhoto] = useState<string | null>(null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null); // store before showing final
  const [showGif, setShowGif] = useState(false); // loader state
  const [showCamera, setShowCamera] = useState(false);
  const [status, setStatus] = useState("Click take photo to capture photo");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      setStatus("Loading face recognition models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setModelsLoaded(true);
      setStatus("Models loaded ✅");
    };
    loadModels();
  }, []);

  // Start camera
  const startCamera = async () => {
    if (!modelsLoaded) {
      alert("Models are still loading, please wait...");
      return;
    }
    setShowCamera(true);
    setStatus("Starting camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setStatus("Camera ready, detecting face...");
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("Error accessing webcam ❌");
    }
  };

  // Detect face
  useEffect(() => {
    if (!showCamera || !modelsLoaded) return;

    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        const displaySize = {
          width: videoRef.current.width,
          height: videoRef.current.height,
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resized = faceapi.resizeResults(detections, displaySize);

        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        let highConfidenceDetected = false;

        resized.forEach((det) => {
          const { x, y, width, height } = det.detection.box;
          if (det.detection.score >= 0.90) {
            ctx!.strokeStyle = "lime";
            ctx!.lineWidth = 4;
            ctx!.strokeRect(x, y, width, height);
            highConfidenceDetected = true;
          } else {
            ctx!.strokeStyle = "red";
            ctx!.lineWidth = 2;
            ctx!.strokeRect(x, y, width, height);
          }
        });

        if (highConfidenceDetected && countdown === null) {
          setStatus("High confidence face detected ✅ Starting countdown...");
          setCountdown(3);
        } else if (!highConfidenceDetected && detections.length > 0) {
          setStatus("Face detected but confidence < 0.99");
        } else if (detections.length === 0) {
          setStatus("No face detected");
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [showCamera, modelsLoaded]);

  // Countdown + capture
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => (c ? c - 1 : 0)), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capturePhoto();
      stopCamera();
      setCountdown(null);
    }
  }, [countdown]);

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Match canvas to preview box size
        const boxSize = 160; // same as w-40 h-40
        canvasRef.current.width = boxSize;
        canvasRef.current.height = boxSize;

        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Get square crop from center
        const size = Math.min(videoWidth, videoHeight);
        const sx = (videoWidth - size) / 2;
        const sy = (videoHeight - size) / 2;

        // Draw only the cropped square area into canvas
        context.drawImage(
          videoRef.current,
          sx,
          sy,
          size,
          size,
          0,
          0,
          boxSize,
          boxSize
        );

        const dataUrl = canvasRef.current.toDataURL("image/png");

        // Show GIF first
        setShowGif(true);
        setTempPhoto(dataUrl);
        setPhoto(null);

        // Replace GIF with actual photo after 3s
        setTimeout(() => {
          setPhoto(dataUrl);
          setShowGif(false);
          setStatus("Photo captured 🎉");
        }, 3000);
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
  };

  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // helper to encode face from photo
  const encodeFaceFromPhoto = async (photoDataUrl: string) => {
    return new Promise<{ descriptor: number[]; thumbnail: string }>(async (resolve, reject) => {
      try {
        const img = new Image();
        img.src = photoDataUrl;
        img.onload = async () => {
          const detection = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (!detection) {
            reject(new Error("No face detected in captured photo."));
            return;
          }

          const descriptor = Array.from(detection.descriptor);
          resolve({ descriptor, thumbnail: photoDataUrl });
        };
        img.onerror = () => reject(new Error("Failed to load captured photo."));
      } catch (err) {
        reject(err);
      }
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emp_id || !formData.name || !formData.department || !formData.email) {
      alert("Please fill all fields.");
      return;
    }

    try {
      let res, data;

      // 🔹 If updateUser exists => UPDATE flow
      if (updateUser && Object.keys(updateUser).length !== 0) {
        setStatus("Updating employee...");

        res = await fetch(`http://localhost:5000/api/employees/update/${updateUser._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            department: formData.department,
            email: formData.email,
          }),
        });

        data = await res.json();
        if (!res.ok) {
          alert(data.message || "Error updating employee");
          return;
        }

        setStatus("✅ Employee updated successfully");
      } else {
        // 🔹 Otherwise => ADD flow
        if (!photo) {
          alert("Please capture a photo for new employee.");
          return;
        }

        setStatus("Encoding face...");
        const raw = localStorage.getItem('myapp_face_descriptor_v1')!;
        console.log("myapp_face_descriptor_v1 : ",raw);
        const descriptor = JSON.parse(raw);

        const payload = {
          emp_id: formData.emp_id,
          name: formData.name,
          department: formData.department,
          email: formData.email,
          faceEncoding: descriptor,
        };

        const add_response = await api.post("api/employees/add",payload);

        const is_success = add_response.data;
        if (add_response.status != 200) {
          alert(is_success.message || "Error saving employee");
          return;
        }

        setStatus("✅ Employee added successfully");
      }
      setFormData({
        emp_id: "",
        name: "",
        department: "",
        email: "",
      })
      localStorage.removeItem('myapp_face_descriptor_v1');
      localStorage.removeItem('myapp_face_thumbnail_v1');
      setPhoto(null);
    } catch (err) {
      console.error(err);
      alert("Error saving/updating employee");
    }
  };


  return (
    <div className="p-10 rounded-xl ">
      <h2 className="text-xl font-bold mb-4 text-center">{`${Object.keys(updateUser).length !== 0 ? "Update Employee Data" : "Add New Employee"}`}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="emp_id"
          placeholder="Employee ID (e.g. AGL0000)"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
          value={formData.emp_id}
        />
        <input
          name="name"
          placeholder="Full Name"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
          value={formData.name}
        />
        <input
          name="department"
          placeholder="Department"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
          value={formData.department}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
          value={formData.email}
        />

        {/* Centered capture box */}
        {updateUser && Object.keys(updateUser).length == 0 && <div className="flex justify-center">
          {photo ? (
            <img src={photo} alt="Captured" className="w-40 h-40 object-cover rounded border" />
          ) : showGif ? (
            <img src="/static/ai.gif" alt="Scanning..." className="w-40 h-40 object-cover" />
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="bg-blue-950 w-full flex gap-2 items-center justify-center hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-blue-700 shadow-2xs border-none transition"
            >
              Take Photo
            </button>
          )}
        </div>}

        <div className="flex space-x-4 justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-white text-black rounded-lg shadow-blue-700 shadow-2xs hover:bg-blue-700 px-4 py-2 cursor-pointer hover:text-white"
          >
            Submit
          </button>
          <button
            type="reset"
            className="bg-white text-black rounded-lg shadow-blue-700 shadow-2xs hover:bg-blue-700 px-4 py-2 cursor-pointer hover:text-white"
            onClick={() => {
              setFormData({ emp_id: "", name: "", department: "", email: "" });
              setStatus("Click take photo to capture photo");
              setPhoto(null);
              setTempPhoto(null);
              setShowGif(false);
            }}
          >
            Reset
          </button>
          {photo ? (<button
            type="reset"
            className="bg-white text-black rounded-lg shadow-blue-700 shadow-2xs hover:bg-blue-700 px-4 py-2 cursor-pointer hover:text-white"
            onClick={() => {
              setPhoto(null);
              setShowGif(false);
              setShowCamera(true);
            }}
          >
            Retake
          </button>) : null}
        </div>
      </form>

      {/* Camera Popup */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-1/2 relative">
            <h3 className="text-center text-lg font-bold">Camera</h3>

            {/* 🔹 Reuse FaceMoodBox */}
            <FaceMoodBox
              onEnroll={(data) => {
                // save captured thumbnail
                setPhoto(data.thumbnail);
                // store encoding for submit
                (formData as any).faceEncoding = data.descriptor;

                setStatus("Photo & descriptor captured 🎉");
                setShowCamera(false); // 🔹 close popup automatically
                stopCamera()
              }}
            />

            {/* <button
              onClick={() => setShowCamera(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Close
            </button> */}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-6 px-6 py-3 bg-white shadow-md rounded-xl text-center max-w-max ms-auto me-auto">
        <p className="text-gray-700 font-medium">{status}</p>
      </div>
    </div>

  );
};


export default AddEmployee;
