IMDb Trivia Game
==============

##What is this?
The IMDb Trivia Game is a mobile web game which allows 2 players to connect from their mobile devices and play against each other, testing their knowledge of the IMDb Top 250 list.

##How does it work?
A game consists of 8 rounds, in each round a random movie will be displayed from the IMDb Top 250 list which you will then have to guess the year in which the movie was released. Players who guess correctly will be awarded with 5 points, while players who guess incorrectly will have 3 points deducted from their score. The player with the most points at the end of the 8 rounds wins!

Making use of NodeJS, Socket.IO, Bootstrap 3 and the ExpressJS framework.

##Installation
First, you need to make sure you have node.js up and running ([nodejs.org](http://nodejs.org/))

I have set it up to listen to Socket.IO on localhost using port 3000, if you are running this on a server or another networked machine, then simply change the following line in game.js
```javascript
var socket = io.connect('http://localhost:3000');
```
to
```javascript
var socket = io.connect('http://<server_ip_or_hostname>:3000');
```

Once you have made the changes, or if you're happy with the default configuration, start up your node by entering
```
node app.js
``` 
in your command line, and then point your browser to your configured URL. That's all! :)
