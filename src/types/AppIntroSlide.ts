export type AppIntroSlide = {
  contentName?: string;
  image?: string;
  title?: string;
  text?: string;
  onLeaveSlideName?: string;
  onLeaveSlide?: (fromAppIntro?: boolean) => void;
};
