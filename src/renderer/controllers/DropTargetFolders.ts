
// module SettingsWindow.Controllers {
	export class DropTargetFoldersController {
		static $inject = ["$scope", '$element', '$rootScope', 'BannersModel'];

		constructor($scope:any, $element:any, $rootScope:any, BannersModel:any) {
			console.log('ooooooooooo    ooooooo  droptargetfolderscontrollser', arguments);
			var element = $element[0];
			$scope.$on('drag-n-drop::dragover', function (event:any, mouseEvent:any) {
				if (mouseEvent.target == element) {
					mouseEvent.dataTransfer.dropEffect = "copy";
				}
			});
			$scope.$on('drag-n-drop::drop', function (event:any, mouseEvent:any) {
				if (mouseEvent.target == element) {
					console.log('is drooped!', mouseEvent.dataTransfer.files);
					var files = mouseEvent.dataTransfer.files;
					var file;
					var fs = require('fs');
					for (var xed = 0; xed < files.length; xed++) {
						file = files[xed];
						if (fs.statSync(file.path).isDirectory()) {
							BannersModel.banners.push({name: file.name, file: file});
						}
					}
					$scope.$apply();
				}
			});
		}
	}
// }