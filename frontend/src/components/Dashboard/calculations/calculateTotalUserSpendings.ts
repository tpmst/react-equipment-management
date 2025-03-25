export const calculateTotalUserSpendings = (
  data: string[][],
  setTotalHardwarePrice: (value: number) => void
) => {
  let total = 0;
  const currentDate = new Date(); // Get current date

  // Function to safely parse a date
  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  // Function to process dataset
  const processData = (
    dataset: string[][],
    priceIndex: number,
    amountIndex: number,
    optionIndex?: number,
    dateIndex?: number,
    cancelIndex?: number
  ) => {
    dataset.slice(1).forEach((row, rowIndex) => {
      try {
        const price = parseFloat(row[priceIndex]?.replace(",", ".").trim());
        const amount = parseFloat(row[amountIndex]);
        const option =
          optionIndex !== undefined ? parseInt(row[optionIndex], 10) : null;
        const startDate =
          dateIndex !== undefined ? parseDate(row[dateIndex]) : null;
        const endDate =
          cancelIndex !== undefined ? parseDate(row[cancelIndex]) : null;

        if (isNaN(price) || isNaN(amount)) {
          console.warn(`Skipping row ${rowIndex + 1}: Invalid price or amount`);
          return;
        }

        if (!option || option === 1) {
          // One-time cost
          total += price * amount;
        } else if (option === 2) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Determine the end of the rental period
          const rentalEndDate = endDate || currentDate;

          // Calculate months between start and end
          const monthsSinceStart =
            (rentalEndDate.getFullYear() - startDate.getFullYear()) * 12 +
            (rentalEndDate.getMonth() - startDate.getMonth());

          total += price * amount * Math.max(monthsSinceStart, 1);
        } else if (option === 3) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Determine the end of the rental period
          const rentalEndDate = endDate || currentDate;

          // Calculate years between start and end
          const yearsSinceStart =
            rentalEndDate.getFullYear() - startDate.getFullYear();

          total += price * amount * Math.max(yearsSinceStart, 1);
        } else {
          console.warn(
            `Skipping row ${rowIndex + 1}: Unknown option (${option})`
          );
        }
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 1}:`, error);
      }
    });
  };

  // Process dataset (assuming no rental info in `calculateTotalUserSpendings`)
  processData(data, 4, 3, 15, 8, 16);

  // Round total to 2 decimal places before updating the state
  setTotalHardwarePrice(parseFloat(total.toFixed(2)));
};
