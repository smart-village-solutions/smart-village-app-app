export const verifiedBadge = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="52px" height="56px" viewBox="0 0 52 56" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <title>badge/ 48px-verifiziert</title>
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
          <g id="StyleSheet-03" transform="translate(-223.000000, -1150.000000)">
              <g id="Group" transform="translate(225.000000, 1154.000000)">
                  <g id="Oval">
                      <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                      <use fill="${color}" fill-rule="evenodd" xlink:href="#path-1"></use>
                  </g>
                  <g transform="translate(12.000000, 12.000000)" fill="#FFFFFF" id="icons/-approved">
                      <path d="M12,3.29289322 L18.036,9.329 L23.5,4.95968758 L23.5,19 C23.5,20.3807119 22.3807119,21.5 21,21.5 L21,21.5 L3,21.5 C1.61928813,21.5 0.5,20.3807119 0.5,19 L0.5,19 L0.5,4.95968758 L5.963,9.329 L12,3.29289322 Z M22.5,17.4998932 L1.5,17.4998932 L1.5,19 C1.5,19.7309651 2.02285085,20.3398119 2.71496507,20.4729528 L2.85553999,20.4931334 L3,20.5 L21,20.5 C21.8284271,20.5 22.5,19.8284271 22.5,19 L22.5,19 L22.5,17.4998932 Z M12,4.707 L6.03710798,10.6699988 L1.5,7.04 L1.5,16.4998932 L22.5,16.4998932 L22.5,7.04 L17.962892,10.6699988 L12,4.707 Z" id="Combined-Shape"></path>
                  </g>
              </g>
          </g>
      </g>
  </svg>
`;
