export const calculateCountIT = (
  data: string[][],
  setCountIT: (value: number) => void
) => {
  let userHardwareCount = 0;

  data.slice(1).forEach((row) => {
    
      if(row[4] !== "Software"){
        userHardwareCount += 1;
      }
    
  });

  setCountIT(userHardwareCount);
};
