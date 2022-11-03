export const pen = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="16px" height="16px" viewBox="0 0 16 16" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <path d="M10 3L13 6" stroke="${color}" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 1L15 4L5 14L1 15L2 11L12 1Z" stroke="${color}" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
