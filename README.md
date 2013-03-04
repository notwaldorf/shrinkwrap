# shrink wrap

tiny little web tool that helps you with task t-shirt sizing (aka effort estimation, aka assigning story points) for a scrum planning meeting. 

## usage
shrink wrap can be just client side js, using local storage, and you don't have to do anything other than launch the `index.html` in a browser.

## awesome usage
if you want, shrink wrap also comes with a node server, making it a glorified chat room. of little cards being dragged around. To set it up:

    npm install websocket
    npm install node-static
    node server.js

## awesomer usage
if your team doesn't use t-shirt sizes and uses something else (points, poker, number of cat videos a task is worth, etc.), all you have to do is edit the `index.html` (add/remove/rename the `.draggable` divs), and the `Constants.columns` variable in `helpers.js`. Fact. (ok and change the width of the `.suit` so that things look pretty. i'll try to fix this soon). 

For that matter, you can even make this into a super light progress tracking app, by making four columns (not started, in progress, to review, done). Look at the `progress-tracking` branch for an example. That's it, that's all. 

