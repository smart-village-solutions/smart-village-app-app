export const lupe = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_2295_2619)">
      <path d="M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M15 15L11.5 11.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_2295_2619">
      <rect width="16" height="16" fill="${color}" transform="matrix(-1 0 0 1 16 0)"/>
      </clipPath>
    </defs>
  </svg>
`;
