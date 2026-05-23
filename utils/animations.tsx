export const fadeIn = (
  direction = "up",
  type = "tween",
  delay = 0,
  duration = 0.5
) => {
  return {
    hidden: {
      opacity: 0,
      y: direction === "up" ? "-50vh" : "50vh",
      x: direction === "left" ? 100 : direction === "right" ? -100 : 0,
      transition: {
        type,
        delay,
        duration,
      },
    },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type,
        delay,
        duration,
      },
    },
    exit: {
      opacity: 0,
      y: direction === "up" ? "100vh" : "-100vh",
      x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
      transition: {
        type,
        delay,
        duration,
      },
    },
  };
};

export const extractErrorMessage = (error: any): string => {
  const errorJson = JSON.parse(JSON.stringify(error));
  if (
    errorJson &&
    errorJson.response &&
    errorJson.response.errors &&
    errorJson.response.errors[0].message
  ) {
    return errorJson.response.errors[0].message
      .toString()
      .replace("Error: ", "");
  } else {
    return error.toString();
  }
};
