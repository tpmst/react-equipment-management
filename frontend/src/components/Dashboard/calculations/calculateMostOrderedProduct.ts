export const calculateMostOrderedProductComparison = (
  data: string[][],
  setMostOrderedSoftware: (value: string) => void,
  setMostOrderedOther: (value: string) => void
) => {
  const productCountsSoftware: { [key: string]: number } = {};
  const productCountsOther: { [key: string]: number } = {};

  // Count occurrences of each product for Software and Other categories
  data.slice(1).forEach((row) => {
    const productCategory = row[5]?.trim(); // Category in column 5
    const productName = row[6]?.trim(); // Product name in column 6

    if (productName) {
      if (productCategory === "Software") {
        productCountsSoftware[productName] =
          (productCountsSoftware[productName] || 0) + 1;
      } else {
        productCountsOther[productName] =
          (productCountsOther[productName] || 0) + 1;
      }
    }
  });

  // Helper function to find the most ordered product
  const findMostOrdered = (productCounts: { [key: string]: number }) => {
    const mostOrdered = Object.entries(productCounts).reduce(
      (max, entry) => (entry[1] > max[1] ? entry : max),
      ["", 0]
    );
    return mostOrdered[0]; // Return the product name
  };

  // Helper function to truncate name while keeping word boundaries
  const truncateName = (name: string, maxLength: number): string => {
    if (name.length <= maxLength) return name;

    // Find the last space within the first maxLength characters
    const spaceIndex = name.lastIndexOf(" ", maxLength);
    return spaceIndex !== -1
      ? name.slice(0, spaceIndex)
      : name.slice(0, maxLength);
  };

  // Find and truncate the most ordered product for Software
  const mostOrderedSoftware = findMostOrdered(productCountsSoftware);
  const truncatedSoftware = truncateName(mostOrderedSoftware, 40);
  setMostOrderedSoftware(truncatedSoftware);

  // Find and truncate the most ordered product for Other categories
  const mostOrderedOther = findMostOrdered(productCountsOther);
  const truncatedOther = truncateName(mostOrderedOther, 40);
  setMostOrderedOther(truncatedOther);
};