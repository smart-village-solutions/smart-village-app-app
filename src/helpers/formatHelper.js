export const formatDate = (dateTime) => {
  const day = dateTime.getDate();
  const month = dateTime.getMonth() + 1;
  const year = dateTime.getFullYear();

  let dayString = day.toString();
  if (day < 10) dayString = `0${dayString}`;

  let monthString = month.toString();
  if (month < 10) monthString = `0${monthString}`;

  return `${dayString}.${monthString}.${year}`;
};

export const formatTime = (dateTime) => {
  const minutes = dateTime.getMinutes();
  const hours = dateTime.getHours();

  let minutesString = minutes.toString();
  if (minutes < 10) minutesString = `0${minutesString}`;

  return `${hours}:${minutesString}`;
};

export const formatDateTime = (dateTime) => `${formatDate(dateTime)} ${formatTime(dateTime)}`;
