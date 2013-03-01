# shrink wrap

tiny little web tool that helps you with task t-shirt sizing (aka effort estimation, aka assigning story points) for a scrum planning meeting. 

currently it only uses html5 local storage to save things, but if you wait a little, it will have a node server and websockets, so that all team members can do this remotely.

## usage
shrink wrap can be just client side js, using local storage, and you don't have to do anything.

## in progress
if you want, it can also run on a node server, like a glorified chat room. of dev tasks being dragged around. And then you have to run:

    npm install websocket
    node server.js
