export const calculateAverageSubscriptionDuration = (
  data: string[][],
  setAverageSubscriptionDuration: (value: number) => void
) => {
  let totalDuration = 0; // Total duration in days
  let count = 0;

  const parseDate = (dateString: string) => {
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  data.slice(1).forEach((row) => {
    // Check if it is a subscription
    if (row[15] === "2" || row[15] === "3") {
      const startDate = parseDate(row[8]); // Start date
      const endDate = row[16] === "/r" ? new Date() : parseDate(row[16]); // End date or current date

      if (startDate && endDate) {
        const durationInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24); // Convert milliseconds to days
        totalDuration += durationInDays;
        count += 1;
      }
    }
  });

  const averageDuration = count > 0 ? totalDuration / count : 0; // Calculate average duration
  setAverageSubscriptionDuration(averageDuration);
};