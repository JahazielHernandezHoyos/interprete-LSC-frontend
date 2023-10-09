"use client";
import { useEffect, useRef, useState } from 'react';
let GestureRecognizer, FilesetResolver;
if (typeof window !== 'undefined') {
  import('@mediapipe/tasks-vision')
    .then(module => {
      GestureRecognizer = module.GestureRecognizer;
      FilesetResolver = module.FilesetResolver;
    });
}

/**
 * Componente principal de la página de inicio.
 */
export default function Home() {
  const videoRef = useRef(null);
  const enableWebcamButtonRef = useRef(null);
  const webcamRunning = useRef(false);
  const [gestureRecognitionResult, setGestureRecognitionResult] = useState(null);

  let lastVideoTime = useRef(-1);

  /**
   * Efecto para inicializar la webcam y el reconocimiento de gestos.
   */
  useEffect(() => {
    const video = videoRef.current;
    const enableWebcamButton = enableWebcamButtonRef.current;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() no es compatible con tu navegador");
    }

    function enableCam() {
      if (webcamRunning.current) {
        return;
      }
      const constraints = { video: true };
      navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        webcamRunning.current = true;
        mediapipeResults();
      });
    }

    async function mediapipeResults() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
      });
      await gestureRecognizer.setOptions({ runningMode: "VIDEO" });

      renderLoop(gestureRecognizer, video);
    }

    function renderLoop(gestureRecognizer, video) {
      if (!webcamRunning.current) {
        return;
      }
      let nowInMs = Date.now();
      if (video.currentTime !== lastVideoTime.current) {
        const gestureRecognitionResult = gestureRecognizer.recognizeForVideo(video, nowInMs);
        if (gestureRecognitionResult || gestureRecognitionResult == null) {
          setGestureRecognitionResult(gestureRecognitionResult);
        } else {
          setGestureRecognitionResult("");
        }
        lastVideoTime.current = video.currentTime;
        console.log("DETECCION?", gestureRecognitionResult)
      }
      requestAnimationFrame(() => {
        renderLoop(gestureRecognizer, video);
      });
    }
  }, []);

  return (
    <>
      <h1 className="m-10 text-center bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl">
        Demo intérprete de seña (MEDIAPIPE)
      </h1>

      <div className="m-4 flex justify-center items-center">
        <video ref={videoRef} autoPlay playsInline style={{ width: '480px', height: '360px' }}></video>
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

      <div className="m-4 flex justify-center items-center">
        {gestureRecognitionResult == null ? <p className="text-center">No se detectó ninguna seña, muéstrame tu mano 🤘, y espera un momento</p> :
          (gestureRecognitionResult.gestures && gestureRecognitionResult.gestures[0] && gestureRecognitionResult.gestures[0][0] ?
            <h2 className="text-center">Resultado de la predicción: {gestureRecognitionResult.gestures[0][0].categoryName}</h2> :
            <h2 className="text-center">No se detectó ninguna seña</h2>)}
      </div>
    </>
  )
}
