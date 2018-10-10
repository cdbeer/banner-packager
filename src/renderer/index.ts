import "./css/normalize.css";
import "./css/main.scss";
import './Application';
//-----
const {ipcRenderer} = require('electron');
//---
document.body.id = "SettingsWindow";
document.body.setAttribute("drag-n-drop", "");
//--
const errorMsg: HTMLDivElement = document.createElement('div');
errorMsg.className = 'error-msg';
document.body.appendChild(errorMsg);
//--
const cpDiv: any = document.createElement('controls-parent');
document.body.appendChild(cpDiv);
//-----
window.onload = function () {
	// console.log('############### onload')
	ipcRenderer.send('controls-created');
	ipcRenderer.on('error', function (event: any, resultError: any, msg: any) {
		//error msg from main.js
		errorMsg.innerHTML = 'Error: ' + msg + '<br><span class="details">' + JSON.stringify(resultError, null, 4) + "</span>";
	});
}
