/*
----------------------------------------------------------------------
------------------------------------------------------------
Project: Intelligent Climate Control Using Pattern Recognition (ICCPR)
Created on: Jan 22th, 2017
Author: Vinod Ranganath
------------------------------------------------------------
----------------------------------------------------------------------
*/

angular.module('starter', ['ionic','firebase'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
      controller: 'HomeController'
    });
  $urlRouterProvider.otherwise('/home');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.views.transition('ionic');
  $ionicConfigProvider.form.checkbox('circle');
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.views.maxCache(0);
  $ionicConfigProvider.platform.android.scrolling.jsScrolling(false);
  var config = {
    apiKey: "AIzaSyDdg9s3Nupy3UjBTJXm-RJMWQJ6ADbabZg",               // Your Firebase API key
    // authDomain: "<AUTH_DOMAIN>",       // Your Firebase Auth domain ("*.firebaseapp.com")
    databaseURL: "https://climatecontrolprjct.firebaseio.com/"     // Your Firebase Database URL ("https://*.firebaseio.com")
    // storageBucket: "<STORAGE_BUCKET>"  // Your Firebase Storage bucket ("*.appspot.com")
  };
  firebase.initializeApp(config);
})

.directive("countTo",["$timeout",function(a){
  return {
    replace:!1,
    scope:!0,
    link:function(b,c,d){
      var e,f,g,h,i,j,k,l=c[0],
      m=function(){
        f=30,
        i=0,
        b.timoutId=null,
        j=parseInt(d.countTo)||0,
        b.value=parseInt(d.value,10)||0,
        g=1e3*parseFloat(d.duration)||0,
        h=Math.ceil(g/f),k=(j-b.value)/h,e=b.value
      },
      n=function(){
        b.timoutId=a(function(){
          e+=k,
          i++,
          i>=h?(a.cancel(b.timoutId),e=j,l.innerText=j):(l.innerText=Math.round(e),n())},f)
        },
      o=function(){
        b.timoutId&&a.cancel(b.timoutId),
        m(),
        n()
      };
      return d.$observe("countTo",function(a){
        a&&o()
      }),
      d.$observe("value",function(){
        o()
      }),!0
    }
  }
}])

