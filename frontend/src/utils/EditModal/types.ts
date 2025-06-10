export interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: string[];
    onSave: (updatedData: string[]) => void;
    csvData: string[][];
    selctableUsernames: string[];
    selectableDevices: string[];
  }

  export interface EditModalPropsKlein {
    isOpen: boolean;
    onClose: () => void;
    data: string[];
    onSave: (updatedData: string[]) => void;
    allDevices: string[];
    forEdit: boolean;
    csvData: string[][];
  }
  
export interface EditModalPropsRequests {
    isOpen: boolean;
    onClose: () => void;
    data: string[];
    onSave: (updatedData: string[]) => void;
  }

  export interface EditModalPropsIT {
    isOpen: boolean;
    onClose: () => void;
    data: string[];
    onSave: (updatedData: string[]) => void;
    csvData: string[][];
    selectableDevices: string[];
  }