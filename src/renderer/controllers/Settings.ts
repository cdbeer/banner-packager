import * as angular from "angular";
export class SettingsController {
	static $inject = ["$scope", '$rootScope', 'Config', 'BannersModel'];
	constructor($scope: any, $rootScope: any, Config: any, BannersModel: any) {
		console.log('yup', Config)
		var lastAppSettingsJSON: string;
		var appSettingsFileName = Config.USER_DATA_PATH + '/config/' + Config.APP_SETTINGS_FILE;
		var bannersIndex: any;
		var validExtensions: any;
		var validRootExtensions: any;
		var validFolders: any;
		$scope.appSettings = Config.appSettings0;
		console.log('da game settings', Config.appSettings0)
		$scope.bannersModel = BannersModel;
		$scope.packaging = false;
		//watchcollection
		$scope.$watch('appSettings', function () {
			$scope.saveSettings();
		}, true);
		function packageNextBanner(destPath: any) {
			console.log('------------packagenextbanner!', destPath);
			//--
			const fs = require('fs');
			const archiver = require('archiver');
			//---
			//---
			var banner = BannersModel.banners[bannersIndex];
			//alright, get a filelist of the banner folder.
			var rootDir = banner.file.path;
			banner.files = (walkFilterSync(banner.file.path, []));
			//------
			var files = fs.readdirSync(destPath[0]);
			var filename = banner.name + '.zip';
			//find same file name
			//if exists, increment num to filename until unique
			var num = 2;
			while (files.indexOf(filename) > -1) {
				filename = banner.name + ' ' + num + '.zip';
				num++;
			}
			var zipPath = destPath + '/' + filename;
			var output = fs.createWriteStream(zipPath);
			var archive = archiver('zip');
			output.on('close', function () {
				var stat = fs.statSync(zipPath);
				console.log('totalSIZE', totalSize, stat.size);
				banner.filesSize = totalSize;
				banner.zipSize = stat.size;
				//all done, package next file!
				bannersIndex++;
				if (bannersIndex >= BannersModel.banners.length) {

					//all done!
					console.log('alldone');
					$scope.packaging = false;
					$scope.$apply();
					console.log('ok');
				} else {
					console.log('.....again');
					packageNextBanner(destPath);
				}
			});
			archive.on('error', function (err: any) {
				throw err;
			});
			archive.pipe(output);
			var bannerFiles = banner.files;
			var archivePath;
			var totalSize = 0;
			for (var xed = 0; xed < bannerFiles.length; xed++) {
				archivePath = (bannerFiles[xed].split(rootDir)[1].substr(1));
				console.log('da path', bannerFiles[xed], archivePath);
				var stat = fs.statSync(bannerFiles[xed]);
				totalSize += stat.size;
				archive.append(fs.createReadStream(bannerFiles[xed]), {name: archivePath});
			}
			archive.finalize();
			function walkFilterSync(dir: any, filelist: any) {
				const fs = require('fs');
				files = fs.readdirSync(dir);
				filelist = filelist || [];
				files.forEach(function (file: any) {
					if (fs.statSync(dir + '/' + file).isDirectory()) {
						if (validFolders.indexOf(file) != -1) {
							console.log('dee dir', file);
							filelist = walkFilterSync(dir + '/' + file, filelist);
						}
					}
					else {
						var ext = file.split('.').pop().toLowerCase();
						if (validExtensions.indexOf(ext) > -1) {
							var inRoot = dir == rootDir;
							//if (validRootExtensions.indexOf(ext) > -1) {
							if ((inRoot && (validRootExtensions.indexOf(ext) > -1) ) || !inRoot) {
								console.log('dee file', dir, file, dir == rootDir);
								filelist.push(dir + '/' + file);
							}
						}
					}
				});
				return filelist;
			};
		}
		$scope.selectDestinationFolder = function () {
			$scope.packaging = true;
			const {dialog} = require('electron').remote;
			dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory']}, function (path: any) {
				if (path) {
					//path was selected.
					console.log(path);
					bannersIndex = 0;
					packageNextBanner(path);
				} else {
					//not selected.
					$scope.packaging = false;
					$scope.$apply();
				}
			});
		}
		$scope.clearBanners = function () {
			BannersModel.banners = [];
		}
		$scope.packageButtonClicked = function () {
			if (!$scope.packaging) {
				validExtensions = trimSplitCSV($scope.appSettings.validExtensions);
				validFolders = trimSplitCSV($scope.appSettings.validFolders);
				//onlyHTMLInRoot=$scope.appSettings.onlyHTMLInRoot;
				validRootExtensions = trimSplitCSV($scope.appSettings.validRootExtensions);
				console.log('packagebutton clcied ', validExtensions, validFolders);
				$scope.selectDestinationFolder();
			}
		}
		function trimSplitCSV(str: string) {
			var arr: any = [];
			if (str.length > 0) {
				arr = str.split(',');
				for (var xed = 0; xed < arr.length; xed++) {
					arr[xed] = arr[xed].trim();
				}
			}
			return arr;
		}
		$scope.saveSettings = function () {
			var fs = require('fs');
			var json = angular.toJson($scope.appSettings);
			console.log('save', json)
			if (json == lastAppSettingsJSON) return;
			//---------------------------------
			lastAppSettingsJSON = json;
			fs.writeFile(appSettingsFileName, json, 'utf-8', function (err: any) {
				if (err) {
					const {ipcRenderer} = require('electron');
					ipcRenderer.send('error', err, 'Could not write game settings file (#0)');
				}
			});
		}
	}
}
// }


