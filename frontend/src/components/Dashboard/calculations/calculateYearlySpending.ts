export const calculateYearlySpending = (
  data: string[][],
  setPriceLastYear: (value: number) => void,
  setPercentageLastYear: (value: string) => void,
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

        if (option === 2) {
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
          if (isCurrentYear) currentYearSpending += price * amount;
          if (isLastYear) lastYearSpending += price * amount;
        }
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 1}:`, error);
      }
    });
  };

  processData(data, 8, 4, 3, 15, 16);

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
    setPercentageLastYear(`+∞ ${t("dashboard.comparedToLastYear")}`);
  } else if (percentageChange < 0) {
    setPercentageLastYear(
      `${percentageChange.toFixed(2)}% ${t("dashboard.comparedToLastYear")}`
    );
  } else {
    setPercentageLastYear(
      `+${percentageChange.toFixed(2)}% ${t("dashboard.comparedToLastYear")}`
    );
  }

  // Update the spending state
  setPriceLastYear(
    parseFloat(currentYearSpending.toFixed(2).replace(".", ","))
  );
};
