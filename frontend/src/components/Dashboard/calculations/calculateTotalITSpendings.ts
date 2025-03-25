export const calculateTotalITSpendings = (
  data: string[][],
  setTotalSpending: (value: string) => void
) => {
  let totalSpending = 0;
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
        const endDate = parseDate(row[cancelIndex]) || null;

        if (isNaN(price) || isNaN(amount)) {
          console.warn(`Skipping row ${rowIndex + 1}: Invalid price or amount`);
          return;
        }

        const rentalEndDate = endDate ? endDate : currentDate;

        if (option === 1) {
          // One-time cost
          totalSpending += price * amount;
        } else if (option === 2) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Monthly rental cost
          const monthsSinceStart =
            (rentalEndDate.getFullYear() - startDate.getFullYear()) * 12 +
            (rentalEndDate.getMonth() - startDate.getMonth());

          totalSpending += price * amount * Math.max(monthsSinceStart, 1);
        } else if (option === 3) {
          if (!startDate) {
            console.warn(`Skipping row ${rowIndex + 1}: Invalid start date`);
            return;
          }

          // Yearly rental cost
          const yearsSinceStart =
            rentalEndDate.getFullYear() - startDate.getFullYear();

          totalSpending += price * amount * Math.max(yearsSinceStart, 1);
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

  processData(data, 3, 2, 13, 7, 14);

  // Format number with two decimal places and replace "." with ","
  const formattedTotal = totalSpending.toFixed(2);

  setTotalSpending(formattedTotal);
};
