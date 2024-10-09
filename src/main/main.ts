/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Octokit } from 'octokit';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// Supabase 클라이언트 생성
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const getAllRows = async (table: string) => {
  const { data, error } = await supabase.from(table).select('*'); // 모든 칼럼을 가져오도록 '*' 사용
  if (error) throw new Error(error.message);
  return data;
};


const insertRow = async (table: string, rowData: object) => {
  const { data, error } = await supabase.from(table).insert([rowData]).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateRow = async (table: string, id: number, rowData: object) => {
  const { data, error } = await supabase.from(table).update(rowData).eq('id', id);
  if (error) throw new Error(error.message);
  return data;
};

const deleteRow = async (table: string, id: number) => {
  const { data, error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
  return data;
};

ipcMain.handle('get-all-rows', async (_event, table: string, column: string) => {
  try {
    const data = await getAllRows(table, column);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('insert-row', async (_event, table: string, rowData: object) => {
  try {
    const data = await insertRow(table, rowData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-row', async (_event, table: string, id: number, rowData: object) => {
  try {
    const data = await updateRow(table, id, rowData);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-row', async (_event, table: string, id: number) => {
  try {
    const data = await deleteRow(table, id);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  console.log(resolveHtmlPath('index.html'));
  

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  const octokit = new Octokit({
    auth: process.env.REACT_APP_GITHUB_TOKEN, // .env 파일에서 GitHub 토큰을 가져옵니다.
  });

  ipcMain.handle('fetch-github-commit', async (event, owner: string, repo: string) => {
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
      });
      const lastCommit = response.data[0];
  
      return {
        avatar: lastCommit.author.avatar_url,
        commitMessage: lastCommit.commit.message,
        commitDate: lastCommit.commit.committer.date,
      };
    } catch (error) {
      console.error('Error fetching last commit:', error);
      return null;
    }
  });

  ipcMain.handle('fetch-github-languages', async (event, owner: string, repo: string) => {
    try {
      // GitHub API에서 언어 비율 정보 요청
      const response = await octokit.request('GET /repos/{owner}/{repo}/languages', {
        owner,
        repo,
      });
  
      const languages = response.data; // 언어 비율 데이터
  
      return languages; // 언어 비율 정보를 반환
    } catch (error) {
      console.error('Error fetching repository languages:', error);
      return null;
    }
  });
  

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
