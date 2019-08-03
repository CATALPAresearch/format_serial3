define(['/moodle/course/format/ladtopics/amd/src/lib/vue.js'], function (Vue) {


  let milestone = function Milestones(d3) {
    // Sorting methods
    const sorts = [
      { name: 'none', fn: null },
      { name: 'asc', fn: (a, b) => a.val - b.val },
      { name: 'desc', fn: (a, b) => b.val - a.val },
    ];
    bars.append("rect")
     
      .attr("x", function (d) {
        return x(d.start);
      })
      .attr("y", function (d, i) {
        return y(i) - (barheight / 2);
      })
      .attr("height", barheight)
      .attr("width", function (d) {
        return x(d.end);
      })
      .attr("fill", function (d) {
        return z(parseInt(d.g, 10));
      })
      .attr("data-legend", function (d) {
        return parseInt(d.g, 10);
      })

    //Component for Rectangles
    Vue.component('rect-item', {
      template: `
    <rect
      class="bar"
      :x="tweenVal.x"
      :y="tweenVal.y"
      :fill="tweenVal.fill"
      :width="tweenVal.end"
      :height="tweenVal.barheight"
      :data-legend="tweenVal.group"
    >
      <title>{{ item.name }} - {{ item.val }}</title>
    </rect>
  `,
      props: ['scale', 'height', 'item'],
      data() {
        return {
          tweenVal: {
            x: this.scale.x(this.item.name),
            y: this.height,
          },
        };
      },
      mounted() {
        this.updateRect();
      },
      watch: {
        scale() {
          this.updateRect();
        },
      },
      methods: {
        updateRect() {
          const oldVal = this.tweenVal;
          const newVal = {
            x: this.scale.x(this.item.name),
            y: this.scale.y(this.item.val),
            z: 0
          };
          this.tweenVal = newVal;
          /* new TWEEN.Tween(oldVal)
            .easing(d3.easeCubic)
            .to(newVal, 1000)
            .on('update', (d) => { this.tweenVal = d; })
            .start();
            */
        },
      },
    });

    // Component for X axis
    Vue.component('axis-x', {
      template: `
    <g></g>
  `,
      props: ['scaleX'],
      mounted() {
        this.addXaxis();
      },
      watch: {
        scaleX() {
          this.updateXaxis();
        },
      },
      methods: {
        addXaxis() {
          d3.select(this.$el).append('g')
            .attr('class', 'x axis')
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.scaleX).ticks(0));
        },
        updateXaxis() {
          const t = d3.transition()
            .duration(1000)
            .ease(d3.easeCubic);
          d3.select(this.$el).selectAll('.axis.x')
            .transition(t)
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.scaleX).ticks(0));
        },
      },
    });

    // Component for Y Axis
    Vue.component('axis-y', {
      template: `
    <g></g>
  `,
      props: ['scaleY'],
      mounted() {
        this.addYaxis();
      },
      watch: {
        scaleY() {
          this.updateYaxis();
        },
      },
      methods: {
        addYaxis() {
          d3.select(this.$el).append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(this.scaleY).ticks(10));
        },
        updateYaxis() {
          const t = d3.transition()
            .duration(1000)
            .ease(d3.easeCubic);
          d3.select(this.$el).selectAll('.axis.axis--y')
            .transition(t)
            .call(d3.axisLeft(this.scaleY).ticks(10));
        },
      },
    });
    

    new Vue({
      el: '#milebar',
      data() {
        return {
          outsideWidth: 600,
          outsideHeight: 100,
          margin: {
            left: 40,
            top: 10,
            right: 10,
            bottom: 40,
          },
          selectedSort: sorts[0],
          barheight: 30,
          sorts,
          items: [
            { name: 'a', val: 10 },
            { name: 'b', val: 8 },
            { name: 'c', val: 1 },
            { name: 'd', val: 5 },
            { name: 'e', val: 6 },
            { name: 'f', val: 3 },
          ],
          milestones: [
            {
              name: 'Meilenstein 1',
              objective: 'Alles lernen',
              start: '05/29/2019',
              end: '06/02/2019',
              ressources: [],
              strategies: []
            },
            {
              name: 'Meilenstein 2',
              objective: 'Alles lernen',
              start: '05/14/2019',
              end: '06/01/2019',
              ressources: [],
              strategies: []
            }
          ]
        };
      },
      mounted: function(){
        this.milestones.forEach(function (d, i) {
          d.start = new Date(d.start);//formatDate2(new Date(d.start));
          d.end = new Date(d.end);//formatDate2(new Date(d.end));
          d.g = 1;
        });
      },
      computed: {
        width() {
          return this.outsideWidth - this.margin.left - this.margin.right;
        },
        height() {
          return this.outsideHeight - this.margin.top - this.margin.bottom;
        },
        sortedItems() {
          if (this.selectedSort.name === 'none') {
            return [...this.items];
          }
          return [...this.items].sort(this.selectedSort.fn);
        },
        scale() {
          const xmin = d3.min(this.milestones, function (d) {
            return d.start;
          });
          const xmax = d3.max(this.milestones, function (d) {
              return d.end;
            });
          const ymax = milestones.length;

          const x = d3.scaleTime()
              .domain([xmin, xmax])
              //.domain(xRange)
              .range([0, this.width]);

          const y = d3.scaleLinear()
              .domain([0, ymax])
              .range([0, this.height]);
          
          const z = d3.scaleOrdinal()
              .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

          return { x, y, z };
        },
      },
      methods: {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        randomize() {
          function getRandomIntInclusive(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
          }
          this.items.forEach((item) => {
            item.val = getRandomIntInclusive(0, 20);
          });
        },
      },
    });
  };
  return milestone;
});

/**
// Adds the svg canvas


var bars = milestoneChart.selectAll(".bar")
  .data(milestones)
  .enter()
  .append("g");


  .on('click', function (d) {
    $('#MilestoneModal').find('#MilestoneModalLabel').text(d.name)
    $('#MilestoneModal').find('.modal-body').text(d.objective)
    $('#MilestoneModal').modal();
  })
  //.on('mouseover', tip.show)
  //.on('mouseout', tip.hide)
  ;


// Title
milestoneChart.append("text")
  .attr("x", (width / 2))
  .attr("y", 0 - (margins.top / 2))
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .text("");

// Axis label
milestoneChart.append("text") // y
  .attr("text-anchor", "middle")
  .attr("transform", "translate(" + (-10) + "," + (height / 2) + ")rotate(-90)") // text is drawn off the screen top left, move down and out and rotate
  .text("yy");

milestoneChart.append("text") // x
  .attr("text-anchor", "middle")
  .attr("transform", "translate(" + (width / 2) + "," + (height + margins.bottom - 3) + ")") // centre below axis
  .text("");
 */