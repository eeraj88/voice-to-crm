import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
} from "remotion";

// Dark background matching website sections
const Background = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #022c22 0%, #0f766e 40%, #0f172a 80%, #0c4a6e 100%)",
      }}
    />
  );
};

// VoyC text only
const VoyCText = ({ frame }: { frame: number }) => {
  // Smooth spring zoom
  const zoomProgress = spring({
    frame,
    fps: 30,
    config: { damping: 150, stiffness: 40, mass: 3 },
  });

  const scale = interpolate(zoomProgress, [0, 1], [6, 1]);
  const opacity = interpolate(frame, [0, 20], [0, 1]);
  const letterSpacing = interpolate(zoomProgress, [0, 1], [80, -3]);

  return (
    <h1
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: 440,
        fontWeight: 900,
        background: "linear-gradient(135deg, #ffffff 0%, #5eead4 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        margin: 0,
        letterSpacing: letterSpacing + "px",
        textAlign: "center",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
      }}
    >
      VoyC
    </h1>
  );
};

// Main component
export const VoyCHero = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Background />
      <VoyCText frame={frame} />
    </AbsoluteFill>
  );
};
