export const calculateMonthlySubscriptionsUsers = (
  data: string[][],
  setTotalSubscriptionPrice: (value: number) => void
) => {
  let total = 0;

  // Function to safely parse a date
  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  data.slice(1).forEach((row, rowIndex) => {
    try {
      const price = parseFloat(row[4]?.replace(",", ".").trim()); // "Preis" in column 4
      const amount = parseFloat(row[3]); // "Anzahl" in column 3
      const option = parseInt(row[15], 10); // Subscription option in column 15
      const endDate = parseDate(row[16]); // "Enddatum" in column 8

      if (isNaN(price) || isNaN(amount)) {
        console.warn(`Skipping row ${rowIndex + 1}: Invalid price or amount`);
        return;
      }

      if (endDate) {
        return;
      }

      if (option === 2) {
        // Monthly Subscription Cost
        total += price * amount;
      } else if (option === 3) {
        // Convert yearly cost to monthly (spread across 12 months)
        total += (price * amount) / 12;
      }
    } catch (error) {
      console.error(`Error processing row ${rowIndex + 1}:`, error);
    }
  });

  // Round total to 2 decimal places before updating the state
  setTotalSubscriptionPrice(parseFloat(total.toFixed(2)));
};
