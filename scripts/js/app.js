
//
var paralax_module = angular.module('paralax', []);


paralax_module.directive('paralaxTrack', ['$rootScope','$timeout',function ($rootScope, $timeout) {
    var c_names = {
        paralaxIn: 'px-in',
        paralaxTopIn: 'px-top-in',
        paralaxBottomIn: 'px-bottom-in',
    },
    events = {
        change: 'paralaxChange'
    };

    function link($scope, element, attrs) {
        element.addClass('paralaxTrack');

        var scrolled = false,
            requestAnimationFrame = window.requestAnimFrame = (function () {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (/* function */ callback, /* DOMElement */ element) {
                        window.setTimeout(callback, 1000 / 60);
                    };
            })(),
            state = {}, evt_debounce = {};


        function track() {
            var el = element[0],
                rect = el.getBoundingClientRect(),
                h = window.innerHeight,
                prev_state = angular.copy(state);

            state.top = rect.top;
            state.topPercent = rect.top / h * 100;
            state.bottom = rect.bottom;
            state.bottomPercent = rect.bottom / h * 100;
            state.isIn = (state.topPercent >= 0 && state.topPercent < 100) ||
                (state.bottomPercent >= 0 && state.bottomPercent < 100) ||
                (state.topPercent <= 0 && state.bottomPercent > 100);
            state.middle = rect.top + ((rect.bottom - rect.top) / 2 );
            state.middlePercent = state.middle / h * 100;
            state.inPercent = rect.bottom / (h + rect.height) * 100;
            state.height = el.clientHeight; 
           
            //set css;
            if (state.isIn){
               add_classes();
            }else if (element.hasClass(c_names.paralaxIn)){               
                remove_classes();
            }

            set_layers(state);

            if (!angular.equals(prev_state, state)){                
               
                $scope.$broadcast(events.change, state);
                
                $timeout(function(){               
                    angular.copy(state, $scope.paralax);
                });
            }
        }

        function add_classes(){
            remove_classes();
            if (state.isIn){
                element.addClass(c_names.paralaxIn);
                element.addClass(c_names.paralaxIn + '-' + (state.inPercent | 0));
            }
            if (state.topPercent > 0 && state.topPercent < 100){
                element.addClass(c_names.paralaxTopIn);
                element.addClass(c_names.paralaxTopIn + '-' + (state.topPercent | 0));
            }
            if (state.bottomPercent > 0 && state.bottomPercent < 100){
                element.addClass(c_names.paralaxBottomIn);
                element.addClass(c_names.paralaxBottomIn + '-' + (state.bottomPercent | 0));
            }
        }

        function remove_classes(){
            var el = element[0],
                cns, cn, i;
            cns = el.className.split(' ');
            for(i=cns.length-1;i >= 0; i--){
                cn = cns[i];
                if (cn.indexOf(c_names.paralaxIn) === 0 ||
                    cn.indexOf(c_names.paralaxTopIn) === 0 ||
                    cn.indexOf(c_names.paralaxBottomIn) === 0){
                    cns.splice(i,1);
                }
            }
            el.className = cns.join(' ');
        }

        function set_layers(state){
            // paralax-layer, paralax-offset, paralax-size
            element[0].querySelectorAll('[paralax-layer]').forEach(function(el){
                var px = parseInt(el.getAttribute('paralax-layer')) / 100,
                px_offset_percent = 0,
                px_size_attr = el.getAttribute('paralax-size'),
                px_offset_attr = el.getAttribute('paralax-offset'),
                px_offset;

                if (px_size_attr == 'window'){
                    el.style.height = window.innerHeight + 'px';                    
                }

                if(px_offset_attr){
                    if (px_offset_attr.charAt(px_offset_attr.length-1) == '%'){
                        px_offset_percent =  parseFloat(px_offset_attr) / 100;
                    }else if (px_offset_attr.charAt(px_offset_attr.length-1) == 'x'){
                        px_offset_percent = parseFloat(px_offset_attr) / window.innerHeight;
                    }
                }

                px_offset = (window.innerHeight - state.height ) * px_offset_percent;
          
                el.style.transform = 'translate3d(0px, '+ (((state.top - px_offset) * px)+ 'px')  +', 0px)';
                

            });
        }

        requestAnimationFrame(step);

        function step() {
            if (scrolled) {
                scrolled = false;
                track();
            }
            requestAnimationFrame(step);
        }

        function _handler(evt) {
            scrolled = true;
        }

        if (window.addEventListener) {
            window.addEventListener('scroll', _handler, false);
        }
        else if (el.attachEvent) {
            window.attachEvent('onscroll', _handler);
        }
    }

    return {
        restrict: 'A',
        link: link,
        scope: true,
        controller: ["$scope", function ($scope) {
            $rootScope.paralax = $rootScope.paralax || {
                move:function($event, id){
                    var el = document.getElementById(id),
                        box = el.getBoundingClientRect();
                    window.scrollTo(0, box.top);
                }
            }
        }]
    }
}]);
//x
var module = angular.module('app-module', ['paralax']);

