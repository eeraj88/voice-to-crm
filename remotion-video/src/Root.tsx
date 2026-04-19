import { Composition } from "remotion";
import { VoyCHero } from "./VoyCHero";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="VoyCHero"
        component={VoyCHero}
        durationInFrames={180} // 6 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          theme: "dark",
        }}
      />
    </>
  );
};
