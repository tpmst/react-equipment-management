export const calculateMostOrderedProduct = (
  data: string[][],
  category: "Hardware" | "Software",
  setMostOrderedProduct: (value: string) => void
) => {
  const productCounts: { [key: string]: number } = {};

  // Count occurrences of each product within the specified category
  data.slice(1).forEach((row) => {
    const productCategory = row[5]?.trim(); // Category in column 5
    const productName = row[6]?.trim(); // Product name in column 6

    if (productCategory === category && productName) {
      productCounts[productName] = (productCounts[productName] || 0) + 1;
    }
  });

  // Find the most ordered product
  const mostOrdered = Object.entries(productCounts).reduce(
    (max, entry) => (entry[1] > max[1] ? entry : max),
    ["", 0]
  );

  const originalName = mostOrdered[0];

  // Helper function to truncate name while keeping word boundaries
  const truncateName = (name: string, maxLength: number): string => {
    if (name.length <= maxLength) return name;

    // Find the last space within the first maxLength characters
    const spaceIndex = name.lastIndexOf(" ", maxLength);
    return spaceIndex !== -1
      ? name.slice(0, spaceIndex)
      : name.slice(0, maxLength);
  };

  const truncatedName = truncateName(originalName, 40);

  setMostOrderedProduct(truncatedName);
};

// Wrapper functions for Hardware and Software
export const calculateMostOrderedProductHardware = (
  data: string[][],
  setMostOrderedProduct: (value: string) => void
) => calculateMostOrderedProduct(data, "Hardware", setMostOrderedProduct);

export const calculateMostOrderedProductSoftware = (
  data: string[][],
  setMostOrderedProduct: (value: string) => void
) => calculateMostOrderedProduct(data, "Software", setMostOrderedProduct);
