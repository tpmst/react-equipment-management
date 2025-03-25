export const calculateYearlyITSpending = (
  data: string[][],
  setPriceLastYearIT: (value: number) => void,
  setPercentageLastYearIT: (value: string) => void,
  t: (key: string) => string
) => {
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  let currentYearSpending = 0;
  let lastYearSpending = 0;

  // Function to safely parse a date
  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  // Function to process each dataset row
  const processData = (
    dataset: string[][],
    dateIndex: number,
    priceIndex: number,
    amountIndex: number,
    optionIndex: number,
    cancelIndex: number
  ) => {
    dataset.slice(1).forEach((row, rowIndex) => {
      try {
        const requestDate = parseDate(row[dateIndex]);
        const price = parseFloat(row[priceIndex]?.replace(",", ".").trim());
        const amount = parseFloat(row[amountIndex]);
        const option = parseInt(row[optionIndex], 10);
        const endDate = parseDate(row[cancelIndex]) || null; // If invalid, set as null

        if (!requestDate || isNaN(price) || isNaN(amount)) {
          console.warn(
            `Skipping row ${rowIndex + 1}: Invalid date, price, or amount`
          );
          return;
        }

        // Determine the correct rental end date (or assume ongoing)
        const rentalEndDate = endDate ? endDate : new Date();

        // Check if this spending belongs to last year or current year
        const isCurrentYear = requestDate.getFullYear() === currentYear;
        const isLastYear = requestDate.getFullYear() === lastYear;

        if (option === 1) {
          // One-time cost
          if (isCurrentYear) currentYearSpending += price * amount;
          if (isLastYear) lastYearSpending += price * amount;
        } else if (option === 2) {
          // Monthly rental cost
          const monthsSinceStart =
            (rentalEndDate.getFullYear() - requestDate.getFullYear()) * 12 +
            (rentalEndDate.getMonth() - requestDate.getMonth());

          if (isCurrentYear)
            currentYearSpending +=
              price * amount * Math.max(monthsSinceStart, 1);
          if (isLastYear)
            lastYearSpending += price * amount * Math.max(monthsSinceStart, 1);
        } else if (option === 3) {
          // Yearly rental cost
          const yearsSinceStart =
            rentalEndDate.getFullYear() - requestDate.getFullYear();

          if (isCurrentYear)
            currentYearSpending +=
              price * amount * Math.max(yearsSinceStart, 1);
          if (isLastYear)
            lastYearSpending += price * amount * Math.max(yearsSinceStart, 1);
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

  // Process dataset
  // - Request date is in column 7
  // - Price in column 3
  // - Amount in column 2
  // - Rental option in column 13
  // - Cancelation date in column 14)
  processData(data, 7, 3, 2, 13, 14);

  // Calculate percentage change
  let percentageChange: number;
  if (lastYearSpending !== 0) {
    percentageChange =
      ((currentYearSpending - lastYearSpending) / lastYearSpending) * 100;
  } else {
    percentageChange = currentYearSpending > 0 ? Infinity : 0;
  }

  // Format percentage change for UI
  if (percentageChange === Infinity) {
    setPercentageLastYearIT(`+∞ ${t("dashboard.comparedToLastYear")}`);
  } else if (percentageChange < 0) {
    setPercentageLastYearIT(
      `${percentageChange.toFixed(2)}% ${t("dashboard.comparedToLastYear")}`
    );
  } else {
    setPercentageLastYearIT(
      `+${percentageChange.toFixed(2)}% ${t("dashboard.comparedToLastYear")}`
    );
  }

  // Update the spending state
  setPriceLastYearIT(parseFloat(currentYearSpending.toFixed(2)));
};
