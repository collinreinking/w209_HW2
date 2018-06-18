// Shorthand for $( document ).ready()
$(function() {
  var project_viz_lib = project_viz_lib || {};

  project_viz_lib.nReadingsPlot = function() {
    var trans_duration1 = 500;
    var w = 400;
    var h = 400;
    var circle_radius = 3;
    var line = [];
    var data = [];
    var guide_lines;
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


    var data_ = function(_) {
      var that = this;
      if (!arguments.length) return data;
      data = _;
      return that;
    };



    var current_graph_type = "timeseries";
    var dayBuffer = 100;
    var changeView = function() {
      if (current_graph_type == "timeseries"){
        current_graph_type = "cycleplot"

        function getAllSameWeekday(day) {
         //returns an array of all d that are the same day of week as day
         same_days = [];
         data.forEach(function(d) {
           if(d.day == day.day){
             same_days.push(d);
           }
         });
         return same_days;
       }

        // a scale to group days together
        var xDayOfWeekScaleBand = d3.scaleBand()
        .domain(data.map(function(d) { return d.day; }))
        .rangeRound([margin.left, margin.left + figw])
        .padding(0.3);

        //returns a scale for the day of the week
        //that will map the date across the band for the day
        function getDayScale(day) {
          var startDate = d3.min(getAllSameWeekday(day), function(d) { return d.Date; });
          var endDate = d3.max(getAllSameWeekday(day), function(d) { return d.Date; });

          var one_day_scale = d3.scaleTime().domain([
            d3.timeDay(startDate),
            d3.timeDay(endDate)
          ])
          .rangeRound([0, xDayOfWeekScaleBand.bandwidth()])

          return one_day_scale;
        }

        function compareDayDate(a,b) {
          // compares day of week first
          // If the two have the same day of the, compare the date
          if(a.day == b.day)
          {
            return (a.Date < b.Date) ? -1 : (a.Date > b.Date) ? 1 : 0;
          }
          else
          {
            return (a.day < b.day) ? -1 : 1;
          }
        }

        // need to sort in order for lines to draw correctly
        data.sort(compareDayDate)

        //move dots so that they are grouped by day of week
        //but remain in time series order
        svg.selectAll("circle")
        .transition("move_circles")
        .duration(trans_duration1)
        .attr("cx", function(d) {
          var daysScale = getDayScale(d);
          return (daysScale(d.Date)+ xDayOfWeekScaleBand(d.day));
        });


        var plotLine = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) {var daysScale = getDayScale(d);
          return (daysScale(d.Date) + xDayOfWeekScaleBand(d.day));})
          .y(function(d) {return y(d.n_readings);})



          for (var day = 0; day <= 6; day++){
            line[day] = svg.append("path")
            .datum(getAllSameWeekday({day:day}))
            .attr("class","dayline")
            .attr("id", "dayline")
            .attr("d",plotLine);

            var totalLength = line[day].node().getTotalLength();
            line[day].attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition('drawLine')
            .delay(trans_duration1)
            .duration(trans_duration1 *2)
            .ease(d3.easePolyInOut)
            .attr("stroke-dashoffset", 0)

          }







          xAxis = d3.axisBottom(x)
          .scale(xDayOfWeekScaleBand)
          .tickFormat(formatDay)

          svg.select(".x.axis")
          .transition("change_to_day_axis")
          .duration(trans_duration1)
          .call(xAxis);
          //.attr("r", circle_radius);

          guide_lines
          .transition("hide_guide_lines")
          .duration(trans_duration1 + trans_duration1/2)
          .ease(d3.easePolyInOut)
          //.attr("x1", function(d){return x(d.Date);})
          //.attr("x2", function(d){return x(d.Date);})
          //.attr("y1", h - margin.bottom)
          //.attr("y2", function(d){return y(d.n_readings);})
          .attr("y2", h - margin.bottom);



          console.log('end of change to grouped by day')
        } else {
          // switch back to timeseries plot
          current_graph_type = "timeseries"
          console.log('bbbb')
          svg.selectAll("circle")
          .transition("revert_circles")
          .delay(trans_duration1/2)
          .duration(trans_duration1/2 + trans_duration1)
          .attr("cx", function(d) {
            return x(d.Date);
          })

          xAxis = d3.axisBottom(x)
          .scale(x)
          .tickFormat(formatTime);

          svg.select(".x.axis")
          .transition('revert_axis')
          .delay(trans_duration1/2)
          .duration(trans_duration1)
          .call(xAxis);


          for (var day = 0; day <= 6; day++){
            var totalLength = line[day].node().getTotalLength();
            //console.log(totalLength)
            line[day]
            .transition('removeLine')
            .duration(trans_duration1/2)
            .ease(d3.easePolyInOut)
            .attr("stroke-dashoffset", totalLength)
          }



          guide_lines
          .transition("show_guide_lines")
          .delay(trans_duration1/2)
          .duration(trans_duration1 + trans_duration1/2)
          .ease(d3.easePolyInOut)
          .attr("y2", function(d){return y(d.n_readings);})


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

        svg.append("linearGradient")
              .attr("id", "n_readings-gradient")
              .attr("gradientUnits", "userSpaceOnUse")
              .attr("x1", 0).attr("y1", y(0))
              .attr("x2", 0).attr("y2", y(10))
            .selectAll("stop")
              .data([
                {offset: "0%", color: d3.hsl(23, 1.00, .56)},
                {offset: "25%", color: d3.hsl(23, .50, .56)},
                {offset: "50%", color: d3.hsl(137, .25, .34)},
                {offset: "100%", color: d3.hsl(137, .8, .34)}
              ])
            .enter().append("stop")
              .attr("offset", function(d) { return d.offset; })
              .attr("stop-color", function(d) { return d.color; });


        guide_lines = svg
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
        .style("fill","url(#n_readings-gradient)")
        .on("mouseover", function(d) {
          div.transition('tooltipon')
          .duration(100)
          .style("opacity", .9);
          div	.html(formatDay(d.day) + "<br/>"  + formatTime(d.Date) + "<br/>" + d.n_readings)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          div.transition('tooltipoff')
          .duration(100)
          .style("opacity", 0);
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




        d3.select("body")
        .append("button")
        .text("Change View: Group by Day")
        .on("click", function() {

          if (d3.select(this).text() == "Change View: Group by Day" ){
            d3.select(this).text("Change View: Time Series")
          } else {
            d3.select(this).text("Change View: Group by Day")
          };
          changeView();
        });;

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
      d3.text("data/description.txt", function(error, textData){
        console.log(textData)
        d3.select("body")
        .append("pre")
        .text(textData);
      });
    });
  });

  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
