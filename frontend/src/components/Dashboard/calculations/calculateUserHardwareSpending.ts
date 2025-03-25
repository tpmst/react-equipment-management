export const calculateUserHardwareSpending = (
  data: string[][],
  setKrimskramsLastYear: (value: string) => void
) => {
  let userHardwareCount = 0;
  const currentYear = new Date().getFullYear();

  data.slice(1).forEach((row) => {
    const dateString = row[1]; // Assuming date is in column index 1
    const date = new Date(dateString);

    if (date.getFullYear() === currentYear) {
      userHardwareCount += 1;
    }
  });

  setKrimskramsLastYear(`${userHardwareCount}`);
};
