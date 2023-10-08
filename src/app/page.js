'use client'
import { useEffect, useRef, useState } from 'react'
import { DrawingUtils, GestureRecognizer, FilesetResolver } from '@mediapipe/tasks-vision';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);
  const [output, setOutput] = useState(null); // Añade un estado para el output

  // Variables para el modelo de mediapipe con el canvas
  let lastVideoTime = -1;
  let results = undefined;
  let gestureRecognizer = undefined;

  useEffect(() => {
    const video = videoRef.current;
    const enableWebcamButton = enableWebcamButtonRef.current;
    const canvasElement = canvasRef.current;
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
        predictWebcam();
      });
    }

    // Función para dibujar el resultado del modelo en el canvas
    function drawResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      if (results && results.image instanceof HTMLImageElement) {
        canvasCtx.drawImage(
          results.image,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        setOutput(results); // Actualiza el estado del output con los resultados
      }
      canvasCtx.restore();
    }

    async function predictWebcam() {
      // Aquí deberías obtener los resultados del modelo
      let nowInMs = Date.now();
      if (video.currentTime !== lastVideoTime && video.readyState === 4) {
        lastVideoTime = video.currentTime;
        results = gestureRecognizer.recognizeForVideo(video, nowInMs);
      }
      if (results) {
        drawResults(results);
      }
      // Llama a esta función nuevamente para seguir prediciendo cuando el navegador esté listo.
      window.requestAnimationFrame(predictWebcam);
    }

    // Crear el gestureRecognizer
    const createGestureRecognizer = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO"
      });
    };
    createGestureRecognizer();

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
      <div>{output ? JSON.stringify(output) : 'No hay output'}</div> {/* Muestra el output aquí */}
    </>
  )
}
