export const renderError = (error: any) => {
  if (error instanceof Error) {
    console.error(error.message);
    return;
  }
  console.error(error);
};
