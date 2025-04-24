export const calculateAverageSubscriptionCost = (
  data: string[][],
  setAverageSubscriptionCost: (value: number) => void
) => {
  let total = 0;
  let count = 0;

  data.slice(1).forEach((row) => {
    if(row[15] === "2" || row[15] === "3"){

        const price = parseFloat(row[4]?.replace(",", ".").trim());
        if (!isNaN(price)) {
          total += price;
          count += 1;
        }

    }
    
  });

  const average = count > 0 ? total / count : 0;
  setAverageSubscriptionCost(average);
};