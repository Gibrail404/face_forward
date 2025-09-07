// "use client";
// import React, { useState, useRef, useEffect } from "react";
// import * as faceapi from "face-api.js";

// const AddEmployee = () => {
//   const [formData, setFormData] = useState({
//     emp_id: "",
//     fullName: "",
//     department: "",
//     email: "",
//   });
//   const [photo, setPhoto] = useState<string | null>(null);
//   const [showCamera, setShowCamera] = useState(false);
//   const [status, setStatus] = useState("Click Use Camera to capture photo");
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [countdown, setCountdown] = useState<number | null>(null);

//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   // Load models once
//   useEffect(() => {
//     const loadModels = async () => {
//       setStatus("Loading face recognition models...");
//       await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//       await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
//       await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
//       await faceapi.nets.faceExpressionNet.loadFromUri("/models");
//       setModelsLoaded(true);
//       setStatus("Models loaded ✅");
//     };
//     loadModels();
//   }, []);

//   // Start camera
//   const startCamera = async () => {
//     if (!modelsLoaded) {
//       alert("Models are still loading, please wait...");
//       return;
//     }
//     setShowCamera(true);
//     setStatus("Starting camera...");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       if (videoRef.current) videoRef.current.srcObject = stream;
//       streamRef.current = stream;
//       setStatus("Camera ready, detecting face...");
//     } catch (err) {
//       console.error("Camera error:", err);
//       setStatus("Error accessing webcam ❌");
//     }
//   };

//   // Detect face
//   // useEffect(() => {
//   //   if (!showCamera || !modelsLoaded) return;

//   //   const interval = setInterval(async () => {
//   //     if (videoRef.current && canvasRef.current) {
//   //       const detections = await faceapi
//   //         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//   //         .withFaceLandmarks()
//   //         .withFaceExpressions();

//   //       const displaySize = {
//   //         width: videoRef.current.width,
//   //         height: videoRef.current.height,
//   //       };

//   //       faceapi.matchDimensions(canvasRef.current, displaySize);
//   //       const resized = faceapi.resizeResults(detections, displaySize);

//   //       const ctx = canvasRef.current.getContext("2d");
//   //       ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//   //       faceapi.draw.drawDetections(canvasRef.current, resized);
//   //       faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
//   //       faceapi.draw.drawFaceExpressions(canvasRef.current, resized);

//   //       if (detections.length > 0 && countdown === null) {
//   //         setStatus("Face detected ✅ Capturing in 3s...");
//   //         setCountdown(3);
//   //       }
//   //     }
//   //   }, 500);

//   //   return () => clearInterval(interval);
//   // }, [showCamera, modelsLoaded]);

//   // Detect face
// // useEffect(() => {
// //   if (!showCamera || !modelsLoaded) return;

// //   const interval = setInterval(async () => {
// //     if (videoRef.current && canvasRef.current) {
// //       const detections = await faceapi
// //         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
// //         .withFaceLandmarks()
// //         .withFaceExpressions();

// //       const displaySize = {
// //         width: videoRef.current.width,
// //         height: videoRef.current.height,
// //       };

// //       faceapi.matchDimensions(canvasRef.current, displaySize);
// //       const resized = faceapi.resizeResults(detections, displaySize);

// //       const ctx = canvasRef.current.getContext("2d");
// //       ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

// //       // ✅ Only consider human faces with score >= 0.99
// //       const highConfidence = resized.filter((det) => det.detection.score >= 0.99);

// //       highConfidence.forEach((det) => {
// //         const { x, y, width, height } = det.detection.box;
// //         ctx!.strokeStyle = "lime"; // green for confidence >= 0.99
// //         ctx!.lineWidth = 3;
// //         ctx!.strokeRect(x, y, width, height);
// //       });

// //       if (highConfidence.length > 0 && countdown === null) {
// //         setStatus("High-confidence face detected ✅ Capturing in 3s...");
// //         setCountdown(3);
// //       } else if (detections.length === 0) {
// //         setStatus("No human face detected ❌");
// //       } else if (detections.length > 0 && highConfidence.length === 0) {
// //         setStatus("Face detected but low confidence (<0.99)");
// //       }
// //     }
// //   }, 500);

