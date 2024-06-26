import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./CameraAsciiPanel.scss";
import { VideoAscii, ArtTypeEnum } from "./VideoAscii";
import { useWindowSize } from "../hooks/useWindowSize";

const CameraAsciiPanel = () => {
  const size = useWindowSize();
  let ratio = 1;
  if (size.width && size.height) {
    ratio = size.width / size.height;
  }
  // Define the ascii art chars per line
  const charsPerLine = 100;
  const [charsPerColumn, setCharsPerColumn] = useState(0);
  const [useColor, setUseColor] = useState(false);
  const preTagRef = useRef<HTMLPreElement>(null);

  // Define the hook state for the webcam
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Define the refs
  const videoRef = useRef<Webcam>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate the chars per column according to the aspect ratio of the video
  const calculateCharsPerColumn = (video: HTMLVideoElement) =>
    Math.round(charsPerLine * (video.videoHeight / video.videoWidth));

  // Handle the webcam ready event
  const handleUserMedia = (stream: MediaStream) => {
    const video = videoRef.current!.video!;
    video.srcObject = stream;
    video.onloadedmetadata = async () => {
      // Start the video
      await video.play();

      // Calculate the chars per column according to the input video aspect ratio
      setCharsPerColumn(calculateCharsPerColumn(video));
      setIsCameraReady(true);
    };
  };

  // Handle orientation change
  const handleOrientationChange = () => {
    const video = videoRef.current!.video!;
    setCharsPerColumn(calculateCharsPerColumn(video));
  };

  // Get the orientation change event
  const mediaQuery = window.matchMedia("(orientation: landscape)");

  // Add the event listener of the orientation change
  useEffect(() => {
    // On some devices, the change from portrait to landscape need to recalculate the chars per column to fit the aspect ratio
    mediaQuery.addEventListener("change", handleOrientationChange);

    // Remove the event listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleOrientationChange);
    };
  }, []);

  // Handle the copy to clipboard button click
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Text copied to clipboard");
    } catch (err: unknown) {
      console.error("Failed to copy text: ", err);
    }
  };
  // Tags of the webcam and video ascii element
  // Show the webcam only when it is ready, otherwise show a loading message
  return (
    <div
      className={"Camera-Ascii-Panel"}
      data-testid="camera-ascii-test"
      ref={parentRef}
    >
      <>
        <button
          className={"Button-Copy-Clipboard"}
          onClick={async () => copyToClipboard(preTagRef.current!.innerText)}
        >
          Copy
        </button>
        <button
          className={"Button-Change-Color"}
          onClick={() => {
            setUseColor(!useColor);
          }}
        ></button>
      </>
      <>
        <Webcam
          ref={videoRef}
          style={{ width: 0, height: 0, position: "absolute", top: 0, left: 0 }}
          onUserMedia={handleUserMedia}
          height={size.height}
          width={size.width}
          videoConstraints={{ facingMode: "user", aspectRatio: ratio }}
        />
        {isCameraReady ? (
          <VideoAscii
            videoStreaming={videoRef.current!.video!}
            parentRef={parentRef}
            artType={
              useColor ? ArtTypeEnum.ASCII : ArtTypeEnum.ASCII_COLOR_BG_IMAGE
            }
            charsPerLine={charsPerLine}
            charsPerColumn={charsPerColumn}
            fontColor={"white"}
            backgroundColor={"black"}
            flipY={true}
            preTagRef={preTagRef}
          />
        ) : (
          <p className={"Camera-Ascii-Waiting"}>
            Camera not ready.
            <br />
            Please wait...
          </p>
        )}
      </>
    </div>
  );
};

export default CameraAsciiPanel;
