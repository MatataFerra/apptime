import { intervalToDuration, minutesToSeconds } from "date-fns";

export function radioInputHandleValue(value: number) {
  const seconds = minutesToSeconds(value * 30);
  const result = intervalToDuration({
    start: 0,
    end: seconds * 1000,
  });

  if (!result.hours && !result.minutes) {
    return null;
  }

  if (!result.hours && result.minutes) {
    return {
      minutes: `${result.minutes} min`,
    };
  }

  if (result.hours && !result.minutes) {
    if (result.hours === 1) {
      return {
        hours: `${result.hours} hour`,
      };
    }

    return {
      hours: `${result.hours} hours`,
    };
  }

  if (result.hours && result.minutes) {
    if (result.hours === 1) {
      return {
        hours: `${result.hours} hour and`,
        minutes: `${result.minutes} min`,
      };
    }

    return {
      hours: `${result.hours} hours and`,
      minutes: `${result.minutes} min`,
    };
  }
}
