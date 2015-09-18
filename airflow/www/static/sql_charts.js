(function (document, $, d3, nv) {

    "use strict";

    var $document = $(document);

    var Page = {

        $base_div: null,

        display_chart: true,
        display_data_table: true,
        data_url: null,

        init : function(div_id) {
            var div_id = div_id || "[data-element=sql-charts-view]"

            this.$div = $(div_id);

            this.display_data_table = this.$div.data("display-data-table");
            this.display_chart = this.$div.data("display-chart");
            this.data_url = this.$div.data("base-url") + location.search;

            Chart.height = this.$div.data("chart-height");

            //context hack…
            var that = this;

            //get chart data and render it
            $.getJSON(this.data_url, function(payload){
                that.render_data(payload)
            }).fail(this.render_error);
  
        },

        render_data: function(payload) {
            var data = payload.data;
            

            //show data table if active
            if(this.display_data_table) {
                DataTable.render_data(data);
                DataTable.spinner.hide();
            } else {
                DataTable.hide(1000);
            }

            //show chart if active
            if(this.display_data_table) {

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
        spinner: null,

        height: "600px",
        width: "100%",
        colors: ["#FF5A5F", "#007A87", "#7B0051", "#00D1C1", "#8CE071", "#FFB400", 
            "#FFAA91", "#B4A76C", "#9CA299", "#565A5C"],

        init: function(div_id) {
            var div_id = div_id || "#chart_section";
            this.$div = $(div_id);

            this.spinner = Object.create(Spinner);
            this.spinner.$div = this.$div.find("[data-element=spinner]")
        },

        hide: function(delay) {
            var delay = delay || 0;
            this.$div.hide(delay)
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
            this.$div.hide(delay)
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
            this.$div.hide(delay)
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
            this.$div.hide(delay)
        }

    }


    $document.ready(function () {
        ErrorView.init();
        Chart.init();
        DataTable.init();
        Spinner.init();

        Page.init();
    });


})(document, jQuery, d3, nv);