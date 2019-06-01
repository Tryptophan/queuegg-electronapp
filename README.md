# Queue.gg Screen Sharing

## Running the electron app in developer mode
* Change directories into ```/electron_app/```
* Run ```npm install``` to install dependencies
* Run ```npm start``` to start the electron runtime

## Building the electron app
* TODO

## Running the signalling server in debug mode
* Change directories into ```/signal_server/```
* Run ```npm install``` to install all dependencies
* Run ```npm start``` to start the socket.io server

NOTE: The signalling server by default runs on port 3000, when hosting this in production it's a good idea to keep this port for the signalling server and proxy port 80/443 connections with something like NGINX

## Running the web client (only exists for debug purposes)
* Change directories into ```/client_room/```
* Run ```npm install``` to install all dependencies
* Run ```npm start``` to start the express server that hosts the static page with a socket.io and simple-peer client