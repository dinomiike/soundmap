
/*
 * All operations related to users.
 */

// var Operations = function(req, res) {
//   console.log('inside Operations controller');
//   this.x = 10;
//   this.y = 20;

//   return (x + ',' + y);
// };

// exports.userController = Operations;

exports.operations = function(req, res){
  // res.send("respond with a resource");
  // this.greet = function() {
  //   console.log('hello');
  //   res.end('world');
  // };
  console.log('inside the operations controller');
  // res.render('room', { title: 'soundmap join a room' });
  res.end('test');
  return 'ok';
};