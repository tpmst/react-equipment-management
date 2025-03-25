export const calculateTotalSpendings = (
  data: string[][],
  data2: string[][],
  setTotalSpending: (value: number) => void
) => {
  let total = 0;
  const currentDate = new Date(); // Get current date

  // Function to safely parse a date
  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  // Function to process each dataset
  const processData = (
    dataset: string[][],
    priceIndex: number,
    amountIndex: number,
    optionIndex: number,
    dateIndex: number,
    cancelIndex: number
  ) => {
    dataset.slice(1).forEach((row, rowIndex) => {
      try {
        const price = parseFloat(row[priceIndex]?.replace(",", ".").trim());
        const amount = parseFloat(row[amountIndex]);
        const option = parseInt(row[optionIndex], 10);
        const startDate = parseDate(row[dateIndex]);
        const endDate = parseDate(row[cancelIndex]) || null; // If invalid, set as null

        if (isNaN(price) || isNaN(amount)) {
          console.warn(`Skipping row ${rowIndex + 1}: Invalid price or amount`);
          return;
        }

        if (option === 2) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Determine the end of the rental period
          const rentalEndDate = endDate ? endDate : currentDate;

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
          const rentalEndDate = endDate ? endDate : currentDate;

          // Calculate years between start and end
          const yearsSinceStart =
            rentalEndDate.getFullYear() - startDate.getFullYear();

          total += price * amount * Math.max(yearsSinceStart, 1);
        } else {
          total += price * amount;
        }
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 1}:`, error);
      }
    });
  };

  // Process both datasets
  processData(data, 4, 3, 15, 8, 16);
  processData(data2, 3, 2, 13, 7, 14);

  // Round total to 2 decimal places before updating the state
  setTotalSpending(parseFloat(total.toFixed(2)));
};
