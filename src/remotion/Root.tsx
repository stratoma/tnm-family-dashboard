import { Composition } from 'remotion';
import { CommunityScrollCloseUp } from './scenes/CommunityScrollCloseUp';
import { OfferScene } from './scenes/OfferScene';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="OfferScene"
        component={OfferScene}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CommunityScrollCloseUp"
        component={CommunityScrollCloseUp}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
