export const share = (color) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <circle fill="${color}" cx="19.5" cy="4.5" r="3.5"></circle>
      <circle fill="${color}" cx="19.5" cy="19.5" r="3.5"></circle>
      <circle fill="${color}" cx="4.5" cy="11.5" r="3.5"></circle>
      <polyline stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="19 5 5 12 18.4166667 19"></polyline>
    </g>
  </svg>
`;
