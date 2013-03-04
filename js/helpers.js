var Constants = new function() {
  // if you want different columns, you need to modify both CardSize and columns
  // i recommend naming the column id's as column-someCardSizeDefinedInCardSizes
  // which would make the columnIdPrefix = column-
	this.CardSizes = {
                  inprogress : "inprogress", 
                  review: "review", 
                  done: "done",
                  TO_DO: "todo"
                  };
	this.columns = [
                    '#column-inprogress',
                    '#column-review',
                    '#column-done',
                    '#column-todo'];
  this.columnIdPrefix = "column-";
  this.serverUrl = 'ws://127.0.0.1:9000';
  this.serverPort = 9000;
}

var Helpers = new function() {
	this.knitFakeSocks = function () {
	    var socks = [];
	    socks.push({text: "one", size: Constants.CardSizes.TO_DO, id:"card-0"});
	    socks.push({text: "two", size: Constants.CardSizes.TO_DO, id:"card-1"});
	    socks.push({text: "three", size: Constants.CardSizes.TO_DO, id:"card-2"});
	    socks.push({text: "four", size: Constants.CardSizes.TO_DO, id:"card-3"});

	    return socks;
  	}
}

Array.prototype.findCard = function(id) {
    for (var i = 0; i < this.length; i++) {
      if (this[i].id == id) return i;
    }
    return -1;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};


// make available to server
if (typeof(module) !== 'undefined')
{
	module.exports = Array.prototype.remove
	module.exports = Array.prototype.findCard	
  module.exports = Constants;
}
