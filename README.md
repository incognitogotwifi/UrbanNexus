# BrowserQuest

BrowserQuest is a HTML5/JavaScript multiplayer game experiment.

The game features a simple, colorful 2D world where players can walk around, chat with each other, kill monsters, and collect loot. The client and server code are both written in JavaScript, with the client running in web browsers and the server running on Node.js.

## Features

* Real-time multiplayer gameplay
* Cross-platform compatibility (works on desktop and mobile browsers)
* 2D graphics using HTML5 Canvas
* WebSocket-based networking
* Chat system
* NPCs and monsters
* Loot system
* Player persistence using Redis

## Documentation

Documentation is located in client and server directories.

## Installation

Install Node.js, then run:

    $ npm install -d
    $ node server/js/main.js

The game server will start on port 8000 and the client will be accessible at:

    http://localhost:8000/

## License

Code is licensed under MPL 2.0. Content is licensed under CC-BY-SA 3.0.
See the LICENSE file for details.

## Credits

Created by [Little Workshop](http://www.littleworkshop.fr/):

* Franck Lecollinet - [@whatthefranck](http://twitter.com/whatthefranck)
* Guillaume Lecollinet - [@glecollinet](http://twitter.com/glecollinet)
