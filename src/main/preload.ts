// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: string, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    invoke(channel: string, ...args: unknown[]) {
      return ipcRenderer.invoke(channel, ...args);
    },
  },
  // electronAPI를 electronHandler 안에 추가
  electronAPI: {
    getAllRows: (table: string) => ipcRenderer.invoke('get-all-rows', table),
    insertRow: (table: string, rowData: object) => ipcRenderer.invoke('insert-row', table, rowData),
    updateRow: (table: string, id: number, rowData: object) => ipcRenderer.invoke('update-row', table, id, rowData),
    deleteRow: (table: string, id: number) => ipcRenderer.invoke('delete-row', table, id),
  }
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
