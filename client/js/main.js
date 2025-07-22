require.config({
    paths: {
        jquery: 'lib/jquery.min',
        underscore: 'lib/underscore.min'
    },
    shim: {
        underscore: {
            exports: '_'
        }
    }
});

require(['jquery', 'app'], function($, App) {
    'use strict';
    
    $(document).ready(function() {
        var app = new App();
        app.run();
    });
});