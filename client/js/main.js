require.config({
    paths: {
        jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min',
        underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min'
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
