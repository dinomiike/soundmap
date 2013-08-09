
/*
 * All operations related to users.
 */

exports.operations = function(req, res){
  var sound = [];
  sound.push(req.query.cow);
  sound.push(req.query.horse);
  res.end(JSON.stringify(sound));
};