NodeMMO - NodeJS + Socket.IO
=======

NodeMMO is a basic game engine to create a simple MMORPG using HTML, JS and NodeJS. This is a project without HTML5. So, not use of Canvas. Why?, I do not know HTML5 yet and I like the idea of creating a GameEngine for an MMO with NodeJS. Using basic HTML and Javascript, you can acomplish a basic MMORPG. I create a base for a possible major implementation.

<h1>Always Online</h1>
There are no animations for the player movements. Why? what I try to acomplish is not to STOP the rendering when the tab is inactive. When you move it's does cirtain movement, but not an animation.

If the tab is inactive, the characters will still able to move, the game donesn't stop if you change tab or window. If you close your socket connection, the player will be exiting the appplication.

<h1>Keyboard Detection</h1>
For the moment the player user the Arrows for movement. I try to acomplish that if you change tabs, the movement stop. I try to aboid all those knowns issues with keyboard detection. I do not use KeyDown for movement. I make the movement using the FPS on the Game Loop. I do these because the different OS and Browsers have a rate between keypress. So if you hold down the button on MacOS the player is going to be moving slowly than the one from Windows. So we use the FPS to make the movement.

<h1>Maps</h1>
With this engine you will count with Maps definitions:

```
var map_1 = [
2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2,
...
2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2
]
```

The maps would be 37x37 blocks of 40px each. This will be defined by numbers and this numbers will represent and asset in the "Dictionary":

```
var mapDictionary = {
	"backgrounds" : {
		"0" : "img/backgrounds/0.png",
		"1" : "img/backgrounds/1.png",
		"2" : "img/backgrounds/2.png"
	}
}
```

The map will be render, and with the map, the grafics.

All the maps count with "limits", so you can program if a limit is reached change to the next map. So, you can have a lot of maps and make transitions to not load the hole giant map with X users online. You can control the users that you send to via broadcast to all the users on the same map.

<h1>Debug</h1>
The Application have a Debugger Mode that tells you the FPS and if a user coonnect or disconnect. You can use it log whatever you want to.

<h1>Server</h1>
This is using NodeJS with Socket.IO to send the messages trougth sockets for the different users. The server also upload a HTTP server for the sockets to run. You can run your own Apache server and only run the sockets with the nodeJS. You can upload the game into an Apache and only use the sockets. That would be a propper implementation to control the Apache a bit more.

<h1>Structure</h1>
This is the file Structure

```
- css
- img
  - backgrounds
- js
- server
```

In each folder you will find the propper files. The NodeJS server would be on the server folder, and this goes on.

The Game Engine you will find it on the folder js by the name gEngine.js

<h1>Setup</h1>
```
1.) Install nodeJS and npm.
2.) Once you got npm you need to install socket.io
3.) run the server.js -> type "node server.js" on your therminal
```

<h1>More Info</h1>
If you want more information about the gEngine, please read the hole code. It have enough comments and its well written, so, you can understand it. It would be very hard to write a hole documentation about it.

Enjoy

<h1>License</h1>

Copyright 2013 Ariel Rey. Released under the terms of the MIT license.
