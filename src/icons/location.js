export const location = (color, strokeColor, strokeWidth) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <path d="M12,2 C15.8891061,2 18.9804469,5.1 18.9804469,9 C18.9804469,14.2 12,22 12,22
        C12,22 5.01955307,14.2 5.01955307,9 C5.01955307,5.1 8.11089385,2 12,2 Z M12,11.5
        C13.3960894,11.5 14.4930168,10.4 14.4930168,9 C14.4930168,7.6 13.3960894,6.5 12,6.5
        C10.6039106,6.5 9.50698324,7.6 9.50698324,9 C9.50698324,10.4 10.6039106,11.5 12,11.5 Z"
        fill-rule="nonzero" fill="${color}" stroke="${strokeColor}" stroke-width="${strokeWidth}"></path>
    </g>
  </svg>
`;
