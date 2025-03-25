export const parseCSV = (text: string): string[][] => {
    return text.split("\n").map((row) => row.split(";"));
  };
  