// //   return () => clearInterval(interval);
// // }, [showCamera, modelsLoaded]);

// useEffect(() => {
//   if (!showCamera || !modelsLoaded) return;

//   const interval = setInterval(async () => {
//     if (videoRef.current && canvasRef.current) {
//       const detections = await faceapi
//         .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks();

//       const displaySize = {
//         width: videoRef.current.width,
//         height: videoRef.current.height,
//       };
//       faceapi.matchDimensions(canvasRef.current, displaySize);
//       const resized = faceapi.resizeResults(detections, displaySize);

//       const ctx = canvasRef.current.getContext("2d");
//       ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

//       let highConfidenceDetected = false;

//       resized.forEach((det) => {
//         const { x, y, width, height } = det.detection.box;
//         if (det.detection.score >= 0.90) {
//           ctx!.strokeStyle = "lime"; // ✅ Green for high confidence
//           ctx!.lineWidth = 4;
//           ctx!.strokeRect(x, y, width, height);
//           highConfidenceDetected = true;
//         } else {
//           ctx!.strokeStyle = "red"; // ❌ Red for <0.99
//           ctx!.lineWidth = 2;
//           ctx!.strokeRect(x, y, width, height);
//         }
//       });

//       if (highConfidenceDetected && countdown === null) {
//         setStatus("High confidence face detected ✅ Starting countdown...");
//         setCountdown(3); // ⏳ trigger countdown
//       } else if (!highConfidenceDetected && detections.length > 0) {
//         setStatus("Face detected but confidence < 0.99");
//       } else if (detections.length === 0) {
//         setStatus("No face detected");
//       }
//     }
//   }, 500);

//   return () => clearInterval(interval);
// }, [showCamera, modelsLoaded]);



//   // Countdown + capture
//   useEffect(() => {
//     if (countdown === null) return;
//     if (countdown > 0) {
//       const timer = setTimeout(() => setCountdown((c) => (c ? c - 1 : 0)), 1000);
//       return () => clearTimeout(timer);
//     } else if (countdown === 0) {
//       capturePhoto();
//       stopCamera();
//       setCountdown(null);
//     }
//   }, [countdown]);

//   // Capture photo
//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const context = canvasRef.current.getContext("2d");
//       if (context) {
//         context.drawImage(videoRef.current, 0, 0, 400, 300);
//         const dataUrl = canvasRef.current.toDataURL("image/png");
//         setPhoto(dataUrl);
//         setStatus("Photo captured 🎉");
//       }
//     }
//   };

//   // Stop camera
//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//     }
//     setShowCamera(false);
//   };

