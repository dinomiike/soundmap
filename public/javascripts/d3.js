var songDuration = 0;

var scrubber = function(duration) {
  songDuration = duration;
  var width = 668;//500;
  var height = 200;

  var svg = d3.select('.scrubber').append('svg')
    .attr('width', width)
    .attr('height', height);

  var line = svg.append('line')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', 0)
    .style('stroke', 'rgb(0,0,0)');
};

var drawLine = function(startPos, endPos, jump) {
  jump = jump || 0;
  endPos = (endPos * 668) / songDuration;
  var svg = d3.select('.scrubber');
  var line = svg.select('line')
    .attr('x1', startPos)
    .attr('y1', 50)
    .attr('x2', endPos)
    .attr('y2', jump)
    .style('stroke', 'rgb(0,0,0)');
  startPos = endPos;
};