import * as d3 from "./d3.min.js";

// This code is based on the code by http://projects.instantcognition.com/protovis/bulletchart/. I adapted it to fit
// with the current d3.js version. I further simplified the code, to only contain the needed functionality.
(function() {
	d3.bullet = function() {
		var ranges = bulletRanges,
			markers = bulletMarkers,
			measures = bulletMeasures,
			width = 380,
			height = 20;

		// For each small multiple…
		function bullet(g) {
			g.each(function(d, i) {
				var rangez = ranges.call(this, d, i).slice().sort(d3.descending),
					markerz = markers.call(this, d, i).slice().sort(d3.descending),
					measurez = measures.call(this, d, i).slice().sort(d3.descending),
					g = d3.select(this);

				// Compute the new x-scale.
				var x1 = d3.scaleLinear()
					.domain([0, Math.max(rangez[0], measurez[0])])
					.range([0, width]);

				// Retrieve the old x-scale, if this is an update.
				var x0 = this.__chart__ || d3.scaleLinear()
					.domain([0, Infinity])
					.range(x1.range());

				// Stash the new scale.
				this.__chart__ = x1;

				// Derive width-scales from the x-scales.
				var w0 = bulletWidth(x0),
					w1 = bulletWidth(x1);

				// Update the range rects.
				var range = g.selectAll("rect.range")
					.data(rangez);


				range.enter().append("rect")
					.attr("class", function(d, i) { return "range s" + i; })
					.attr("width", w0)
					.attr("height", height)
					.attr("x", 0)
					.transition()
					.attr("width", w1)
					.attr("x", 0);

				range.transition()
					.attr("x", 0)
					.attr("width", w1)
					.attr("height", height);

				// Update the measure rects.
				var measure = g.selectAll("rect.measure")
					.data(measurez);

				measure.enter().append("rect")
					.attr("class", function(d, i) { return "measure s" + i; })
					.attr("width", w0)
					.attr("height", height / 3)
					.attr("x", 0)
					.attr("y", height / 3)
					.transition()
					.attr("width", w1)
					.attr("x", 0);

				measure.transition()
					.attr("width", w1)
					.attr("height", height / 3)
					.attr("x", 0)
					.attr("y", height / 3);

				// Compute the tick format.
				var format = x1.tickFormat(8);

				// Update the tick groups.
				var tick = g.selectAll("g.tick")
					.data(x1.ticks(8), function(d) {
						return this.textContent || format(d);
					});

				// Initialize the ticks with the old scale, x0.
				var tickEnter = tick.enter().append("g")
					.attr("class", "tick")
					.attr("transform", bulletTranslate(x0))
					.style("opacity", 1e-6);

				tickEnter.append("line")
					.attr("y1", height)
					.attr("y2", height * 7 / 6);

				tickEnter.append("text")
					.attr("text-anchor", "middle")
					.attr("dy", "1em")
					.attr("y", height * 7 / 6)
					.text(format);

				// Transition the entering ticks to the new scale, x1.
				tickEnter.transition()
					.attr("transform", bulletTranslate(x1))
					.style("opacity", 1);

				// Transition the updating ticks to the new scale, x1.
				var tickUpdate = tick.transition()
					.attr("transform", bulletTranslate(x1))
					.style("opacity", 1);

				tickUpdate.select("line")
					.attr("y1", height)
					.attr("y2", height * 7 / 6);

				tickUpdate.select("text")
					.attr("y", height * 7 / 6);

				// Transition the exiting ticks to the new scale, x1.
				tick.exit().transition()
					.attr("transform", bulletTranslate(x1))
					.style("opacity", 1e-6)
					.remove();
			});
			d3.timerFlush();
		}

		// ranges (bad, satisfactory, good)
		bullet.ranges = function(x) {
			if (!arguments.length) return ranges;
			ranges = x;
			return bullet;
		};

		// markers (previous, goal)
		bullet.markers = function(x) {
			if (!arguments.length) return markers;
			markers = x;
			return bullet;
		};

		// measures (actual, forecast)
		bullet.measures = function(x) {
			if (!arguments.length) return measures;
			measures = x;
			return bullet;
		};

		bullet.width = function(x) {
			if (!arguments.length) return width;
			width = x;
			return bullet;
		};

		bullet.height = function(x) {
			if (!arguments.length) return height;
			// height = x;
			return bullet;
		};

		return bullet;
	};

	function bulletRanges(d) {
		return d.ranges;
	}

	function bulletMarkers(d) {
		return d.markers;
	}

	function bulletMeasures(d) {
		return d.measures;
	}

	function bulletTranslate(x) {
		return function(d) {
			return "translate(" + x(d) + ",0)";
		};
	}

	function bulletWidth(x) {
		var x0 = x(0);
		return function(d) {
			return Math.abs(x(d) - x0);
		};
	}
})();