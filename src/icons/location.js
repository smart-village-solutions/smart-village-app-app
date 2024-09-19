export const location = (color, strokeColor, strokeWidth) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="54" height="76" viewBox="0 0 54 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_742_510)">
      <path d="M50.9968 24.6113C50.8958 18.3813 48.3758 12.4349 43.9697 8.0293C39.469 3.52851 33.3646 1 26.9995 1C20.6345 1 14.5301 3.52851 10.0293 8.0293C5.52851 12.5301 3 18.6345 3 24.9995C3 31.3646 5.52851 37.469 10.0293 41.9697L21.3463 53.2841L21.7303 53.6441C23.2573 54.9812 25.2354 55.6879 27.2639 55.6211C29.2925 55.5542 31.2197 54.7188 32.6554 53.2841L43.9697 41.9724L44.5111 41.4124C48.772 36.8663 51.0979 30.8413 50.9968 24.6113Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <circle cx="27" cy="24" r="6" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </g>
    <defs>
      <filter id="filter0_d_742_510" x="0" y="0" width="54" height="76" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="2"/>
        <feGaussianBlur stdDeviation="1.5"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.32 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_742_510"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_742_510" result="shape"/>
      </filter>
    </defs>
  </svg>
`;