.controller('HomeController', function($scope, $rootScope, $http, $state, $timeout, $ionicPlatform, $ionicPopup, $ionicLoading, $filter, $interval, $firebaseObject, $ionicPopover, $interval, $ionicModal){
  $scope.$on('$ionicView.beforeEnter', function(){
    // console.log('home');
    $scope.liveData = {};
    $scope.parameters = {};
    $scope.currLocation = "";
    $scope.occOld = 0;
    $scope.tempOld = 0;
    $scope.energyOld = 0;
    $scope.savingOld = 0;
    $scope.start = new Date();
    $scope.parameters.tariff = 6.4;
    // $scope.parameters.ton = [1.5, 2];
    // $scope.parameters.status = [1, 1];
    // $scope.parameters.starRating = [3, 4];
    $scope.parameters.set = {};
    $scope.parameters.set = [
      {
        'id': 0,
        'name': 'A/C unit 1',
        'ton': 1.5,
        'starRating': 3,
        'status': true,
        'uid': ((Math.random() * 10) + 1).toFixed(3)
      },
      {
        'id': 1,
        'name': 'A/C unit 2',
        'ton': 2,
        'starRating': 4,
        'status': true,
        'uid': ((Math.random() * 10) + 1).toFixed(3)
      }
    ];
    $scope.enableDelete = ($scope.parameters.set).length==1?false:true;
    // $scope.parameters.eer = ($scope.parameters.starRating==1?true:false)?2.70:($scope.parameters.starRating==2?true:false)?2.90:($scope.parameters.starRating==3?true:false)?3.10:($scope.parameters.starRating==4?true:false)?3.30:3.50;
    // $scope.parameters.coolingCapacity = $scope.parameters.ton * 3.5;
    // $scope.parameters.power = $scope.parameters.coolingCapacity / $scope.parameters.eer;
  });

  $ionicPopover.fromTemplateUrl('popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $ionicModal.fromTemplateUrl('configModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.configModal = modal;
  });
  $scope.openModal = function() {
    $scope.configModal.show();
  };
  $scope.closeModal = function() {
    $scope.configModal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.configModal.remove();
  });
  // Execute action on hide modal
  $scope.$on('configModal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('configModal.removed', function() {
    // Execute action
  });

  $scope.clock = function(){
    $interval(
      function(){
        $scope.currTime = $filter('date')(new Date(), 'HH:mm', '+0530');
        $scope.currTimeSec = $filter('date')(new Date(), 'ss', '+0530');
        $scope.currTimeUnit = $filter('date')(new Date(), 'a', '+0530');
        // $scope.seconds = $scope.currTimeSec - $scope.start;
        var endTime = new Date();
        var timeDiff = endTime - $scope.start;
        timeDiff /= 1000;
        // timeDiff = Math.floor(timeDiff / 60);
        // var minutes = Math.round(timeDiff % 60);
        // timeDiff = Math.floor(timeDiff / 60);
        // var hours = Math.round(timeDiff % 24);
        // timeDiff = Math.floor(timeDiff / 24);
        // var days = timeDiff;
        $scope.seconds = timeDiff;

        if($scope.liveData.energy){
          $scope.energyOld = $scope.liveData['energy']['value'];
          $scope.costOld = $scope.liveData['cost']['value'];
          var effDropCurr = Math.abs(27 - $scope.liveData['curr_temp']['value']) * 5;
          var effDropSugg = Math.abs(27 - $scope.liveData['sugg_temp']['value']) * 5;

          $scope.parameters.power = 0;
          for(i=0;i<($scope.parameters.set).length;i++){
            if($scope.parameters.set[i].status==true){
              $scope.parameters.set[i].starRating = parseInt($scope.parameters.set[i].starRating);
              $scope.parameters.eer = ($scope.parameters.set[i].starRating==1?true:false)?2.70:($scope.parameters.set[i].starRating==2?true:false)?2.90:($scope.parameters.set[i].starRating==3?true:false)?3.10:($scope.parameters.set[i].starRating==4?true:false)?3.30:3.50;
              $scope.parameters.coolingCapacity = $scope.parameters.set[i].ton * 3.5;
              $scope.parameters.power += $scope.parameters.coolingCapacity / $scope.parameters.eer;
            } else{
              $scope.parameters.power += 0;
            }
          }
          var power = $scope.parameters.power;

          power1 = Math.abs(power + ((power * effDropCurr)/100));
          $scope.liveData['energy']['value'] = Math.abs(power1 * ($scope.seconds/3600));
          $scope.liveData['cost']['value'] = Math.abs($scope.liveData['energy']['value'] * $scope.parameters.tariff);

          power2 = Math.abs(power + ((power * effDropSugg)/100));
          var energy = Math.abs(power2 * ($scope.seconds/3600));
          var cost = Math.abs(energy * $scope.parameters.tariff);

          $scope.saved = $scope.liveData['cost']['value'] - cost;
          $scope.liveData['saved']['value'] = parseInt($scope.saved);
          // console.log($scope.liveData['cost']['value']+' '+cost);
        }
      }, 100);
  }
  $scope.clock();

  var ref = firebase.database().ref();
  var obj = $firebaseObject(ref);
  $ionicLoading.show({
    template: '<div class="spinner">'+
                  '<div class="ball"></div>'+
                  '<p class="newLoadingText">Loading</p>'+
                '</div>',
    animation: 'fade-in',
    maxWidth: 200,
    showDelay: 0
  });
  obj.$loaded().then(function() {
    $scope.liveData = obj.data1;
    if($scope.liveData['location']){
      for(i=0;i<($scope.liveData['location']).length;i++){
        if($scope.liveData['location'][i]['status'] == 1){
          $scope.currLocation = $scope.liveData['location'][i]['name'];
          break;
        } else{
          continue;
        }
      }
      $scope.visibility = true;
    } else{
      $scope.visibility = false;
    }
    $scope.temperature();
    var currTime = new Date().getHours();
    (currTime>'06' && currTime<'12'?true:false)?$scope.liveData['std_temp']['value']=27:((currTime>='12' && currTime<'14'?true:false)?$scope.liveData['std_temp']['value']=25:((currTime>='14' && currTime<'16'?true:false)?$scope.liveData['std_temp']['value']=24:((currTime>='16' && currTime<'18'?true:false)?$scope.liveData['std_temp']['value']=25:$scope.liveData['std_temp']['value']=27)));

    (currTime>'06' && currTime<'09'?true:false)?$scope.liveData['curr_temp']['value']=27:((currTime>='09' && currTime<'12'?true:false)?$scope.liveData['curr_temp']['value']=23:((currTime>='12' && currTime<'14'?true:false)?$scope.liveData['curr_temp']['value']=21:((currTime>='14' && currTime<'16'?true:false)?$scope.liveData['curr_temp']['value']=21:((currTime>='16' && currTime<'18'?true:false)?$scope.liveData['curr_temp']['value']=23:$scope.liveData['curr_temp']['value']=21))));

    // (currTime>'06' && currTime<'09'?true:false)?$scope.liveData['sugg_temp']['value']=27:((currTime>='09' && currTime<'12'?true:false)?$scope.liveData['sugg_temp']['value']=26:((currTime>='12' && currTime<'14'?true:false)?$scope.liveData['sugg_temp']['value']=25:((currTime>='14' && currTime<'16'?true:false)?$scope.liveData['sugg_temp']['value']=23:((currTime>='16' && currTime<'18'?true:false)?$scope.liveData['sugg_temp']['value']=25:$scope.liveData['sugg_temp']['value']=27))));

    $scope.liveData['sugg_temp']['value'] = $scope.liveData['std_temp']['value']-(parseInt($scope.liveData['occupants']['value']/5))

    $scope.occOld = $scope.liveData.occupants.value;
    $scope.tempOld = $scope.liveData.curr_temp.value;
    $scope.ambTempOld = $scope.liveData.ambient_temp.value;
    $scope.energyOld = $scope.liveData.energy.value;
    $scope.costOld = $scope.liveData.cost.value;
    $scope.savingOld = $scope.liveData.saved.value;
    $scope.stdTempOld = $scope.liveData.std_temp.value;
    // $scope.costCalc();
    $ionicLoading.hide();
  });

  // obj.$bindTo($scope, "data").then(function() {
  //   $scope.liveData = $scope.data.data1;
  //   console.log($scope.liveData);
  // });

  obj.$watch(function() {
    $scope.liveData = obj.data1;
    if($scope.liveData['location']){
      for(i=0;i<($scope.liveData['location']).length;i++){
        if($scope.liveData['location'][i]['status'] == 1){
          $scope.currLocation = $scope.liveData['location'][i]['name'];
          break;
        } else{
          continue;
        }
      }
      $scope.visibility = true;
    } else{
      $scope.visibility = false;
    }
    $scope.temperature();
    var currTime = new Date().getHours();
    (currTime>'06' && currTime<'12'?true:false)?$scope.liveData['std_temp']['value']=27:((currTime>='12' && currTime<'14'?true:false)?$scope.liveData['std_temp']['value']=25:((currTime>='14' && currTime<'16'?true:false)?$scope.liveData['std_temp']['value']=24:((currTime>='16' && currTime<'22'?true:false)?$scope.liveData['std_temp']['value']=25:$scope.liveData['std_temp']['value']=27)));

    (currTime>'06' && currTime<'09'?true:false)?$scope.liveData['curr_temp']['value']=27:((currTime>='09' && currTime<'12'?true:false)?$scope.liveData['curr_temp']['value']=23:((currTime>='12' && currTime<'14'?true:false)?$scope.liveData['curr_temp']['value']=21:((currTime>='14' && currTime<'16'?true:false)?$scope.liveData['curr_temp']['value']=21:((currTime>='16' && currTime<'18'?true:false)?$scope.liveData['curr_temp']['value']=23:$scope.liveData['curr_temp']['value']=21))));

    // (currTime>'06' && currTime<'09'?true:false)?$scope.liveData['sugg_temp']['value']=27:((currTime>='09' && currTime<'12'?true:false)?$scope.liveData['sugg_temp']['value']=26:((currTime>='12' && currTime<'14'?true:false)?$scope.liveData['sugg_temp']['value']=25:((currTime>='14' && currTime<'16'?true:false)?$scope.liveData['sugg_temp']['value']=23:((currTime>='16' && currTime<'18'?true:false)?$scope.liveData['sugg_temp']['value']=25:$scope.liveData['sugg_temp']['value']=27))));

    $scope.liveData['sugg_temp']['value'] = $scope.liveData['std_temp']['value']-(parseInt($scope.liveData['occupants']['value']/5))

    $timeout(function(){
      $scope.occOld = $scope.liveData.occupants.value;
      $scope.tempOld = $scope.liveData.curr_temp.value;
      $scope.ambTempOld = $scope.liveData.ambient_temp.value;
      $scope.energyOld = $scope.liveData.energy.value;
      $scope.costOld = $scope.liveData.cost.value;
      $scope.savingOld = $scope.liveData.saved.value;
      $scope.stdTempOld = $scope.liveData.std_temp.value;
    }, (2*1000));
  });

  // $scope.simulateUpdate = function(){
  //   for(i=0;i<($scope.liveData).length;i++){
  //     if($scope.liveData[i]['tag']=='occ'){
  //       $scope.occOld = $scope.liveData[i]['tag'];
  //       $scope.liveData[i]['value'] = Math.floor(Math.random() * ((20+1) - 5) + 5);
  //     } else if($scope.liveData[i]['tag']=='temp'){
  //       $scope.tempOld = $scope.liveData[i]['tag'];
  //       $scope.liveData[i]['value'] = Math.floor(Math.random() * ((27+1) - 18) + 18);
  //     } else if($scope.liveData[i]['tag']=='energy'){
  //       $scope.energyOld = $scope.liveData[i]['tag'];
  //       $scope.liveData[i]['value'] = Math.floor(Math.random() * ((10+1) - 1) + 1);
  //     } else if($scope.liveData[i]['tag']=='saving'){
  //       $scope.savingOld = $scope.liveData[i]['tag'];
  //       $scope.liveData[i]['value'] = Math.floor(Math.random() * ((100+1) - 10) + 10);
  //     }
  //   }
  // }
  // $interval($scope.simulateUpdate, (5*1000));

  $scope.temperature = function(){
    $http({
      url: "http://api.openweathermap.org/data/2.5/weather?id=1264527&APPID=ae0f0f4dfff322fbc91ffd6d4565a2d8",
      method: "GET",
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    }).success(function(data){
      $scope.weatherData = data;
      // var now = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss', '+0530');
      // console.log($scope.weatherData);
      $scope.liveData['ambient_temp']['value'] = ($scope.weatherData['main']['temp']-273);
      // for(i=0;i<($scope.weatherData['list']).length;i++){
      //   if($scope.weatherData['list'][i]['dt_text'] == now){
      //     $scope.liveData['curr_temp']['value'] = $scope.weatherData['list'][i]['main']['temp'];
      //     break;
      //   } else{
      //     continue;
      //   }
      // }
    })
    .error(function(data){
      console.log('error');
    });
  }

  $scope.menuSelect = function(tag,data) {
    $scope.closePopover();
    if(tag=='location'){
      $ionicLoading.show({
        template: '<div class="spinner">'+
                      '<div class="ball"></div>'+
                      '<p class="newLoadingText">Changing to '+data.name+'</p>'+
                    '</div>',
        animation: 'fade-in',
        maxWidth: 200,
        showDelay: 0
      });
      for(i=0;i<($scope.liveData['location']).length;i++){
        $scope.liveData['location'][i]['status'] = $scope.liveData['location'][i]['name'] == data.name?1:0
      }
      // $scope.liveData['location']['name'] = data.name;
      obj.$save($scope.liveData['location'])
            .then(function(x) {
              for(i=0;i<($scope.liveData['location']).length;i++){
                if($scope.liveData['location'][i]['status'] == 1){
                  $scope.currLocation = $scope.liveData['location'][i]['name'];
                  break;
                } else{
                  continue;
                }
              }
              $ionicLoading.hide();
            })
            .catch(function(error) {
              $ionicLoading.hide();
              console.log("Error:", error);
            });
    } else if(tag=='add'){
      $scope.tempData = {};
      $ionicPopup.show({
        cssClass: 'settingsPopup',
        title: 'Add Location',
        template: '<ul class="list">'+
                    '<label class="item item-input" style="border: none !important;">'+
                      '<div class="input-label">Name</div>'+
                      '<input ng-model="tempData.location" type="text">'+
                    '</label>'+
                  '</ul>',
        scope: $scope,
        buttons: [
          { text: 'Cancel',
            type: 'button-dark',
            onTap: function(e) {
              // Do nothing
            }
          },
          {
            text: 'Save',
            type: 'button-calm',
            onTap: function(e) {
              if($scope.tempData.location){
                $ionicLoading.show({
                  template: '<div class="spinner">'+
                                '<div class="ball"></div>'+
                                '<p class="newLoadingText">Adding '+$scope.tempData.location+'</p>'+
                              '</div>',
                  animation: 'fade-in',
                  maxWidth: 200,
                  showDelay: 0
                });
                if($scope.liveData['location']){
                  $scope.liveData['location'].push({
                    'name': $scope.tempData.location,
                    'tag': 'location',
                    'status': 0
                  });
                } else{
                  $scope.liveData['location'] = [
                    {
                      'name': $scope.tempData.location,
                      'tag': 'location',
                      'status': 1
                    }
                  ];
                }
                obj.$save($scope.liveData['location'])
                      .then(function(x) {
                        $ionicLoading.hide();
                      })
                      .catch(function(error) {
                        $ionicLoading.hide();
                        console.log("Error:", error);
                      });
              } else{
                e.preventDefault();
              }
            }
          }
        ]
      });
    } else if(tag=='delete'){
      var alertPopup = $ionicPopup.show({
        cssClass: 'deletePopup',
        title: 'Delete',
        template: 'Do you want to delete profile <b>'+data.name+'</b>?',
        scope: $scope,
        buttons: [
          { 
            text: 'Cancel',
            type: 'button-dark',
            onTap: function(e) {
              // Do nothing
            }
          },
          {
            text: '<b>Yes</b>',
            type: 'button-assertive',
            onTap: function(e) {
              $ionicLoading.show({
                template: '<div class="spinner">'+
                              '<div class="ball"></div>'+
                              '<p class="newLoadingText">Deleting '+data.name+'</p>'+
                            '</div>',
                animation: 'fade-in',
                maxWidth: 200,
                showDelay: 0
              });
              for(i=0;i<($scope.liveData['location']).length;i++){
                if($scope.liveData['location'][i]['name'] == data.name){
                  $scope.liveData['location'].splice(i, 1);
                  (($scope.liveData['location']).length>0?true:false)?($scope.liveData['location'][0]['status'] = $scope.currLocation == data.name?1:$scope.liveData['location'][0]['status']):$scope.visibility = false;
                  break;
                } else{
                  continue;
                }
              }
              obj.$save($scope.liveData['location'])
                    .then(function(x) {
                      if($scope.liveData['location']){
                        for(i=0;i<($scope.liveData['location']).length;i++){
                          if($scope.liveData['location'][i]['status'] == 1){
                            $scope.currLocation = $scope.liveData['location'][i]['name'];
                            break;
                          } else{
                            continue;
                          }
                        }
                      } else{
                        $scope.currLocation = "";
                      }
                      $ionicLoading.hide();
                    })
                    .catch(function(error) {
                      $ionicLoading.hide();
                      console.log("Error:", error);
                    });
            }
          }
        ]
      });
    }
  }

  $scope.configEdit = function(tag,data){
    if(tag=='delete'){
      for(i=0;i<($scope.parameters.set).length;i++){
        if($scope.parameters.set[i].id==data.id){
          $scope.parameters.set.splice(i, 1);
          for(j=0;j<($scope.parameters.set).length;j++){
            $scope.parameters.set[j].id = j;
            $scope.parameters.set[j].name = 'A/C unit '+($scope.parameters.set[j].id+1)
          }
          break;
        } else{
          continue;
        }
      }
      $scope.enableDelete = ($scope.parameters.set).length==1?false:true;
    } else if(tag=='add'){
      $scope.parameters.set.push(
        {
          'id': ($scope.parameters.set).length,
          'name': 'A/C unit '+(($scope.parameters.set).length+1),
          'ton': 0,
          'starRating': 0,
          'status': false,
          'uid': ((Math.random() * 10) + 1).toFixed(3)
        }
      );
      $scope.enableDelete = ($scope.parameters.set).length==1?false:true;
    }
  }

});