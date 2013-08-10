exports.room = function(req, res){
  console.log('inside the room route');
  res.render('room', { title: 'soundmap join a room' });
};