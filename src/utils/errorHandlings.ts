export const renderError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
    return;
  }
  console.error(error);
};

export const error2String = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
};