//   // Handle input
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Submit
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.emp_id || !formData.fullName || !formData.department || !formData.email || !photo) {
//       alert("Please fill all fields and capture a photo.");
//       return;
//     }
//     console.log("✅ Employee Data:", { ...formData, photo });
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           name="emp_id"
//           placeholder="Employee ID (e.g. AGL0000)"
//           className="border p-2 w-full"
//           onChange={handleChange}
//         />
//         <input
//           name="fullName"
//           placeholder="Full Name"
//           className="border p-2 w-full"
//           onChange={handleChange}
//         />
//         <input
//           name="department"
//           placeholder="Department"
//           className="border p-2 w-full"
//           onChange={handleChange}
//         />
//         <input
//           name="email"
//           placeholder="Email"
//           type="email"
//           className="border p-2 w-full"
//           onChange={handleChange}
//         />

//         {photo ? (
//           <img src={photo} alt="Captured" className="w-40 h-40 object-cover rounded border" />
//         ) : (
//           <button
//             type="button"
//             onClick={startCamera}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             Use Camera
//           </button>
//         )}

//         <div className="flex space-x-4">
//           <button type="submit" onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 cursor-pointer rounded">
//             Submit
//           </button>
//           <button
//             type="reset"
//             className="bg-gray-400 text-white px-4 py-2 rounded"
//             onClick={() => {
//               setFormData({ emp_id: "", fullName: "", department: "", email: "" });
//               setPhoto(null);
//             }}
//           >
//             Reset
//           </button>
//         </div>
//       </form>

//       {/* Camera Popup */}
//       {showCamera && (
//         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
//           <div className="bg-white p-4 rounded-lg w-1/2 relative">
//             <h3 className="text-center text-lg font-bold">Camera</h3>
//             {countdown !== null && (
//               <div className="absolute top-1/2 left-1/2 text-6xl font-bold text-red-500">
//                 {countdown}
//               </div>
//             )}
//             <video ref={videoRef} autoPlay muted width="640" height="480" className="rounded-lg" />
//             <canvas ref={canvasRef} width="640" height="480" className="absolute top-0 left-0" />
//             <button
//               onClick={stopCamera}
//               className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Status */}
//       <div className="mt-6 px-6 py-3 bg-white shadow-md rounded-xl text-center">
//         <p className="text-gray-700 font-medium">{status}</p>
//       </div>
//     </div>
//   );
// };

// export default AddEmployee;

"use client";
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    emp_id: "",
    fullName: "",
    department: "",
    email: "",
  });
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
  // const capturePhoto = () => {
  //   if (videoRef.current && canvasRef.current) {
  //     const context = canvasRef.current.getContext("2d");
  //     if (context) {
  //       context.drawImage(videoRef.current, 0, 0, 400, 300);
  //       const dataUrl = canvasRef.current.toDataURL("image/png");

  //       // Show GIF first
  //       setShowGif(true);
  //       setTempPhoto(dataUrl);
  //       setPhoto(null);

  //       // Replace GIF with actual photo after 3s
  //       setTimeout(() => {
  //         setPhoto(dataUrl);
  //         setShowGif(false);
  //         setStatus("Photo captured 🎉");
  //       }, 3000);
  //     }
  //   }
  // };

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

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emp_id || !formData.fullName || !formData.department || !formData.email || !photo) {
      alert("Please fill all fields and capture a photo.");
      return;
    }
    console.log("✅ Employee Data:", { ...formData, photo });
  };

  return (
    <div className="p-6 rounded-xl mt-22">
      <h2 className="text-xl font-bold mb-4 text-center">Add New Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="emp_id"
          placeholder="Employee ID (e.g. AGL0000)"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
        />
        <input
          name="fullName"
          placeholder="Full Name"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
        />
        <input
          name="department"
          placeholder="Department"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onChange={handleChange}
        />

        {/* Centered capture box */}
        <div className="flex justify-center">
          {photo ? (
            <img src={photo} alt="Captured" className="w-40 h-40 object-cover rounded border" />
          ) : showGif ? (
            <img src="/static/faceScan.gif" alt="Scanning..." className="w-40 h-40 object-cover" />
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="bg-blue-950 text-white px-4 py-2 rounded-lg w-full shadow-blue-700 shadow-2xs "
            >
              Take Photo
            </button>
          )}
        </div>

        <div className="flex space-x-4 justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-green-500 text-white px-4 py-2 cursor-pointer"
          >
            Submit
          </button>
          <button
            type="reset"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-blue-400"
            onClick={() => {
              setFormData({ emp_id: "", fullName: "", department: "", email: "" });
              setStatus("Click take photo to capture photo");
              setPhoto(null);
              setTempPhoto(null);
              setShowGif(false);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Camera Popup */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-1/2 relative">
            <h3 className="text-center text-lg font-bold">Camera</h3>
            {countdown !== null && (
              <div className="absolute top-1/2 left-1/2 text-6xl font-bold text-red-500">
                {countdown}
              </div>
            )}
            <video ref={videoRef} autoPlay muted width="640" height="480" className="rounded-lg" />
            <canvas ref={canvasRef} width="640" height="480" className="absolute top-0 left-0" />
            <button
              onClick={stopCamera}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-6 px-6 py-3 bg-white shadow-md rounded-xl text-center">
        <p className="text-gray-700 font-medium">{status}</p>
      </div>
    </div>

  );
};

export default AddEmployee;
