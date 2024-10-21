export const minTemperature = (color, strokeColor, strokeWidth) => `
  <?xml version="1.0" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN"
   "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_4073_354)">
      <path d="M10 13.5C9.23743 13.9403 8.64145 14.6199 8.30448 15.4334C7.96752 16.2469 7.9084 17.1488 8.1363 17.9994C8.3642 18.8499 8.86638 19.6015 9.56496 20.1375C10.2635 20.6736 11.1195 20.9641 12 20.9641C12.8805 20.9641 13.7365 20.6736 14.435 20.1375C15.1336 19.6015 15.6358 18.8499 15.8637 17.9994C16.0916 17.1488 16.0325 16.2469 15.6955 15.4334C15.3586 14.6199 14.7626 13.9403 14 13.5V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3C11.4696 3 10.9609 3.21071 10.5858 3.58579C10.2107 3.96086 10 4.46957 10 5V13.5Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 17V20" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 17V20" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 17V20" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 16L15 16" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_4073_354">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
`;
