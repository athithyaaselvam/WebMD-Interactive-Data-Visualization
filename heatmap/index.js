var fullData;
var timeSeriesChart;
var tooltipDiv;
var timeSeriesSvg;
var timeSeriesScale = '';
const timeSeriesConfig = { line: {
		color: '#ff4c4c',
	},
	drop: {
		radius: 7.5,
		onMouseOver: data => {
			tooltipDiv.transition()
				.duration(200)
				.style("opacity", 1);
			tooltipDiv.html(dateFormat(new Date(data)) + "<br/>")
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		},
		onMouseOut: data => {
			tooltipDiv.transition()
				.duration(500)
				.style("opacity", 0);
		},
	},
	range : {
		start: new Date('2010/01/01'),
		end: new Date('2016/01/01')
	},
	label: {
		text : d => `${d.name}`
	},
	zoom: {
		onZoomEnd: () => {
			timeSeriesScale = timeSeriesChart.scale().domain();
		}
	}
};
const dateFormat = d3.timeFormat("%c");

function start () {
	d3.json('file:///Users/athithyaaselvam/Desktop/dv%20project%20code/heatmap/result.json')
	.then( data => {
		let idx = 0;

		data = data.filter(row => {
			return row.name != 'Penis' && row.name != 'Vagina' && row.name != 'Sexual Intercourse'
		});

		data.sort((a, b) => b.size - a.size);
		fullData = data.slice(0, 20);
		fullData.sort((a, b) => {
    		if(a.name < b.name) return -1;
    		if(a.name > b.name) return 1;
    		return 0;
		});
		fullData.forEach(row => row.index = idx++);
		drawHeatMap();

		tooltipDiv = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		drawTimeSeries();
	});
}

function drawHeatMap() {
	var topics = fullData;
	console.log(topics);
	var rows = (Math.ceil(Math.sqrt(topics.length)));
	var cols = rows;

	var tileWidth = 120;
	var tileHeight = 80;
	var lowColor = "white";
	var highColor = "#ff4c4c";
	var borderColor = "white";
	var hoverColor = "#8a2be2";
	var borderWidth = 2;
	var popRatio = 1.3;
	var popSpeed = 100;

	var font = "arial";
	var minFontSize = "15";
	var maxFontSize = minFontSize*popRatio;

	var margin = {top: 20, bottom: 50, left: 50, right: 20};

	var svgWidth = tileWidth*rows + margin.left + margin.right;
	var svgHeight = tileHeight*cols + margin.top + margin.bottom;

	var colorScale = d3.scaleLinear()
						.domain([d3.min(topics.map(function(d){return d.size})),
								 d3.max(topics.map(function(d){return d.size}))])
						.range([lowColor, highColor]);

	var svg = d3.select("#heatmap").append("svg")
							.attr("width", svgWidth)
							.attr("height", svgHeight);

	var g = svg.selectAll("g")
				.data(topics)
				.enter()
				.append("g");

	g.append("rect")
		.attr("x", function(d){return margin.left+tileWidth*(d.index%5);})
		.attr("y", function(d){return margin.top+tileHeight*Math.floor(d.index/rows);})
		.attr("height", tileHeight)
		.attr("width", tileWidth)
		.style("fill", function(d){return colorScale(d.size);})
		.style("stroke", borderColor)
		.style("stroke-width", borderWidth)
		.on("mouseenter", handleMouseEnter)
		.on("mouseout", handleMouseOut)
		.on("click", handleMouseClick);

	g.append("text")
		.text(function(d){return d.name;})
		.attr("x", function(d){return (margin.left+tileWidth*(d.index%5))+(tileWidth/2);})
		.attr("y", function(d){return (margin.top+tileHeight*Math.floor(d.index/rows))+(tileHeight/2);})
		.attr("fill", "black")
		.attr("text-anchor", "middle")
		.attr("font-family", font)
		.attr("font-size", minFontSize)
		.attr("pointer-events", "none");


	function handleMouseEnter(d) {
		d3.select(this.parentNode).moveToFront();

		d3.select(this)
			.transition()
				.duration(popSpeed)
				.attr("width", tileWidth*popRatio)
				.attr("height", tileHeight*popRatio)
				.attr("x", d3.select(this).attr("x")-(((tileWidth*popRatio)-tileWidth)/2))
				.attr("y", d3.select(this).attr("y")-(((tileHeight*popRatio)-tileHeight)/2))
				.style("fill", hoverColor)
				.style("stroke", "black")
				.style("stroke-opacity", 0.1)
				.style("stroke-width", 5);

		d3.select(this.parentNode).select("text")
			.transition()
				.duration(popSpeed)
				.attr("font-size", maxFontSize);

		//timeSeriesConfig.line.color = 'black';
		//timeSeriesSvg.call(timeSeriesChart.draw(timeSeriesConfig, timeSeriesChart.scale()));

		drawTimeSeries(d.name);
	}

	function printType(d) {
		d3.select(this.parentNode).select("text")
			.text("testing");
	}

	function handleMouseOut(d) {
		d3.select(this)
			.transition()
				.duration(popSpeed)
				.attr("width", tileWidth)
				.attr("height", tileHeight)
				.attr("x", function(d){return margin.left+tileWidth*(d.index%5);})
				.attr("y", function(d){return margin.top+tileHeight*Math.floor(d.index/rows);})
				.style("fill", function(d){return colorScale(d.size);})
				.style("stroke", borderColor)
				.style("stroke-opacity", 1);

		d3.select(this.parentNode).select("text")
			.transition()
				.duration(popSpeed)
				.attr("font-size", minFontSize);
	}

	function handleMouseClick(d) {
		console.log(d.name);
	}

	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};

	d3.selection.prototype.moveToBack = function() {
		return this.each(function() {
			var firstChild = this.parentNode.firstChild;
			if (firstChild) {
				this.parentNode.insertBefore(this, firstChild);
			}
	});
	};
}

function drawTimeSeries(name) {
	d3.selectAll("#eventdrops-demo > svg").remove();
	if (name) {
		timeSeriesConfig.line.color = (row) => { return row.name == name ? '#8a2be2' : '#ff4c4c'};
	}
	if (Array.isArray(timeSeriesScale)) {
		timeSeriesConfig.range.start = timeSeriesScale[0];
		timeSeriesConfig.range.end = timeSeriesScale[1];
	}
	timeSeriesChart = eventDrops(timeSeriesConfig);
	timeSeriesSvg = d3
	.select('#eventdrops-demo')
	.data([fullData])
	.call(timeSeriesChart);
}
