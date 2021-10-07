export const notVerifiedBadge = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="52px" height="56px" viewBox="0 0 52 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <title>badge/ 48px-nichtverifiziert</title>
      <defs>
          <circle id="path-1" cx="24" cy="24" r="24"></circle>
          <filter x="-8.3%" y="-12.5%" width="116.7%" height="125.0%" filterUnits="objectBoundingBox" id="filter-2">
              <feOffset dx="0" dy="-2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.0529938811 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
              <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter2"></feOffset>
              <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter2" result="shadowBlurOuter2"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.0548240822 0" type="matrix" in="shadowBlurOuter2" result="shadowMatrixOuter2"></feColorMatrix>
              <feMerge>
                  <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                  <feMergeNode in="shadowMatrixOuter2"></feMergeNode>
              </feMerge>
          </filter>
      </defs>
      <g id="**StyleSheet" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="StyleSheet-03" transform="translate(-135.000000, -1150.000000)">
              <g id="Group" transform="translate(137.000000, 1154.000000)">
                  <g id="Oval">
                      <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                      <use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-1"></use>
                  </g>
                  <g transform="translate(12.000000, 12.000000)" fill="${color}" id="icons/-approved">
                      <path d="M12,1.39907479 L12.2773501,1.58397485 C15.005331,3.40262877 18.8461303,4.5 22,4.5 L22,4.5 L22.5,4.5 L22.5,5 C22.5,12.9163754 18.8828499,19.594191 12.1969596,22.4595725 L12.1969596,22.4595725 L12,22.5439838 L11.8030404,22.4595725 C5.11715013,19.594191 1.5,12.9163754 1.5,5 L1.5,5 L1.5,4.5 L2,4.5 C5.15386972,4.5 8.99466903,3.40262877 11.7226499,1.58397485 L11.7226499,1.58397485 L12,1.39907479 Z M3.78140714,12.5004804 C5.21518022,16.3472398 7.8282809,19.4291116 11.4999597,21.2212737 L11.5,12.4990748 Z M20.2185929,12.5004804 L12.5,12.4990748 L12.5010443,21.2207835 C16.1721955,19.4285497 18.7849505,16.3468891 20.2185929,12.5004804 Z M21.1846523,5.47806097 C18.314043,5.3263629 15.066968,4.39491445 12.4998835,2.90013561 L12.5,11.4990748 L20.5595733,11.5000612 C21.0742343,9.83988838 21.3812155,8.05399738 21.4717094,6.18066965 L21.4874146,5.78953576 L21.494,5.49 Z M11.5011068,2.89955889 C8.93386716,4.39467487 5.68632621,5.3263434 2.81534769,5.47806097 L2.81534769,5.47806097 L2.505,5.49 L2.51258537,5.78953576 C2.5771906,7.80560129 2.89006133,9.72471451 3.44042666,11.5000612 L11.5,11.4990748 Z" id="Combined-Shape"></path>
                  </g>
              </g>
          </g>
      </g>
  </svg>
`;
