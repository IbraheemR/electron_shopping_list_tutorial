const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', () => {
    // Create new window
    mainWindow = new BrowserWindow({
        title: 'Shopping List',
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when main window closed
    mainWindow.on('close', () => {
        app.quit();
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert template
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
let createAddWindow = () => {
    // Create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
    });
    // Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    addWindow.on('close', () => {
        addWindow = null;
    })
}

// Catch item:add
ipcMain.on('item:add', (e, item) => {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+A': 'Ctrl+A',
                click() {
                    if (!addWindow) {
                        createAddWindow();
                    } else {
                        addWindow.focus();
                    }
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform == 'darwin' ? 'Command+X': 'Ctrl+X',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q': 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If darwin, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add dev tools if not in production
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+Option+I': 'Ctrl+Alt+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}