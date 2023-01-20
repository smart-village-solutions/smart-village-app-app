export const calendarToggle = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="12px" height="12px" viewBox="0 0 12 12" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <path d="M2.5 0.5V2.5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 0.5V2.5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M0.5 5.5H11.5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.5 2.5H1.5C0.947715 2.5 0.5 2.94772 0.5 3.5V10.5C0.5 11.0523 0.947715 11.5 1.5
      11.5H10.5C11.0523 11.5 11.5 11.0523 11.5 10.5V3.5C11.5 2.94772 11.0523 2.5 10.5 2.5Z"
      stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
