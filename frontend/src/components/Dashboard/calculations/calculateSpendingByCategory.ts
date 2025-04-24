export const calculateSpendingByCategory = (
    data: string[][],
    categories: string[],
    setSpendingByCategory: (value: Record<string, number>) => void
  ) => {
    const spending: Record<string, number> = {};
  
    // Initialize spending object with all categories
    categories.forEach((category) => {
      spending[category] = 0;
    });
  
    // Iterate through the data and sum up spending by category
    data.slice(1).forEach((row) => {
      const category = row[5]; // Assuming category is in column index 5
      const price = parseFloat(row[4]?.replace(",", ".").trim()); // Assuming price is in column index 4
  
      if (!isNaN(price) && spending.hasOwnProperty(category)) {
        spending[category] += price;
      }
    });
  
    // Round each category's spending to two decimal places
    Object.keys(spending).forEach((category) => {
      spending[category] = parseFloat(spending[category].toFixed(2));
    });
  
    setSpendingByCategory(spending);
  };

  export const calculateSpendingByCategoryIT = (
    data: string[][],
    categories: string[],
    setSpendingByCategoryIT: (value: Record<string, number>) => void
  ) => {
    const spending: Record<string, number> = {};
  
    // Initialize spending object with all categories
    categories.forEach((category) => {
      spending[category] = 0;
    });
  
    // Iterate through the data and sum up spending by category
    data.slice(1).forEach((row) => {
      const category = row[4]; // Assuming category is in column index 5
      const price = parseFloat(row[3]?.replace(",", ".").trim()); // Assuming price is in column index 4
  
      if (!isNaN(price) && spending.hasOwnProperty(category)) {
        spending[category] += price;
      }
    });
  
    // Round each category's spending to two decimal places
    Object.keys(spending).forEach((category) => {
      spending[category] = parseFloat(spending[category].toFixed(2));
    });
  
    setSpendingByCategoryIT(spending);
  };