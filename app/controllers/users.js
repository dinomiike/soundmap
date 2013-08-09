
/*
 * All operations related to users.
 */

exports.operations = function(req, res){
  // res.send("respond with a resource");
  this.greet = function() {
    console.log('hello');
    res.end('world');
  };
};