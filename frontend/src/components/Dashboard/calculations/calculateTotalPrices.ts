export const calculateTotalPrices = (
  data: string[][],
  setTotalHardwarePrice: (value: number) => void
) => {
  let total = 0;
  const currentDate = new Date();

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

        // Determine the end of the rental period
        const rentalEndDate = endDate ? endDate : currentDate;

        if (option === 2) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Monthly rental cost
          const monthsSinceStart =
            (rentalEndDate.getFullYear() - startDate.getFullYear()) * 12 +
            (rentalEndDate.getMonth() - startDate.getMonth());

          total += price * amount * Math.max(monthsSinceStart, 1);
        } else if (option === 3) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Yearly rental cost
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

  // Process dataset
  // - Price in column 4
  // - Amount in column 3
  // - Rental option in column 15
  // - Start date in column 8
  // - Cancelation date in column 16)
  processData(data, 4, 3, 15, 8, 16);

  // Round total to 2 decimal places before updating the state
  setTotalHardwarePrice(parseFloat(total.toFixed(2)));
};