module.controller('mainCtrl', ['$scope', '$location', '$translate', '$routeParams', function ($scope, $location, $translate, $routeParams) {
    
    $scope.model = {
        langs:[
            {
                id:'en',
                label:'EN'
            },
            {
                id:'hu',
                label:'HU'
            },
            {
                id:'ru',
                label:'RU'
            }
        ],
        lang: null
    }

    $scope.$on('$routeChangeSuccess', function(evt){
        var lang = $routeParams.lang || 'en';
        $scope.model.lang = $scope.model.langs.filter(function(el){           
            return (el.id == lang);
        })[0];
        set_lang($scope.model.lang.id);
    });

    $scope.changeLang = function (lang) {
       set_path(lang);
    };

    function set_path(lang){
        var path = [];

        if (lang) path.push(lang);
        $location.path(path.join('/'));
    }

    function get_lang(){
        return document.querySelector("html").getAttribute('lang');
    }

    function set_lang(lang){
        document.querySelector("html").setAttribute('lang', lang);
        $translate.use(lang);
    }

}]);
module.directive('app', [function(){

    function link($scope, element, attrs){
        element.addClass('app');
        
    }

    return {
        restrict: 'A',
        link: link,
        scope: false,
        controller: ["$scope", function($scope){
            
        }]
    }
}]);
module.directive('spoke', [function () {

    function link($scope, element, attrs) {
        element.addClass('spoke');

        element.css({
            width:'100%',
            height:'300px'
        });

        element.html('<canvas id="spoke-' + $scope.$id + '" ></canvas>')
        
        $scope.canvas = element.find('canvas')[0];

        $scope.$on('$destroy', function(){
            angular.element(window).off('resize', resize);
        });

        angular.element(window).on('resize', resize);

        function resize(){
            $scope.canvas.width = element[0].offsetWidth;
            $scope.canvas.height = element[0].offsetHeight;
            $scope.draw();
        }

        resize();
    }

    return {
        restrict: 'A',
        link: link,
        scope: {},
        controller: ["$scope", function ($scope) {
            $scope.spoke = {
                // NOTE everything in mm
                // NOTE 96px per inch that is 38 dpcm. so multiply with 3.8
                l1: 250, //total length 
                l2: 200, //length to the neck
                b: 50, //length of the neck
                d0: 4, //diameter
                d1: 4, //smaller diameter of the butted spoke  
                a: 75, //alpha
                t: 20, //length of the thread,
                tn: 20, //number of threads
                t0: 0.5, //depth of the thread,
                b1: 0, //butt length near the head for butted spokes
                b2: 0, //butt length near the thread for butted spokes,

            };

            $scope.draw = function(){
                draw($scope.canvas, $scope.spoke);
            }

            function draw(canvas, spoke){
                var i,x,y, dx, dy,ax, ay, radius, startAngle, endAngle, anticlockwise,m = 3.8,
                dt= (spoke.t / 2 * m / spoke.tn);

                x = 50;
                y = 150;

                var ctx = canvas.getContext('2d');

                ctx.moveTo(x, y);
                ctx.beginPath();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth =1;
                //draw thread top. 
                for(i=1;i < (spoke.tn*2+1);i++){
                    dx = dt;
                    dy = (spoke.t0*m) * (i%2) ;
                    x = x+dx;                   
                    ctx.lineTo(x,y+dy);
                }

                
                //draw b2.

                //draw body
                x = x + (spoke.l2*m) - (spoke.t*m);
                ctx.lineTo(x,y+dy);

                ctx.moveTo(x, y);
              
                //draw b2

                //draw inner arc
                radius = 10;
                ax = x;
                ay = y - radius;
                startAngle = toRad(90);
                anticlockwise = true;
                endAngle = toRad(90 - spoke.a);
                ctx.arc(ax, ay, radius, startAngle, endAngle, anticlockwise);
                //draw neck

                //draw head

                //draw bottom line.
                ctx.stroke();
                ctx.closePath();
                


            }


            function toRad(deg){
                return deg * (Math.PI / 180);
            }

            function toDeg(rad){
                return rad * (180 / Math.PI);
            }
        }]
    }
}]);
(function () {
  'use strict';

  var app = angular.module('app', ['ngRoute', 'ngSanitize','app-module', 'pascalprecht.translate']);

  app.config(["$translateProvider", "$routeProvider", "$locationProvider", function ($translateProvider, $routeProvider, $locationProvider) {

    // $locationProvider.html5Mode({
    //   enabled: true,
    //   requireBase: false
    // });

    $routeProvider
      .when('/:lang?', {
        templateUrl: 'home.html'
      })
      .otherwise({
            redirectTo: "/"
      });
//
    $translateProvider.useStaticFilesLoader({
      prefix: './data/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');
    //$translateProvider.useSanitizeValueStrategy('escape');
    //$translateProvider.useLocalStorage();
  }]);

  //NOTE not working.
  // angular.element(function() {
  //   angular.bootstrap(document, ['app']);
  // });

  angular.element(document).ready(function () {
    angular.bootstrap(document, ['app']);
  });
})();