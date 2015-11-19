export default
class ContactsGeoEditCtrl {
  /*@ngInject*/
  constructor($scope, $modalInstance, item, notify) {

    $scope.item = item;

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