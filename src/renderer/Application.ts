import {SettingsController} from "./controllers/Settings";
import {DropTargetFoldersController} from "./controllers/DropTargetFolders";
import path from 'path'
import * as angular from "angular";
module SettingsWindow {

	var myApp = angular.module("SettingsWindow", [])//.service('settingsStorage', SettingsStorage)
	//remove selection focus when button is clicked.
	.directive('button', function () {
		return {
			restrict: 'E',
			link: function (scope: any, element: any, attrs: any) {
				element.on('click', function () {
					element[0].blur();
				});
			}
		};
	})
	//main angular directive.
	.directive('controlsParent', function () {
		return {
			restrict: "E",
			scope: {
				name: "@"
			},
			controller: SettingsController,
			controllerAs: "vm",
			template: require("./views/settings-controls.html"),
			replace: true
		}
	})
	.directive('dropTargetFolders', function () {
		return {
			restrict: "C",
			scope: {
				name: "@"
			},
			controller: DropTargetFoldersController
		}
	})
	.directive('dragNDrop', ['$window', function ($window: any) {
		return {
			link: function (scope: any) {
				angular.element($window)
				.on('dragover', function (mouseEvent: any) {
					// Namespacing events with name of directive + event to avoid collisions
					scope.$broadcast('drag-n-drop::dragover', mouseEvent);
					mouseEvent.preventDefault();
					return false;
				});
				angular.element($window)
				.on('drop', function (mouseEvent: any) {
					// Namespacing events with name of directive + event to avoid collisions
					scope.$broadcast('drag-n-drop::drop', mouseEvent);
					mouseEvent.preventDefault();
					return false;
				});
			}
		}
	}])
	.service('BannersModel', ['$rootScope', function (this: any, $rootScope: any) {
		this.banners = [];
	}]);
	const {ipcRenderer} = require('electron');
	//--------------------------
	//-------------------------------
	ipcRenderer.on('config-ready', (event: any, message: any) => {
		var Config = message;
		//user files ready, start the app n stuff
		var fs = require('fs');
		var appSettingsFileName = Config.USER_DATA_PATH + '/config/' + Config.APP_SETTINGS_FILE;
		//
		fs.readFile(appSettingsFileName, 'utf8', function (err: any, data: any) {
			if (err) {
				const {ipcRenderer} = require('electron');
				ipcRenderer.send('error', err, 'Could not read game settings file');
			}
			Config.appSettings0 = JSON.parse(data);
			myApp.value('Config', Config);
			angular.bootstrap(document, ['SettingsWindow']);
		});
	});
}
