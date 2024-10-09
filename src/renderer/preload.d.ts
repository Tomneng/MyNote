import { ElectronHandler } from '../main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    electronAPI: {
      getAllRows: (table: string, column: string) => Promise<any>;
      insertRow: (table: string, rowData: object) => Promise<any>;
      updateRow: (table: string, id: number, rowData: object) => Promise<any>;
      deleteRow: (table: string, id: number) => Promise<any>;
    };
  }
}

export {};
