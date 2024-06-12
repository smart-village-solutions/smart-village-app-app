export const ownLocation = (color, strokeColor, strokeWidth) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="54" height="76" viewBox="0 0 54 76" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_742_510)">
      <path d="M50.9968 24.6113C50.8958 18.3813 48.3758 12.4349 43.9697 8.0293C39.469 3.52851 33.3646 1 26.9995 1C20.6345 1 14.5301 3.52851 10.0293 8.0293C5.52851 12.5301 3 18.6345 3 24.9995C3 31.3646 5.52851 37.469 10.0293 41.9697L21.3463 53.2841L21.7303 53.6441C23.2573 54.9812 25.2354 55.6879 27.2639 55.6211C29.2925 55.5542 31.2197 54.7188 32.6554 53.2841L43.9697 41.9724L44.5111 41.4124C48.772 36.8663 51.0979 30.8413 50.9968 24.6113Z" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      <path x="15" y="12" d="M8.375 7C8.375 8.06087 8.79643 9.07828 9.54657 9.82843C10.2967 10.5786 11.3141 11 12.375 11C13.4359 11 14.4533 10.5786 15.2034 9.82843C15.9536 9.07828 16.375 8.06087 16.375 7C16.375 5.93913 15.9536 4.92172 15.2034 4.17157C14.4533 3.42143 13.4359 3 12.375 3C11.3141 3 10.2967 3.42143 9.54657 4.17157C8.79643 4.92172 8.375 5.93913 8.375 7Z" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
      <path x="15" y="12" d="M6.375 21V19C6.375 17.9391 6.79643 16.9217 7.54657 16.1716C8.29672 15.4214 9.31413 15 10.375 15H14.375C15.4359 15 16.4533 15.4214 17.2034 16.1716C17.9536 16.9217 18.375 17.9391 18.375 19V21" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
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
