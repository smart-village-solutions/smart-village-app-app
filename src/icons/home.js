export const home = (color, strokeColor) => `
  <?xml version="1.0" encoding="UTF-8"?>
  <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.09998 12H3.09998L12.1 3L21.1 12H19.1" fill="${color}"/>
    <path d="M5.09998 12H3.09998L12.1 3L21.1 12H19.1" stroke="${strokeColor}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5.09998 12V19C5.09998 19.5304 5.31069 20.0391 5.68576 20.4142C6.06083 20.7893 6.56954 21 7.09998 21H17.1C17.6304 21 18.1391 20.7893 18.5142 20.4142C18.8893 20.0391 19.1 19.5304 19.1 19V12" fill="${color}"  />
    <path d="M5.09998 12V19C5.09998 19.5304 5.31069 20.0391 5.68576 20.4142C6.06083 20.7893 6.56954 21 7.09998 21H17.1C17.6304 21 18.1391 20.7893 18.5142 20.4142C18.8893 20.0391 19.1 19.5304 19.1 19V12" stroke="${strokeColor}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.1 14H14.1V18H10.1V14Z" fill="white" stroke="${strokeColor}" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`;
