export const calculateMonthlySpending = (
  data: string[][],
  setPriceLastMonth: (value: number) => void,
  setPercentageLastMonth: (value: string) => void,
  t: (key: string) => string
) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;
  const currentMonth = currentDate.getMonth(); // 0-based (January = 0)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? previousYear : currentYear;

  const monthlySpending = Array(12).fill(0);
  const previousYearMonthlySpending = Array(12).fill(0);

  // Function to safely parse a date
  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  // Function to process dataset
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

        const rentalEndDate = endDate ? endDate : currentDate; // Assume ongoing rental if no end date
        const startYear = requestDate.getFullYear();
        const startMonth = requestDate.getMonth(); // 0-based

        if (option === 2) {
          // Monthly rental cost
          for (
            let year = startYear, month = startMonth;
            year <= rentalEndDate.getFullYear() &&
            month <= rentalEndDate.getMonth();
            month++
          ) {
            if (month === 12) {
              month = 0;
              year++;
            }
            if (year === currentYear) monthlySpending[month] += price * amount;
            if (year === previousYear)
              previousYearMonthlySpending[month] += price * amount;
          }
        } else if (option === 3) {
          // Yearly rental cost
          for (
            let year = startYear;
            year <= rentalEndDate.getFullYear();
            year++
          ) {
            if (year === currentYear)
              monthlySpending[startMonth] += price * amount;
            if (year === previousYear)
              previousYearMonthlySpending[startMonth] += price * amount;
          }
        } else {
          if (startYear === currentYear)
            monthlySpending[startMonth] += price * amount;
          if (startYear === previousYear)
            previousYearMonthlySpending[startMonth] += price * amount;
        }
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 1}:`, error);
      }
    });
  };

  // Process dataset
  // - Request date is in column 8
  // - Price in column 4
  // - Amount in column 3
  // - Rental option in column 15
  // - Cancelation date in column 16)
  processData(data, 8, 4, 3, 15, 16);

  const currentMonthSpending = monthlySpending[currentMonth];
  const lastMonthSpending =
    lastMonthYear === currentYear
      ? monthlySpending[lastMonth]
      : previousYearMonthlySpending[lastMonth];

  // Calculate percentage change
  let percentageChange: number;
  if (lastMonthSpending !== 0) {
    percentageChange =
      ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100;
  } else if (currentMonthSpending > 0) {
    percentageChange = Infinity;
  } else {
    percentageChange = 0;
  }

  // Format percentage change for UI
  if (percentageChange === Infinity) {
    setPercentageLastMonth(`+∞ ${t("dashboard.comparedToLastMonth")}`);
  } else if (percentageChange < 0) {
    setPercentageLastMonth(
      `${percentageChange.toFixed(2)}% ${t("dashboard.comparedToLastMonth")}`
    );
  } else {
    setPercentageLastMonth(
      `+${percentageChange.toFixed(2)}% ${t("dashboard.comparedToLastMonth")}`
    );
  }

  // Update the spending state
  setPriceLastMonth(parseFloat(currentMonthSpending.toFixed(2)));
};
