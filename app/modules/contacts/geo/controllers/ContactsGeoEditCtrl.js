export default
class ContactsGeoEditCtrl {
  /*@ngInject*/
  constructor($scope, $modalInstance, item, notify, uiGmapIsReady) {

    $scope.item = item;
    $scope.control = {};
    uiGmapIsReady.promise().then(function (maps) {
      $scope.control.refresh();
    });

    $scope.$watchGroup(['item.location.lat', 'item.location.lng'], () => {
      if (!$scope.item.location.lat || !$scope.item.location.lng || !$scope.marker) {
        return;
      }
      $scope.marker.coords.latitude = $scope.item.location.lat;
      $scope.marker.coords.longitude = $scope.item.location.lng;
    });

    $scope.saveItem = () => {
      $scope.loading = true;
      let save = item._id ? item.$save : item.$create;

      save.call(item, (data) => {
        $scope.loading = false;

        notify({
          message: 'Представительство сохранено!',
          classes: 'alert-success'
        });
        $modalInstance.close(item);
      }, (res) => {
        $scope.loading = false;
        $scope.error = res.data;
      });
    };

    $scope.close = () => {
      $modalInstance.dismiss();
    };

    $scope.onKeyDown = (e) => {
      if (e.keyCode == 13 && $scope.item.body) {
        e.preventDefault()
        $scope.onAddressChange($scope.item.body);
        return false;
      }
    }

    $scope.onAddressChange = function(address) {
      $scope.loading = true;
      var geocoder = new google.maps.Geocoder();

      geocoder.geocode({
        'address': address,
        region: 'ru',
        language: 'ru'
      }, function(places, status) {
        return $scope.$apply(function() {
          $scope.loading = false;
          if (places && places.length) {
            var place = places[0];
            if (!place.geometry || !place.geometry.location) {
              return;
            }
            return $scope.setMarkerPos(place.place_id, place.geometry.location, true);
          }
        });
      });
    };

    $scope.setMarkerPos = function(id, pos, boundsSet) {
      var bounds;
      bounds = new google.maps.LatLngBounds();
      item.location.lat = pos.lat();
      item.location.lng = pos.lng();
      $scope.marker = {
        id: id,
        coords: {
          latitude: pos.lat(),
          longitude: pos.lng()
        },
        options: {
          draggable: true
        },
        events: {
          dragend: function(marker, eventName, args) {
            item.location.lat = marker.getPosition().lat();
            item.location.lng = marker.getPosition().lng();
          }
        }
      };
      bounds.extend(pos);
      if (!boundsSet) {
        return;
      }
      return $scope.map.bounds = {
        northeast: {
          latitude: bounds.getNorthEast().lat(),
          longitude: bounds.getNorthEast().lng()
        },
        southwest: {
          latitude: bounds.getSouthWest().lat(),
          longitude: bounds.getSouthWest().lng()
        }
      };
    };

    $scope.map = {
      center: {
        latitude: item.location.lat || 50.43826,
        longitude: item.location.lng || 30.52413
      },
      zoom: 8,
      events: {
        click: function(mapModel, eventName, originalEventArgs) {
          var e;
          e = originalEventArgs[0];
          $scope.setMarkerPos(Math.random(), e.latLng);
          return $scope.$apply();
        }
      }
    };

    $scope.marker = {
      id: location.id || 0,
      coords: {
        latitude: item.location.lat,
        longitude: item.location.lng
      },
      options: {
        draggable: true
      },
      events: {
        dragend: function(marker, eventName, args) {
          item.location.lat = marker.getPosition().lat();
          item.location.lng = marker.getPosition().lng();
        }
      }
    };
  }
}