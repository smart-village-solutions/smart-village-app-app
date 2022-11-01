export const list = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="12px" height="12px" viewBox="0 0 12 12" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <path d="M0.5 10.5H11.5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M0.5 1.5H11.5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M0.5 6H5.5" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
