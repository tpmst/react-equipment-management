export const calculateCountUserDevices = (
    data: string[][],
    setCountUserDevices: (value: number) => void
  ) => {
    let userHardwareCount = 0;
  
    data.slice(1).forEach((row) => {
      if(row[5] !== "Software"){
      const amount = row[3]; // Assuming date is in column index 1

        userHardwareCount += parseFloat(amount);
      }}
    );
  
    setCountUserDevices(userHardwareCount);
  };

  export const calculateCountITDevices = (
    data: string[][],
    setCountITDevices: (value: number) => void
  ) => {
    let userHardwareCount = 0;
  
    data.slice(1).forEach((row) => {
      if(row[4] !== "Software"){
      const amount = row[2]; // Assuming date is in column index 1

        userHardwareCount += parseFloat(amount);
      }}
    );
  
    setCountITDevices(userHardwareCount);
  };
  
  export const calculateCountUserSoftware = (
    data: string[][],
    setCountUserSoftware: (value: number) => void
  ) => {
    let userHardwareCount = 0;
  
    data.slice(1).forEach((row) => {
      if(row[5] === "Software"){
      const amount = row[3]; // Assuming date is in column index 1

        userHardwareCount += parseFloat(amount);
      }}
    );
  
    setCountUserSoftware(userHardwareCount);
  };

  export const calculateCountITSoftware = (
    data: string[][],
    setCountITSoftware: (value: number) => void
  ) => {
    let userHardwareCount = 0;
  
    data.slice(1).forEach((row) => {
      if(row[4] === "Software"){
      const amount = row[2]; // Assuming date is in column index 1

        userHardwareCount += parseFloat(amount);
      }}
    );
  
    setCountITSoftware(userHardwareCount);
  };