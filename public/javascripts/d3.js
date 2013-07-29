var scrubber = function(duration) {
  var width = 500;
  var height = 200;

  var svg = d3.select('.scrubber').append('svg')
    .attr('width', width)
    .attr('height', height);

  var line = svg.append('line')
    .attr('x1', 40)
    .attr('y1', 50)
    .attr('x2', 450)
    .attr('y2', 150)
    .style('stroke', 'rgb(0,0,0)');
};