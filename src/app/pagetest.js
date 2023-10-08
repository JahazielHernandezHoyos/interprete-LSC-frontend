'use client'
import { useEffect, useRef } from 'react'
import { DrawingUtils, GestureRecognizer } from '@mediapipe/tasks-vision';


export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);
  const gestureOutputRef = useRef(null);

  // Variables para el modelo de mediapipe con el canvas
  let lastVideoTime = -1;
  let results = undefined;

  useEffect(() => {
    const video = videoRef.current;
    const enableWebcamButton = enableWebcamButtonRef.current;
    const canvasElement = canvasRef.current;
    const gestureOutput = gestureOutputRef.current;
    const canvasCtx = canvasElement.getContext('2d');

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
      drawResults();
    }

    // Función para dibujar el resultado del modelo en el canvas
    function drawResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );
      canvasCtx.restore();
    }


  }, []);
  return (
    <>
      <h1 className="m-10 text-center bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
        Demo interprete de seña (MEDIAPIPE)
      </h1>

      <div className="m-4 flex justify-center items-center">
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '70vh' }}></video>
        <canvas ref={canvasRef} autoPlay playsInline style={{ width: '100%', maxHeight: '70vh' }}></canvas>
      </div>

      <div className="m-4 flex justify-center items-center">
        <a
          className="group relative inline-block overflow-hidden border border-indigo-600 px-8 py-3 focus:outline-none focus:ring"
          href="#" ref={enableWebcamButtonRef}
        >
          <span
            className="absolute inset-x-0 bottom-0 h-[2px] bg-indigo-600 transition-all group-hover:h-full group-active:bg-indigo-500"
          ></span>
          <span
            className="relative text-sm font-medium text-indigo-600 transition-colors group-hover:text-white"
          >
            Habilitar cámara web
          </span>
        </a>
      </div>
      <h2 className="text-center"> Output: </h2>
    </>
  )
}

