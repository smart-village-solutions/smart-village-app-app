export type AppIntroSlide = {
  image: string;
  title: string;
  text: string;
  onLeaveSlide?: (fromAppIntro?: boolean) => void;
};
