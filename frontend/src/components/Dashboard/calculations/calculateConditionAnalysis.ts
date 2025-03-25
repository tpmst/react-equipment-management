export const calculateConditionAnalysis = (
    data: string[][],
    setConditionAnalysis: (value: { [key: string]: number }) => void
  ) => {
    const conditions: { [key: string]: number } = {};
  
    data.slice(1).forEach((row) => {
      const condition = row[7]?.trim(); // Condition in column 7
      if (condition) {
        conditions[condition] = (conditions[condition] || 0) + 1;
      }
    });
  
    setConditionAnalysis(conditions);
  };
  