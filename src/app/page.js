"use client";
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);

  // Variables para el modelo de mediapipe con el canvas
  let lastVideoTime = -1;

  useEffect(() => {
    async function loadAndUseMediapipe() {
      const { GestureRecognizer, FilesetResolver} = await import('@mediapipe/tasks-vision');
    }
    loadAndUseMediapipe();
    const video = videoRef.current;
    const enableWebcamButton = enableWebcamButtonRef.current;

    // Verifica si el acceso a la webcam es compatible
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    // Si la webcam es compatible, agrega un event listener al botón
    if (hasGetUserMedia()) {
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() no es compatible con tu navegador");
    }

    // Activa la vista de la webcam en vivo
    function enableCam() {
      const constraints = { video: true };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
      });
    }

    // Mediapipe result
    // Create task for image file processing:
    async function mediapipeResults() {
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm "
      );
      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
        },
        numHands: 2
      });

      await gestureRecognizer.setOptions({ runningMode: "video" });

      function renderLoop() {
        const video = video.current;

        if (video.currentTime !== lastVideoTime) {
          const gestureRecognitionResult = gestureRecognizer.recognizeForVideo(video);
          processResult(gestureRecognitionResult);
          console.log(gestureRecognitionResult);
          lastVideoTime = video.currentTime;
        }

        requestAnimationFrame(() => {
          renderLoop();
        });
      }
    }

  }, []);

  return (
    <>
      <h1 className="m-10 text-center bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
        Demo interprete de seña (MEDIAPIPE)
      </h1>

      <div className="m-4 flex justify-center items-center">
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '70vh' }}></video>
        <canvas ref={canvasRef} style={{ width: '100%', maxHeight: '70vh' }}></canvas>
      </div>

      <div className="m-4 flex justify-center items-center">
        <button
          className="group relative inline-block overflow-hidden border border-indigo-600 px-8 py-3 focus:outline-none focus:ring"
          ref={enableWebcamButtonRef}
        >
          <span
            className="absolute inset-x-0 bottom-0 h-[2px] bg-indigo-600 transition-all group-hover:h-full group-active:bg-indigo-500"
          ></span>
          <span
            className="relative text-sm font-medium text-indigo-600 transition-colors group-hover:text-white"
          >
            Habilitar cámara web
          </span>
        </button>
      </div>

      <h2 className="text-center"> Output: </h2>
      {/* <div>{output ? JSON.stringify(output) : 'No hay output'}</div> Muestra el output aquí */}
    </>
  )
}
