export type AppIntroSlide = {
  image: string;
  title: string;
  text: string;
  onLeaveSlideName?: string;
  onLeaveSlide?: (fromAppIntro?: boolean) => void;
};
