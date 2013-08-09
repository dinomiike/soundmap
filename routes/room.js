exports.room = function(req, res){
  console.log(req.query);
  res.render('room', { title: 'soundmap join a room' });
};