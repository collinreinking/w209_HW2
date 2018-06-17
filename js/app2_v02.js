// Shorthand for $( document ).ready()
$(function() {
  var project_viz_lib = project_viz_lib || {};

  project_viz_lib.nReadingsPlot = function() {
    var w = 400;
    var h = 400;
    var circle_radius = 5;
    var svg = d3
      .select("div#viz")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    var margin = { left: 50, right: 10, top: 10, bottom: 30 };
    var figw = w - margin.left - margin.right;
    var figh = h - margin.top - margin.bottom;
    var x = d3.scaleTime().range([margin.left, margin.left + figw]);
    var y = d3.scaleLinear().range([margin.top + figh , margin.top ]);

    var width_ = function(_) {
        var that = this;
        if (arguments.length){ w = _; }
        svg.attr("width", w);
        figw = w - margin.left - margin.right;
        x = d3.scaleTime().range([margin.left, margin.left + figw]);
        return that;
      };

    var height_ = function(_) {
        var that = this;
        if (arguments.length){ h = _; }
        svg.attr("height", h);
        figh = h - margin.top - margin.bottom;
        y = d3.scaleLinear().range([margin.top, margin.top+figh]);
        return that;
      };

    var data = [];
    var data_ = function(_) {
      var that = this;
      if (!arguments.length) return data;
      data = _;
      return that;
      };

  //Define sort function
  var sortByDay = function() {
    var dayData = [ { day: "Sunday", data: [] },
               { day: "Monday", data: [] },
               { day: "Tuesday", data: [] },
               { day: "Wednesday", data: [] },
               { day: "Thursday", data: [] },
               { day: "Friday", data: [] },
               { day: "Saturday", data: [] } ];

    data.forEach(function(d){
      dayData[d.Date.getDay()].data.push(d);
    })
    console.log(dayData)
    x =  d3.scaleBand()
          .range([margin.left, margin.left + figw])
          .domain([0,1,2,3,4,5,6]);
    //
    var singleDayX = d3.scaleTime().range([0, x.bandwidth()]);
    singleDayX.domain([ 0, d3.max(data, function(d) { return d.Date; })]);
    //
    xAxis = d3.axisBottom(x)
              .scale(x)
              .tickSize(0)
              .tickFormat(function (d) { return data[d].day; });

  var days = svg.selectAll(".day")
          .data(daysData)
          .enter()
          .append("g")
          .attr("class", "day")
          .attr("transform", function(d, i) { return "translate(" + x(i) + ",0)"; });

    svg.selectAll("circle")
		   .data(dayData)
		   .transition()
		   .duration(1000)
       .attr("cx", function(d) {
         return x(d.day);
       })

    svg.select(".x.axis")
        .transition()
        .duration(1000)
      .call(xAxis);
  };


  var plot_ = function() {
    var startDate = d3.min(data, function(d) { return d.Date; });
    var endDate = d3.max(data, function(d) { return d.Date; });
    x.domain([
      d3.timeDay.offset(startDate, -1),  //startDate minus one day, for padding
			d3.timeDay.offset(endDate, 1)	  //endDate plus one day, for padding
    ]);

    y.domain([0,
      d3.max(data, function(d) { return d.n_readings; })
    ]);



   var guide_lines = svg
    .selectAll('line')
    .data(data)
    .enter()
    .append("line")
    .attr("x1", function(d){return x(d.Date);})
    .attr("x2", function(d){return x(d.Date);})
    .attr("y1", h - margin.bottom)
    .attr("y2", function(d){return y(d.n_readings);})
    .attr("stroke", "#ddd")
		.attr("stroke-width", 1);

   var circle = svg
     .selectAll("circles")
     .data(data)
     .enter()
     .append("circle")
     .attr("r", circle_radius)
     .attr("cx", function(d) {
       return x(d.Date);
     })
     .attr("cy", function(d) {
       return y(d.n_readings);
     })
     .on("click", function() {
         sortByDay();
      });


     var xAxis = d3.axisBottom(x)
     .scale(x)
     .tickFormat(formatTime);




  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", function(d) {
      return "translate(" + 0 + "," + (margin.top + figh) + ")";
    })
    .call(xAxis);

  var yAxis = d3.axisLeft(y);

  svg
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + margin.left + "," + 0 + ")";
    })
    .call(yAxis);

    // text label for the y axis
    svg.append("text")
      .attr('transform', 'translate('+0+','+(figh / 2)+')rotate(-90)')
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number Of Blood Glucose Readings");



   };



   var public = {
     "plot": plot_,
     "data": data_,
     "width": width_,
     "height": height_
   };

   return public;

};
 //For converting strings to Dates
 var parseTime = d3.timeParse("%Y-%m-%d");
 //For converting Dates to strings
 var formatTime = d3.timeFormat("%m/%d");
 //converting values from my csv to dates and numbers
 var rowConverter = function(d) {
   return { Date: parseTime(d.Date),
            n_readings: parseInt(d.BgReadings),
          };
        }

    d3.csv("data/adherence.csv", rowConverter, function(error, data) {
      //console.log(d3.min(data, function(d) { return d.Date; }));
      //console.log(d3.max(data, function(d) { return d.Date; }));
      console.log(data);




      var nReadingsPlot1 = project_viz_lib.nReadingsPlot();
           nReadingsPlot1.data(data);
           nReadingsPlot1.width(1000);
           nReadingsPlot1.plot();
    });
  });
