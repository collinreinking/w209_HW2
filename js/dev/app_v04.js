// Shorthand for $( document ).ready()
$(function() {
  var project_viz_lib = project_viz_lib || {};

  project_viz_lib.nReadingsPlot = function() {
    var w = 400;
    var h = 400;
    var circle_radius = 3;
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
    var click_count = 0;
    var dayBuffer = 100;
    var sortByDay = function() {
      click_count += 1;
      if (click_count % 2 != 0 ){
        //var xDay = d3.scaleOrdinal().range([margin.left, margin.left + figw])
        var xDay = d3.scaleBand()
        .domain(data.map(function(d) { return d.day; }))
        .rangeRound([margin.left, margin.left + figw])
        .paddingInner(0.2)
        .paddingOuter(0.1);
        // console.log("sortByDay")
        // click_count +=1;
        // circle_radius += -2*((-1)**click_count);
        // console.log(click_count, circle_radius, (-1)**click_count);


        sameday = function(day) {
          same_days = [];
          data.forEach(function(d) {
            //debugger;
            if(d.day == day.day){
              same_days.push(d);
            }
          });
          return same_days;
        }
        getDayScale = function(day) {
          var startDate = d3.min(sameday(day), function(d) { return d.Date; });
          var endDate = d3.max(sameday(day), function(d) { return d.Date; });

          var one_day_scale = d3.scaleTime().domain([
            d3.timeDay.offset(startDate, -1),  //startDate minus one day, for padding
            d3.timeDay.offset(endDate, 1)	  //endDate plus one day, for padding
          ])
          .rangeRound([0, xDay.bandwidth()*.8])

          return one_day_scale;
        }

        console.log(data)
        svg.selectAll("circle")
        .transition()
        .duration(100)
        .attr("cx", function(d) {
          var daysScale = getDayScale(d);
          return (daysScale(d.Date)+ xDay(d.day));
        });

        var lines = svg.selectAll("line")
        .transition()
        .duration(100)
        .attr("cx", function(d) {
          var daysScale = getDayScale(d);
          return (daysScale(d.Date)+ xDay(d.day));
        });






        xAxis = d3.axisBottom(x)
        .scale(xDay)
        .tickFormat(formatDay)

        svg.select(".x.axis")
        .transition()
        .duration(100)
        .call(xAxis);
        //.attr("r", circle_radius);





        console.log('aaa')
      } else{
        console.log('bbbb')
        svg.selectAll("circle")
        .transition()
        .duration(100)
        .attr("cx", function(d) {
          return x(d.Date);
        })
      }
    }


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



      // var guide_lines = svg
      //  .selectAll('line')
      //  .data(data)
      //  .enter()
      //  .append("line")
      //  .attr("x1", function(d){return x(d.Date);})
      //  .attr("x2", function(d){return x(d.Date);})
      //  .attr("y1", h - margin.bottom)
      //  .attr("y2", function(d){return y(d.n_readings);})
      //  .attr("stroke", "#ddd")
      // .attr("stroke-width", 1);

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
      .on("mouseover", function(d) {
        div.transition()
        .duration(200)
        .style("opacity", .9);
        div	.html(formatDay(d.day) + "<br/>"  + formatTime(d.Date) + "<br/>" + d.n_readings)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        div.transition()
        .duration(500)
        .style("opacity", 0);
      })




      // ###
      // .on("mouseover", function(d) {
      //
      //  //Get this bar's x/y values, then augment for the tooltip
      //  var xPosition = parseFloat(d3.select(this).attr("cx"))+2;
      //  var yPosition = parseFloat(d3.select(this).attr("cy"))-4;
      //
      //  //Create the tooltip label
      //  svg.append("text")
      //     .attr("id", "tooltip")
      //     .attr("x", xPosition)
      //     .attr("y", yPosition)
      //     .attr("text-anchor", "middle")
      //     .attr("font-family", "sans-serif")
      //     .attr("font-size", "11px")
      //     .attr("font-weight", "bold")
      //     .attr("fill", "black")
      //     .append("title")
      //     .text(formatDay(d.day) +" <br> "+ formatTime(d.Date));
      //
      //
      // })
      // .on("mouseout", function() {
      //
      //  //Remove the tooltip
      //  d3.select("#tooltip").remove();
      //
      // })
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
  var formatDay = function(n) {
    return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][n];
  }

  var rowConverter = function(d) {
    return { Date: parseTime(d.Date),
      n_readings: parseInt(d.BgReadings),
      day: parseTime(d.Date).getDay()
    };
  }

  d3.csv("data/adherence.csv", rowConverter, function(error, data) {
    //console.log(d3.min(data, function(d) { return d.Date; }));
    //console.log(d3.max(data, function(d) { return d.Date; }));
    console.log(data);


    var nReadingsPlot1 = project_viz_lib.nReadingsPlot();
    nReadingsPlot1.data(data);
    nReadingsPlot1.width(800);
    nReadingsPlot1.plot();
  });
});

var div = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);
