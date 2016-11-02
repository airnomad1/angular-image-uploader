'use strict';

(function (angular) {
    var app = angular.module('OutFitTrackerApp');
    app.directive('canvasCrop', ['$http', 'User', 'Partner', 'blockUI', '$compile', 'localStorageService', function ($http, User, Partner, blockUI, $compile, localStorageService) {
        return {
            restrict: 'AE',
            scope: {
                cropWidth: '@',
                cropHeight: '@',
                previewWidth: '@',
                previewHeight: '@',
                cropRatio: '=',
                store: '=',
                imageSizeError: '=',
                fileSizeError: '=',
                maxUploadCount: '=',
                maxUploadsError: '=',
                fileTypeError: '=',
                uploadMeta: '='
            },
            link: function ($scope, element, attrs) {
                // Make input value null
                element.bind('click', function () {
                    $scope.$apply(function () {
                        element.val(null);
                    });
                });

                $scope.cropCoords = [];

                var $cropit = null;

                element.bind('change', function (event) {
                    $scope.file = event.target.files[0];

                    if ($scope.file.type !== "image/jpeg" && $scope.file.type !== "image/png") {
                        $scope.$apply(function () {
                            $scope.fileTypeError = true;
                        });
                        return false;
                    }

                    $scope.maxUploadsError = false;
                    if ($scope.maxUploadCount <= 0) {
                        $scope.$apply(function () {
                            $scope.maxUploadsError = true;
                        });
                        return false;
                    }

                    $scope.file = event.target.files[0];

                    if (!checkFileSize(event.target.files[0], 2)) {
                        $scope.$apply(function () {
                            $scope.fileSizeError = true;
                        });
                        return false;
                    }

                    virtualImage($scope.file, {width: $scope.cropWidth, height: $scope.cropHeight}, function (i) {
                        $scope.$apply(function () {
                            $scope.fileSizeError = false;
                            $scope.fileTypeError = false;
                        });

                        if (!i) {
                            $scope.$apply(function () {
                                $scope.imageSizeError = true;
                            });
                            return false;
                        }

                        $scope.$apply(function () {
                            $scope.imageSizeError = false;
                        });

                        var fileReader = new FileReader();
                        fileReader.onload = (function (e) {
                            var dimensions = {};

                            dimensions.width = ($scope.cropWidth / $scope.cropRatio) + 20;
                            dimensions.height = ($scope.cropHeight / $scope.cropRatio) + 40;

                            if (dimensions.height < 302) {
                                dimensions.height = 302;
                            }

                            if (dimensions.width < 338) {
                                dimensions.width = 338;
                            }

                            dimensions.marginLeft = -(dimensions.width / 2);
                            dimensions.marginTop = -(dimensions.height / 2);

                            var cropStage = '<div id="ngCropperCanvas">';
                            cropStage += '<div id="ngCropper" style="width:' + dimensions.width + 'px;height:' + dimensions.height + 'px;margin-left: ' + dimensions.marginLeft + 'px;margin-top:' + dimensions.marginTop + 'px">';
                            cropStage += '<div class="cropImageWrapper" style="height:'+$scope.previewHeight+'px">';
                            cropStage += '<div class="cropit-preview"></div>';
                            cropStage += '</div>';
                            cropStage += '<div class="ngCropper-action">';
                            cropStage += '<div class="zoom_wrapper">';
                            cropStage += '<span class="small_image"></span>';
                            cropStage += '<input type="range" class="zoomSlider" />';
                            cropStage += '<span class="large_image"></span>';
                            cropStage += '</div>';
                            cropStage += '<div class="ngCropper-btn ngCropper-close" ng-click="ngCropper_close()">Close</div>';
                            cropStage += '<div class="ngCropper-btn ngCropper-crop" ng-click="ngCropper_crop()">Crop</div>';
                            cropStage += '</div>';
                            cropStage += '</div>';
                            cropStage += '</div>';


                            $('body').append($compile(cropStage)($scope));

                            $cropit = $('.cropImageWrapper').cropit({
                                exportZoom: $scope.cropRatio,
                                maxZoom: 1.5,
                                imageBackground: true,
                                $zoomSlider: $('input.zoomSlider')
                            });

                            $cropit.cropit('imageSrc', e.target.result);
                            $cropit.cropit('previewSize', {width: $scope.previewWidth, height: $scope.previewHeight});

                        });

                        fileReader.readAsDataURL(i.image);

                    });
                });

                $scope.ngCropper_close = function () {
                    $('#ngCropperCanvas').remove();
                }

                $scope.ngCropper_crop = function () {
                    var imageData = $cropit.cropit('export');
                    $scope.store.push(imageData);
                    $scope.maxUploadCount = $scope.maxUploadCount-1;
                    $('#ngCropperCanvas').remove();
                }

                function virtualImage(file, cropSize, callback) {
                    var url = URL.createObjectURL(file);
                    var image = new Image;
                    image.src = url;
                    return image.onload = function () {
                        var dimensions;
                        if (image.width < cropSize.width || image.height < cropSize.height) {
                            dimensions = false;
                        } else {
                            dimensions = [];
                            dimensions.width = image.width;
                            dimensions.height = image.height;
                            dimensions.image = file;
                        }
                        if (callback) {
                            callback(dimensions);
                        }
                    }
                }
            }
        };
    }]);
})(angular)

function checkFileSize(file, size) {
    var sizeInByte = size * 1000000;

    if (file.size > sizeInByte) {
        return false;
    }
    return true;
}