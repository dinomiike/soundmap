var renderGraph = function(data) {
  data = JSON.parse(data);
  var w = 668,
  h = 90,
  margin = 0,
  y = d3.scale.linear().domain([0, d3.max(data)]).range([0 + margin, h - margin]),
  x = d3.scale.linear().domain([0, data.length]).range([0 + margin, w - margin]);

  var vis = d3.select('#likechart')
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h);

  var g = vis.append('svg:g')
    .attr('transform', 'translate(0, ' + h + ')')
    .attr('class', 'heatmapoverlay');
  
  var line = d3.svg.line()
    .interpolate('basis')
    .x(function(d,i) { return x(i); })
    .y(function(d) { return - 1 * y(d); });

  g.append("svg:path").attr("d", line(data));
};