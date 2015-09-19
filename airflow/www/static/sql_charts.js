(function (document, $, d3, nv) {

    "use strict";

    var $document = $(document);

    var Page = {

        $base_div: null,

        display_chart: true,
        display_data_table: true,
        data_url: null,

        init : function(div_id) {
            var div_id = div_id || "[data-element=sql-charts-view]";

            this.$div = $(div_id);

            this.display_data_table = this.$div.data("display-data-table");
            this.display_chart = this.$div.data("display-chart");
            this.data_url = this.$div.data("base-url") + location.search;

            Chart.height = this.$div.data("chart-height");

            //context hack…
            var that = this;

            //get chart data and render it
            $.getJSON(this.data_url, function(payload){
                that.render_data(payload);
            }).fail(this.render_error);
  
        },

        render_data: function(payload) {
            var data = payload;
            
            Spinner.hide();

            SQLPannel.show(data.sql_html);

            this.$div.find("[data-element=h2-label]").html(data.label);

            //show data table if active
            if(this.display_data_table) {
                DataTable.render_data(data.data);
            } else {
                DataTable.hide(1000);
            }

            //show chart if active
            if(this.display_chart) {
                Chart.render_data(data);
            } else {
                Chart.hide(1000);
            }
            
        },

        render_error: function(jqxhr, textStatus, err) {
            ErrorView.show(textStatus + ': ' + err );
            Chart.hide(1000);
            DataTable.hide(1000);
        }

    }


    var Chart = {

        $div: null,
        $chart: null,
        spinner: null,

        height: "600px",
        width: "100%",

        init: function(div_id) {
            var div_id = div_id || "#chart_section";
            this.$div = $(div_id);

            this.spinner = Object.create(Spinner);
            this.spinner.$div = this.$div.find("[data-element=spinner]");

            this.$chart = this.$div.find("[data-element=chart]");

        },

        hide: function(delay) {
            var delay = delay || 0;
            this.$div.hide(delay);
        }, 

        render_data: function(data) {
            data = data.chart; 
            this.$chart.height(this.height);
            this.$chart.width(this.width);

            //currently only line, bar, column, stacked_area

            if(data.settings.type == "line") {
                // http://nvd3.org/examples/line.html
                var chart = nv.models.lineChart()
                    .x(function(d) { return d[0] })
                    .y(function(d) { return d[1] }) 
                    .useInteractiveGuideline(true)  
                    .showLegend(true)  
                    .clipEdge(true);

            } else if(data.settings.type == "stacked_area") {
                //http://nvd3.org/examples/stackedArea.html
                var chart = nv.models.stackedAreaChart()
                    .x(function(d) { return d[0] })
                    .y(function(d) { return d[1] })
                    .useInteractiveGuideline(true)
                    .showLegend(true)
                    .showControls(true)
                    .clipEdge(true);

            } else if(data.settings.type == "bar") {
                //http://nvd3.org/examples/multiBarHorizontal.html
                var chart = nv.models.multiBarHorizontalChart()
                    .x(function(d) { return d[0] })
                    .y(function(d) { return d[1] }) 
                    .showLegend(true)
                    .showControls(true);

            } else if(data.settings.type == "column") {
                //http://nvd3.org/examples/multiBar.html
                var chart = nv.models.multiBarChart()
                    .x(function(d) { return d[0] })
                    .y(function(d) { return d[1] }) 
                    .showControls(true)
                    .showLegend(true);

            } else {
                ErrorView.show("Chart type '"+data.settings.type+"' is currently not supported");
            }


            //set labels
            chart.xAxis.axisLabel(data.settings.labels.xaxis);
            chart.yAxis.axisLabel(data.settings.labels.yaxis);

            //set xaxis to date if setting is set
            if(data.settings.x_is_date) {
                chart.xAxis
                    .tickFormat(function(d) {
                      return d3.time.format('%x')(new Date(d))
                    });
            }            

            //set logarythmic scale if setting is set
            if(data.settings.y_log_scale) {
                chart.yScale(d3.scale.log());
            }

            d3.select(this.$chart[0]).datum(data.series).call(chart);

            nv.utils.windowResize(chart.update);
        }
        
    }


    var DataTable = {

        $div: null,
        spinner: null,

        scrollX: true,
        iDisplayLength: 100,

        init: function(div_id) {
            var div_id = div_id || "#datatable_section";
            this.$div = $(div_id);

            this.spinner = Object.create(Spinner);
            this.spinner.$div = this.$div.find("[data-element=spinner]")
        },

        hide: function(delay) {
            var delay = delay || 0;
            this.$div.hide(delay);
        },

        render_data: function(data) {
            //render data table
            this.$div.find('[data-element=datatable]').dataTable( {
                "data": data.data,
                "columns": data.columns,
                "scrollX": this.scrollX,
                "iDisplayLength": this.iDisplayLength,
              });   
        }

    }

    var ErrorView = {

        $div: null,

        init: function(div_id) {
            var div_id = div_id || "#error";
            this.$div = $(div_id);
        },

        show: function(msg) {
            var msg = msg || "ooops!";
            this.$div.find("[data-element=message]").html(msg);
            this.$div.show();
        },

        hide: function(delay) {
            var delay = delay || 0;
            this.$div.hide(delay);
        }
    }


    // Show and hide spinners global oder individually
    var Spinner = {

        $div: null,

        init: function(div_id) {
            var div_id = div_id || "[data-element=spinner]";
            this.$div = $(div_id);
        },

        show: function() {
            this.$div.show();
        },

        hide: function(delay) {
            var delay = delay || 0;
            this.$div.hide(delay);
        }

    }    


    var SQLPannel = {

        $div: null,

        init: function(div_id) {
            var div_id = div_id || "[data-element=sql-pannel]";
            this.$div = $(div_id);
        },

        show: function(sql) {
            var sql =  sql || "empty";
            this.$div.find("[data-element=body]").html(sql);
            this.$div.show();
        },

        hide: function(delay) {
            var delay = delay || 0;
            this.$div.hide(delay);
        }

    }


    $document.ready(function () {
        ErrorView.init();
        Chart.init();
        DataTable.init();
        Spinner.init();
        SQLPannel.init();

        Page.init();
    });


})(document, jQuery, d3, nv);