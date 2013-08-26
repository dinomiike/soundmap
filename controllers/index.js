exports.controller = function() {
  console.log('inside controller index');
  this.randomParam = 'hello world';
  this.test = function() {
    console.log(this.randomParam);
  }

  return this;
};

// Controller;

// var Controller = function(req, res) {
//   console.log('inside the controller');
//   this.hello = "world";
// };

// Controller.prototype.test = function() {
//   console.log('inside test function');
//   res.end('it works');
// };
