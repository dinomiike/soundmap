// var width = 580;
// var height = 200;
// var margin = 5;
// var data = [3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 7];

// var parseDate = d3.time.format("%d-%b-%y").parse;

// var x = d3.time.scale().range([0, width]);
// var y = d3.scale.linear().range([height, 0]);

// var xAxis = d3.svg.axis().scale(x)
//     .orient('bottom').ticks(5);

// var yAxis = d3.svg.axis().scale(y)
//     .orient('left').ticks(5);

// var valueline = d3.svg.line()
//     .x(function(d) { return x(d.date); })
//     .y(function(d) { return y(d.close); });

// var svg = d3.select('.likechart')
//     .append('svg')
//       .attr('width', width)
//       .attr('height', height)
//     .append('g');

// y = d3.scale.linear().domain([0, d3.max(data)]).range([0 + margin, height - margin]),
// x = d3.scale.linear().domain([0, data.length]).range([0 + margin, width - margin]);

// var line = d3.svg.line()
//     .x(function(d, i) { return x(i); })
//     .y(function(d) { return - 1 * y(d); });

// var path = d3.select('g')
//     .append('path')
//       .attr('d', line(data));

var renderGraph = function(data) {
  data = JSON.parse(data);
  var w = 580,
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
      
      // g.append("svg:line")
      //     .attr("x1", x(0))
      //     .attr("y1", -1 * y(0))
      //     .attr("x2", x(w))
      //     .attr("y2", -1 * y(0))

      // g.append("svg:line")
      //     .attr("x1", x(0))
      //     .attr("y1", -1 * y(0))
      //     .attr("x2", x(0))
      //     .attr("y2", -1 * y(d3.max(data)))
      
      // g.selectAll(".xLabel")
      //     .data(x.ticks(5))
      //     .enter().append("svg:text")
      //     .attr("class", "xLabel")
      //     .text(String)
      //     .attr("x", function(d) { return x(d) })
      //     .attr("y", 0)
      //     .attr("text-anchor", "middle")

      // g.selectAll(".yLabel")
      //     .data(y.ticks(4))
      //     .enter().append("svg:text")
      //     .attr("class", "yLabel")
      //     .text(String)
      //     .attr("x", 0)
      //     .attr("y", function(d) { return -1 * y(d) })
      //     .attr("text-anchor", "right")
      //     .attr("dy", 4)
      
      // g.selectAll(".xTicks")
      //     .data(x.ticks(5))
      //     .enter().append("svg:line")
      //     .attr("class", "xTicks")
      //     .attr("x1", function(d) { return x(d); })
      //     .attr("y1", -1 * y(0))
      //     .attr("x2", function(d) { return x(d); })
      //     .attr("y2", -1 * y(-0.3))

      // g.selectAll(".yTicks")
      //     .data(y.ticks(4))
      //     .enter().append("svg:line")
      //     .attr("class", "yTicks")
      //     .attr("y1", function(d) { return -1 * y(d); })
      //     .attr("x1", x(-0.3))
      //     .attr("y2", function(d) { return -1 * y(d); })
      //     .attr("x2", x(0))
};