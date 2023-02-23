/**
* @author Marc Burchart
* @email marc.burchart@fernuni-hagen.de
* @description  
* @version 1.0.0
*/

define([
    'jquery',
    'core/ajax',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/moment-with-locales.min.js"    
],
    function($, ajax, Vue, moment){  
        
        require.config({
            enforceDefine: false,
            paths: {
                "d3": [M.cfg.wwwroot + "/course/format/ladtopics/lib/build/d3.v4.min"]
            },
            shim: {
                'dc': {
                    deps: ['d3']
                }
            }
        });
        
        $('#page-header').hide();
        $('#page-content').css('margin-top', "57px");

        return {
            init: function(courseid){
                require(
                    ['d3'],
                    function(d3){   
                        
                        const piechart = Vue.component('piechart',
                            {
                                props: ['chartData', 'color'],
                                mounted: function(){
                                    const svg = d3
                                            .select(`#${this.id}`)
                                            .append('svg')
                                            .style("width", "50%")                                           
                                            .style("font", "10px sans-serif")
                                            .style("box-sizing", "border-box");    
                                    if(typeof this.chartData !== "object" || this.chartData === null || this.chartData.length <= 0) return;                                        
                                    const _this = this;
                                    $(document).ready(
                                        function(){                                                                                      
                                            const elem = $(`#${_this.id}`).find('svg');   
                                            const width = elem.width();
                                            const height = width / 2;
                                            svg.style("height", `${height}px`);                                  
                                            const radius = Math.min(width, height) / 2;   
                                            svg.append("g").attr("transform", "translate(" + width + "," + height + ")");  
                                            var color = d3.scaleOrdinal().range(_this.color);
                                            var arc = d3.arc()
                                                        .outerRadius(radius - 10)
                                                        .innerRadius(0);                                                                                                            
                                            var labelArc = d3.arc()
                                                        .outerRadius(radius - 40)
                                                        .innerRadius(radius - 40);
                                            var pie = d3.pie()
                                                        .sort(null)
                                                        .value(
                                                            function(d) {                                                      
                                                                return d.value; 
                                                            }
                                                        );
                                            var g = svg.selectAll(".arc")
                                                        .data(pie(_this.chartData))
                                                        .enter().append("g")
                                                        .attr("class", "arc")
                                                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
                                            g.append("path")
                                                        .attr("d", arc)
                                                        .style("fill", function(d) {                                                           
                                                            return color(d.index); 
                                                        });
                                            g.append("text")
                                                        .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
                                                        .attr("dy", ".35em")
                                                        .text(function(d) {                                                            
                                                            return d.data.name+" ("+d.value+")"; 
                                                        });

                                        }
                                    );
                                },
                                data: function(){
                                    return {
                                        id: '_' + Math.random().toString(36).substr(2, 9)
                                    }
                                },
                                computed: {
                                    svgElement: function(){                                       
                                        return this.svg.node();
                                    }
                                },
                                template: '<div v-bind:id="id"></div>'
                            }                        
                        );

                        // Barchart Component
                        const barchart = Vue.component('barchart',
                            {
                                props: ['chartData', 'max'],
                                mounted: function(){
                                    const svg = d3
                                            .select(`#${this.id}`)
                                            .append('svg')
                                            .style("width", "50%")                                           
                                            .style("font", "10px sans-serif")
                                            .style("box-sizing", "border-box");                                    
                                    if(typeof this.chartData !== "object" || this.chartData === null || this.chartData.length <= 0) return;  
                                    const _this = this;
                                    $(document).ready(
                                        function(){                                           
                                            // Get Width
                                            const elem = $(`#${_this.id}`).find('svg');   
                                            const width = elem.width();
                                            const height = width / 2;
                                            svg.style("height", `${height}px`);
                                            const margin = 30;                                       
                                            const chartWidth = width - margin * 2;
                                            const chartHeight = height - margin * 2;   
                                            svg.append("g").attr("transform", "translate(" + margin + "," + margin + ")");    
                                            
                                            var x = d3.scaleBand()
                                                        .range([0, chartWidth])
                                                        .padding(0.1);

                                            var y = d3.scaleLinear()
                                                        .range([chartHeight, 0]);  

                                            var data = _this.chartData;                                            
                            

                                            data.sort(
                                                function(a, b){
                                                    return b.count - a.count;
                                                }
                                            );                                            

                                            x.domain(data.map(function(d) { return d.name; }));
                                            y.domain([0, d3.max(data, function(d) { return d.value; })]);

                                            svg.selectAll(".bar")
                                                .data(data)
                                                .enter()
                                                .append("rect")
                                                    .attr('fill', 'rgb(55, 58, 60)')
                                                    .attr("class", "bar")
                                                    .attr("x", function(d) { 
                                                            return x(d.name); 
                                                        }
                                                    )
                                                    .attr("width", x.bandwidth())
                                                    .attr("y", function(d) {                                                         
                                                        return y(d.value); }
                                                    )
                                                    .attr("height", function(d) { return chartHeight - y(d.value); })
                                                    .attr("transform", "translate(" + margin + "," + margin + ")");      

                                            svg.append("g")
                                                .attr("transform", "translate(" + margin + "," + (margin + chartHeight) + ")")    
                                                .call(d3.axisBottom(x));
                                              
                                                // add the y Axis
                                            svg.append("g")
                                                .attr("transform", "translate(" + margin + "," + margin + ")")   
                                                .call(d3.axisLeft(y));                                   
                                        }
                                    );  
                                },
                                data: function(){
                                    return {
                                        id: '_' + Math.random().toString(36).substr(2, 9)
                                    }
                                },
                                computed: {
                                    svgElement: function(){                                       
                                        return this.svg.node();
                                    }
                                },
                                template: '<div v-bind:id="id"></div>'
                            }
                        );

                        // Graphtree Component
                        const graphtree = Vue.component('graphtree',
                            {
                                props: ['chartData'],
                                mounted: function(){
                                    // create svg      
                                    
                                    const svg = d3
                                            .select(`#${this.id}`)
                                            .append('svg')
                                            .style("width", "100%")                                            
                                            .style("padding", "10px")
                                            .style("font", "10px sans-serif")
                                            .style("box-sizing", "border-box");

                                    if(typeof this.chartData !== "object" || this.chartData === null || this.chartData.length <= 0) return;  
                                    const _this = this;
                                    var data = this.chartData; 
                                    //data = JSON.parse('{"name":"flare","children":[{"name":"analytics","children":[{"name":"cluster","children":[{"name":"AgglomerativeCluster","size":3938},{"name":"CommunityStructure","size":3812},{"name":"HierarchicalCluster","size":6714},{"name":"MergeEdge","size":743}]},{"name":"graph","children":[{"name":"BetweennessCentrality","size":3534},{"name":"LinkDistance","size":5731},{"name":"MaxFlowMinCut","size":7840},{"name":"ShortestPaths","size":5914},{"name":"SpanningTree","size":3416}]},{"name":"optimization","children":[{"name":"AspectRatioBanker","size":7074}]}]},{"name":"animate","children":[{"name":"Easing","size":17010},{"name":"FunctionSequence","size":5842},{"name":"interpolate","children":[{"name":"ArrayInterpolator","size":1983},{"name":"ColorInterpolator","size":2047},{"name":"DateInterpolator","size":1375},{"name":"Interpolator","size":8746},{"name":"MatrixInterpolator","size":2202},{"name":"NumberInterpolator","size":1382},{"name":"ObjectInterpolator","size":1629},{"name":"PointInterpolator","size":1675},{"name":"RectangleInterpolator","size":2042}]},{"name":"ISchedulable","size":1041},{"name":"Parallel","size":5176},{"name":"Pause","size":449},{"name":"Scheduler","size":5593},{"name":"Sequence","size":5534},{"name":"Transition","size":9201},{"name":"Transitioner","size":19975},{"name":"TransitionEvent","size":1116},{"name":"Tween","size":6006}]},{"name":"data","children":[{"name":"converters","children":[{"name":"Converters","size":721},{"name":"DelimitedTextConverter","size":4294},{"name":"GraphMLConverter","size":9800},{"name":"IDataConverter","size":1314},{"name":"JSONConverter","size":2220}]},{"name":"DataField","size":1759},{"name":"DataSchema","size":2165},{"name":"DataSet","size":586},{"name":"DataSource","size":3331},{"name":"DataTable","size":772},{"name":"DataUtil","size":3322}]},{"name":"display","children":[{"name":"DirtySprite","size":8833},{"name":"LineSprite","size":1732},{"name":"RectSprite","size":3623},{"name":"TextSprite","size":10066}]},{"name":"flex","children":[{"name":"FlareVis","size":4116}]},{"name":"physics","children":[{"name":"DragForce","size":1082},{"name":"GravityForce","size":1336},{"name":"IForce","size":319},{"name":"NBodyForce","size":10498},{"name":"Particle","size":2822},{"name":"Simulation","size":9983},{"name":"Spring","size":2213},{"name":"SpringForce","size":1681}]},{"name":"query","children":[{"name":"AggregateExpression","size":1616},{"name":"And","size":1027},{"name":"Arithmetic","size":3891},{"name":"Average","size":891},{"name":"BinaryExpression","size":2893},{"name":"Comparison","size":5103},{"name":"CompositeExpression","size":3677},{"name":"Count","size":781},{"name":"DateUtil","size":4141},{"name":"Distinct","size":933},{"name":"Expression","size":5130},{"name":"ExpressionIterator","size":3617},{"name":"Fn","size":3240},{"name":"If","size":2732},{"name":"IsA","size":2039},{"name":"Literal","size":1214},{"name":"Match","size":3748},{"name":"Maximum","size":843},{"name":"methods","children":[{"name":"add","size":593},{"name":"and","size":330},{"name":"average","size":287},{"name":"count","size":277},{"name":"distinct","size":292},{"name":"div","size":595},{"name":"eq","size":594},{"name":"fn","size":460},{"name":"gt","size":603},{"name":"gte","size":625},{"name":"iff","size":748},{"name":"isa","size":461},{"name":"lt","size":597},{"name":"lte","size":619},{"name":"max","size":283},{"name":"min","size":283},{"name":"mod","size":591},{"name":"mul","size":603},{"name":"neq","size":599},{"name":"not","size":386},{"name":"or","size":323},{"name":"orderby","size":307},{"name":"range","size":772},{"name":"select","size":296},{"name":"stddev","size":363},{"name":"sub","size":600},{"name":"sum","size":280},{"name":"update","size":307},{"name":"variance","size":335},{"name":"where","size":299},{"name":"xor","size":354},{"name":"_","size":264}]},{"name":"Minimum","size":843},{"name":"Not","size":1554},{"name":"Or","size":970},{"name":"Query","size":13896},{"name":"Range","size":1594},{"name":"StringUtil","size":4130},{"name":"Sum","size":791},{"name":"Variable","size":1124},{"name":"Variance","size":1876},{"name":"Xor","size":1101}]},{"name":"scale","children":[{"name":"IScaleMap","size":2105},{"name":"LinearScale","size":1316},{"name":"LogScale","size":3151},{"name":"OrdinalScale","size":3770},{"name":"QuantileScale","size":2435},{"name":"QuantitativeScale","size":4839},{"name":"RootScale","size":1756},{"name":"Scale","size":4268},{"name":"ScaleType","size":1821},{"name":"TimeScale","size":5833}]},{"name":"util","children":[{"name":"Arrays","size":8258},{"name":"Colors","size":10001},{"name":"Dates","size":8217},{"name":"Displays","size":12555},{"name":"Filter","size":2324},{"name":"Geometry","size":10993},{"name":"heap","children":[{"name":"FibonacciHeap","size":9354},{"name":"HeapNode","size":1233}]},{"name":"IEvaluable","size":335},{"name":"IPredicate","size":383},{"name":"IValueProxy","size":874},{"name":"math","children":[{"name":"DenseMatrix","size":3165},{"name":"IMatrix","size":2815},{"name":"SparseMatrix","size":3366}]},{"name":"Maths","size":17705},{"name":"Orientation","size":1486},{"name":"palette","children":[{"name":"ColorPalette","size":6367},{"name":"Palette","size":1229},{"name":"ShapePalette","size":2059},{"name":"SizePalette","size":2291}]},{"name":"Property","size":5559},{"name":"Shapes","size":19118},{"name":"Sort","size":6887},{"name":"Stats","size":6557},{"name":"Strings","size":22026}]},{"name":"vis","children":[{"name":"axis","children":[{"name":"Axes","size":1302},{"name":"Axis","size":24593},{"name":"AxisGridLine","size":652},{"name":"AxisLabel","size":636},{"name":"CartesianAxes","size":6703}]},{"name":"controls","children":[{"name":"AnchorControl","size":2138},{"name":"ClickControl","size":3824},{"name":"Control","size":1353},{"name":"ControlList","size":4665},{"name":"DragControl","size":2649},{"name":"ExpandControl","size":2832},{"name":"HoverControl","size":4896},{"name":"IControl","size":763},{"name":"PanZoomControl","size":5222},{"name":"SelectionControl","size":7862},{"name":"TooltipControl","size":8435}]},{"name":"data","children":[{"name":"Data","size":20544},{"name":"DataList","size":19788},{"name":"DataSprite","size":10349},{"name":"EdgeSprite","size":3301},{"name":"NodeSprite","size":19382},{"name":"render","children":[{"name":"ArrowType","size":698},{"name":"EdgeRenderer","size":5569},{"name":"IRenderer","size":353},{"name":"ShapeRenderer","size":2247}]},{"name":"ScaleBinding","size":11275},{"name":"Tree","size":7147},{"name":"TreeBuilder","size":9930}]},{"name":"events","children":[{"name":"DataEvent","size":2313},{"name":"SelectionEvent","size":1880},{"name":"TooltipEvent","size":1701},{"name":"VisualizationEvent","size":1117}]},{"name":"legend","children":[{"name":"Legend","size":20859},{"name":"LegendItem","size":4614},{"name":"LegendRange","size":10530}]},{"name":"operator","children":[{"name":"distortion","children":[{"name":"BifocalDistortion","size":4461},{"name":"Distortion","size":6314},{"name":"FisheyeDistortion","size":3444}]},{"name":"encoder","children":[{"name":"ColorEncoder","size":3179},{"name":"Encoder","size":4060},{"name":"PropertyEncoder","size":4138},{"name":"ShapeEncoder","size":1690},{"name":"SizeEncoder","size":1830}]},{"name":"filter","children":[{"name":"FisheyeTreeFilter","size":5219},{"name":"GraphDistanceFilter","size":3165},{"name":"VisibilityFilter","size":3509}]},{"name":"IOperator","size":1286},{"name":"label","children":[{"name":"Labeler","size":9956},{"name":"RadialLabeler","size":3899},{"name":"StackedAreaLabeler","size":3202}]},{"name":"layout","children":[{"name":"AxisLayout","size":6725},{"name":"BundledEdgeRouter","size":3727},{"name":"CircleLayout","size":9317},{"name":"CirclePackingLayout","size":12003},{"name":"DendrogramLayout","size":4853},{"name":"ForceDirectedLayout","size":8411},{"name":"IcicleTreeLayout","size":4864},{"name":"IndentedTreeLayout","size":3174},{"name":"Layout","size":7881},{"name":"NodeLinkTreeLayout","size":12870},{"name":"PieLayout","size":2728},{"name":"RadialTreeLayout","size":12348},{"name":"RandomLayout","size":870},{"name":"StackedAreaLayout","size":9121},{"name":"TreeMapLayout","size":9191}]},{"name":"Operator","size":2490},{"name":"OperatorList","size":5248},{"name":"OperatorSequence","size":4190},{"name":"OperatorSwitch","size":2581},{"name":"SortOperator","size":2023}]},{"name":"Visualization","size":16540}]}]}');                                                                

                                    $(document).ready(
                                        function(){
                                            // Get Width
                                            const elem = $(`#${_this.id}`).find('svg');   
                                            width = elem.width();
                                            const height = width / 2;
                                            svg.style("height", `${height}px`);
                                            const margin = 50;                                       
                                            const treeWidth = width - margin * 2;
                                            const treeHeight = height - margin * 2;                                            
                                            // Begin char creation                                            
                                            const treemap = d3.tree().size([treeWidth, treeHeight]);                                                                                  
                                            let nodes = d3.hierarchy(data);                                           
                                            nodes = treemap(nodes);                                                                                  
                                            g = svg.append("g")
                                                .attr("transform",
                                                    "translate(" + margin + "," + margin + ")");
                                            var link = g.selectAll(".link")
                                                .data( nodes.descendants().slice(1))
                                                .enter().append("path")
                                                .attr("class", "link")
                                                .attr('fill', 'none')
                                                .attr('stroke', 'black')
                                                .attr("d", function(d) {
                                                return "M" + d.x + "," + d.y
                                                    + "C" + d.x + "," + (d.y + d.parent.y) / 2
                                                    + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
                                                    + " " + d.parent.x + "," + d.parent.y;
                                                });
                                            const divTooltipID = 'tooltip_' + Math.random().toString(36).substr(2, 9);
                                            let div = d3.select('body').append("div").attr('id', divTooltipID);
                                            $(`#${divTooltipID}`).css(
                                                {
                                                    backgroundColor: 'white',
                                                    display: 'none',
                                                    padding: '5px 10px',
                                                    opacity: 0.9
                                                }
                                            );
                                            var node = g.selectAll(".node")
                                                .data(nodes.descendants())
                                                .enter().append("g")
                                                .attr("class", function(d) { 
                                                    return "node" + 
                                                        (d.children ? " node--internal" : " node--leaf"); })
                                                .attr("transform", function(d) { 
                                                    return "translate(" + d.x + "," + d.y + ")"; });
                                            node.append("circle")
                                                .attr("r", 10)
                                                .attr('fill', 
                                                    function(d){
                                                        if(d.data.color) return d.data.color;
                                                        return 'black';
                                                    }
                                                )
                                                .attr('stroke-width', '2px')
                                                .on('mouseover', 
                                                    function(d){                                                        
                                                        const data = d.data;   
                                                        if(typeof data.tooltip === 'string'){
                                                            div.html(data.tooltip);
                                                            $(`#${divTooltipID}`).css(
                                                                {
                                                                    display: 'inline-block',
                                                                    position: 'absolute',
                                                                    left: `${d3.event.pageX+20}px`,
                                                                    top: `${d3.event.pageY}px`
                                                                }
                                                            );   
                                                        }                                                                                                                                                             	
                                                    }
                                                )
                                                .on('mouseout', 
                                                    function(d){
                                                        const data = d.data;
                                                        if(typeof data.tooltip === "string"){
                                                            $(`#${divTooltipID}`).css(
                                                                {
                                                                    display: 'none'
                                                                }
                                                            );
                                                        }                                                        
                                                    }
                                                );
                                            node.append("text")
                                                .attr("dy", ".35em")
                                                .attr("y", function(d) { return d.children ? -20 : 20; })
                                                .style("text-anchor", "middle")
                                                .text(function(d) { return d.data.name; });
                                          
                                            // End char creation
                                        }
                                    );
                                    
                                },                  
                                data: function(){
                                    return {
                                        id: '_' + Math.random().toString(36).substr(2, 9)
                                    }
                                },
                                computed: {
                                    svgElement: function(){                                       
                                        return this.svg.node();
                                    }
                                },
                                template: '<div v-bind:id="id"></div>'
                            }
                        );



                        // Main Component
                        return new Vue(
                            {
                                el: 'analytics-dashboard',
                                data: {
                                    courseid: +courseid,
                                    users: [],
                                    currentPage: 'user',
                                    currentUser: null,
                                    completeData: {}
                                },
                                components: {
                                    'graphtree': graphtree,
                                    'barchart': barchart,
                                    'piechart': piechart
                                },
                                mounted: function(){   
                                    const _this = this;
                                    this.getAPIData('analytics', {courseid: this.courseid}).then(
                                        function(resolve){
                                            const data = resolve;
                                            if(typeof data !== "object" || typeof data.data !== "string" && data.data.length <= 0) {
                                                console.warn("Could not fetch data.");
                                                return;
                                            }
                                            const dobj = JSON.parse(data.data);
                                            if (typeof dobj !== "object") { //  || typeof dobj.users !== "object")
                                                console.warn("Could not fetch data.");
                                                return;
                                            }
                                            _this.users = dobj;
                                            const users = dobj;
                                            var surveys = {};   
                                            // Milestones
                                            var milestoneStorage = {
                                                urgent: 0,                                            
                                                ready: 0,
                                                progress: 0,
                                                missed: 0,
                                                reflected: 0,
                                                sum: 0
                                            };   
                                            var initSurvey = {
                                                availTime: {},
                                                objectives: {},
                                                planingStyle: {}
                                            };        
                                            for(let i in users){
                                                const user = users[i];
                                                // LimeSurvey                                        
                                                if(typeof user.lime === "object"){
                                                    for(let l in user.lime){
                                                        const lime = user.lime[l];
                                                        if(typeof lime === "object"){
                                                            if(typeof surveys[lime.survey_id] !== "object"){
                                                                surveys[lime.survey_id] = {
                                                                    id: +lime.id,
                                                                    name: lime.name,
                                                                    survey_id: +lime.survey_id,
                                                                    count: 1
                                                                }
                                                            } else {
                                                                surveys[lime.survey_id]['count']++;
                                                            }
                                                        }
                                                    }                                            
                                                }   
                                                // Milestones                                                                        
                                                if(typeof user.milestones === 'object' && typeof user.milestones.elements === 'object'){
                                                    const milestones = user.milestones.elements;
                                                    for(let u in milestones){
                                                        const milestone = milestones[u];
                                                        switch(milestone.status){
                                                            case 'urgent':      milestoneStorage.urgent++;
                                                                                break;
                                                            case 'ready':       milestoneStorage.ready++;
                                                                                break;
                                                            case 'progress':    milestoneStorage.progress++;
                                                                                break;
                                                            case 'missed':      milestoneStorage.missed++;
                                                                                break;
                                                            case 'reflected':   milestoneStorage.reflected++;
                                                                                break;
                                                        }
                                                        milestoneStorage.sum++;
                                                    }
                                                }
                                                // Survey
                                                if(typeof user.initialSurvey === "object"){
                                                    const surv = user.initialSurvey;
                                                    //initSurvey
                                                    if(typeof initSurvey.availTime[surv.availableTime] === "number"){
                                                        initSurvey.availTime[surv.availableTime]++;
                                                    } else {
                                                        initSurvey.availTime[surv.availableTime] = 1;
                                                    }        
                                                    if(typeof initSurvey.objectives[surv.objectives] === "number"){
                                                        initSurvey.objectives[surv.objectives]++;
                                                    } else {
                                                        initSurvey.objectives[surv.objectives] = 1;
                                                    }
                                                    if(typeof initSurvey.planingStyle[surv.planingStyle] === "number"){
                                                        initSurvey.planingStyle[surv.planingStyle]++;
                                                    } else {
                                                        initSurvey.planingStyle[surv.planingStyle] = 1;
                                                    }                                       
                                                }                                    
                                            } 
                                            
                                            _this.completeData['survey'] = initSurvey;
                                            _this.completeData['milestones'] = milestoneStorage;
                                            _this.completeData['lime'] = surveys;   
                                            _this.completeData['users'] = users.length;
                                        },
                                        function(reject){

                                        }
                                    );
                                                                   
                                },
                                computed:{
                                    showHome: function(){                                        
                                        return this.currentPage === 'home';
                                    },
                                    showUser: function()
                                    {
                                        return this.currentPage === 'user';
                                    }
                                },
                                methods: {
                                    getAPIData: function(method, param = {}){
                                        return new Promise(
                                            function(resolve, reject){
                                                ajax.call([{
                                                    methodname: 'format_ladtopics_'+method,
                                                    args: param,
                                                    timeout: 3000,
                                                    done: function(data){                                                                
                                                        return resolve(data);
                                                    },
                                                    fail: function(error){                                                                
                                                        return reject(error);
                                                    }                  
                                                }]);                                
                                            }
                                        );
                                    },
                                    getPlaningStyleData: function(){
                                        let arr = [];
                                        if(typeof this.completeData['survey']['planingStyle']['planing-style-a'] === "number"){
                                            let elem = {
                                                name: 'Nur für eine Woche.',
                                                value: this.completeData['survey']['planingStyle']['planing-style-a']
                                            };
                                            arr.push(elem);
                                        } else {
                                            let elem = {
                                                name: 'Nur für eine Woche.',
                                                value: 0
                                            };
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey']['planingStyle']['planing-style-b'] === "number"){
                                            let elem = {
                                                name: 'Für die nächsten 4 Wochen.',
                                                value: this.completeData['survey']['planingStyle']['planing-style-b']
                                            };
                                            arr.push(elem);
                                        } else {
                                            let elem = {
                                                name: 'Für die nächsten 4 Wochen.',
                                                value: 0
                                            };
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey']['planingStyle']['planing-style-c'] === "number"){
                                            let elem = {
                                                name: 'Für das ganze Semester mit Arbeitspaketen für je eine Woche.',
                                                value: this.completeData['survey']['planingStyle']['planing-style-c']
                                            };
                                            arr.push(elem);
                                        } else {
                                            let elem = {
                                                name: 'Für das ganze Semester mit Arbeitspaketen für je eine Woche.',
                                                value: 0
                                            };
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey']['planingStyle']['planing-style-d'] === "number"){
                                            let elem = {
                                                name: 'Für das ganze Semester mit Arbeitspaketen für je 2 Wochen.',
                                                value: this.completeData['survey']['planingStyle']['planing-style-d']
                                            };
                                            arr.push(elem);
                                        } else {
                                            let elem = {
                                                name: 'Für das ganze Semester mit Arbeitspaketen für je 2 Wochen.',
                                                value: 0
                                            };
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey']['planingStyle']['planing-style-e'] === "number"){
                                            let elem = {
                                                name: 'Für das ganze Semester mit Arbeitspaketen für je einen Monat.',
                                                value: this.completeData['survey']['planingStyle']['planing-style-e']
                                            };
                                            arr.push(elem);
                                        } else {
                                            let elem = {
                                                name: 'Für das ganze Semester mit Arbeitspaketen für je einen Monat.',
                                                value: 0
                                            };
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey']['planingStyle']['planing-style-f'] === "number"){
                                            let elem = {
                                                name: 'Keine Angaben',
                                                value: this.completeData['survey']['planingStyle']['planing-style-f']
                                            };
                                            arr.push(elem);
                                        } else {
                                            let elem = {
                                                name: 'Keine Angaben',
                                                value: 0
                                            };
                                            arr.push(elem);
                                        }
                                        return arr;
                                    },
                                    getTimePieData: function(){
                                        let arr = [];
                                        if(typeof this.completeData['survey'].availTime === "object"){
                                            for(let i in this.completeData['survey'].availTime){
                                                const elem = {
                                                    name: i,
                                                    value: this.completeData['survey']['availTime'][i]
                                                }
                                                arr.push(elem);
                                            }
                                        }
                                        return arr;
                                    },
                                    getPlanPieData: function(){
                                        let arr = [];
                                        if(typeof this.completeData['survey'].objectives.f1a === "number"){
                                            const elem = {
                                                name: "Prüfung",
                                                value: this.completeData['survey'].objectives.f1a
                                            }
                                            arr.push(elem);
                                        } else {
                                            const elem = {
                                                name: "Prüfung",
                                                value: 0
                                            }
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey'].objectives.f1b === "number"){
                                            const elem = {
                                                name: "Orientierung",
                                                value: this.completeData['survey'].objectives.f1b
                                            }
                                            arr.push(elem);
                                        } else {
                                            const elem = {
                                                name: "Orientierung",
                                                value: 0
                                            }
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey'].objectives.f1c === "number"){
                                            const elem = {
                                                name: "Interesse",
                                                value: this.completeData['survey'].objectives.f1c
                                            }
                                            arr.push(elem);
                                        } else {
                                            const elem = {
                                                name: "Interesse",
                                                value: 0
                                            }
                                            arr.push(elem);
                                        }
                                        if(typeof this.completeData['survey'].objectives.f1d === "number"){
                                            const elem = {
                                                name: "Keine Angabe",
                                                value: this.completeData['survey'].objectives.f1d
                                            }
                                            arr.push(elem);
                                        } else {
                                            const elem = {
                                                name: "Keine Angabe",
                                                value: 0
                                            }
                                            arr.push(elem);
                                        }
                                        return arr;
                                    },
                                    getMileStonePieData: function(){
                                        let arr = [];                                        
                                        if(typeof this.completeData['milestones'].urgent === "number"){
                                            arr.push({
                                                name: "Dringlich",
                                                value: this.completeData['milestones'].urgent
                                            });
                                        }
                                        if(typeof this.completeData['milestones'].missed === "number"){
                                            arr.push({
                                                name: "Abgelaufen",
                                                value: this.completeData['milestones'].missed
                                            });
                                        }                                       
                                        if(typeof this.completeData['milestones'].progress === "number" && typeof this.completeData['milestones'].ready === "number"){
                                            arr.push({
                                                name: "Bereit",
                                                value: this.completeData['milestones'].progress + this.completeData['milestones'].ready
                                            });
                                        }
                                        if(typeof this.completeData['milestones'].reflected === "number"){
                                            arr.push({
                                                name: "Reflektiert",
                                                value: this.completeData['milestones'].reflected
                                            });
                                        }
                                        return arr;
                                    },
                                    getLimeSurveyData: function(){
                                        let arr = [];
                                        if(typeof this.completeData['lime'] === "object"){
                                            for(let i in this.completeData['lime']){
                                                const obj = {
                                                    name: this.completeData['lime'][i].name,
                                                    value: +this.completeData['lime'][i].count
                                                }
                                                arr.push(obj);
                                            }                                           
                                        } 
                                        return arr;
                                    },
                                    setCurrentPage: function(page){
                                        this.currentPage = page;
                                    },
                                    setUser: function(user){
                                        this.currentUser = user;
                                    },
                                    convertUnix: function(unix){
                                       return  moment.unix(unix).format('DD.MM.YYYY HH:mm');
                                    },
                                    convertMoment: function(date){
                                        return moment(date).format('DD.MM.YYYY');
                                    },
                                    cleanTitle: function(title){
                                        title = (title+'').toLowerCase();
                                        title = (title + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
                                            return $1.toUpperCase();
                                        });
                                        return title;
                                    },
                                    getMSStatus: function(status){
                                        switch(status){
                                            case 'urgent': return 'dringlich';
                                            case 'ready': return 'bereit';
                                            case 'missed': return 'abgelaufen';
                                            case 'reflected': return 'reflektiert';
                                        }
                                    },
                                    translatePlaningStyle: function(planingStyle){                                        
                                        switch(planingStyle){                                           
                                            case 'planing-style-a': return 'Nur für eine Woche.';                                                                    
                                            case 'planing-style-b': return 'Für die nächsten 4 Wochen.';                                                                   
                                            case 'planing-style-c': return 'Für das ganze Semester mit Arbeitspaketen für je eine Woche.';
                                            case 'planing-style-d': return 'Für das ganze Semester mit Arbeitspaketen für je 2 Wochen.';
                                            case 'planing-style-e': return 'Für das ganze Semester mit Arbeitspaketen für je einen Monat.';
                                            case 'planing-style-f': return 'Keine Angaben';
                                            default:                return 'Unbekannt';
                                        }
                                    },
                                    translateGoal: function(goal){
                                        switch(goal){
                                            case 'f1a': return 'Die Prüfung erfolgreich absolvieren.';
                                            case 'f1b': return 'Orientierung im Themengebiet erlangen.';
                                            case 'f1c': return 'Meinen eigenen Interessen bzgl. bestimmter Themengebiete nachgehen.';
                                            case 'f1d': return 'Keine Angaben';
                                            default: return 'Unbekannt';
                                        }
                                    },
                                    createMSTreeData(){
                                        if(typeof this.currentUser !== "object" || typeof this.currentUser.milestones !== 'object' || typeof this.currentUser.milestones.elements !== "object" || this.currentUser.milestones.elements.length < 1) return null;
                                        if(typeof +this.currentUser.milestones.modified !== 'number') return null;
                                        const unix = +this.currentUser.milestones.modified;                                        
                                        const time = moment.unix(unix).format('DD.MM.YYYY');
                                        const title = `${time}`;
                                        const elements = this.currentUser.milestones.elements;                                        

                                        const urgent = {
                                            name: 'dringlich',
                                            children: [],
                                            type: 'status',
                                            color: '#FDF7C2',
                                            tooltip: 0
                                        }
                                        const ready = {
                                            name: 'bereit',
                                            children: [],
                                            type: 'status',
                                            color: '#70A1D7',
                                            tooltip: 0
                                        }
                                        const missed = {
                                            name: 'abgelaufen',
                                            children: [],
                                            type: 'status',
                                            color: '#FF6961',
                                            tooltip: 0
                                        }
                                        const reflected = {
                                            name: 'reflektiert',
                                            children: [],
                                            type: 'status',
                                            color: '#A1DE93',
                                            tooltip: 0
                                        }                                         

                                        for(let i in elements){
                                            const elem = elements[i];                                     
                                            let resDom = [];
                                            let res = '<ul style="list-style-type: none; padding-left: 0px;">';
                                            for(let u in elem.resources){
                                                const r = elem.resources[u];
                                                res += `<li>${r.instance_title} [<i>${this.cleanTitle(r.instance_type)}</i>]</li>`;
                                                resDom.push({
                                                    name: r.instance_title,
                                                    color: '#957DAD',
                                                    type: 'ressource',
                                                    tooltip: `${this.cleanTitle(r.instance_title)} [<i>${this.cleanTitle(r.instance_type)}</i>]`
                                                });
                                            }   
                                            res += '</ul>';                            
                                            const result = {
                                                name: elem.name,                                                                                             
                                                tooltip: `
                                                    <table>
                                                        <tr>
                                                            <td>Titel:</td>
                                                            <td>${elem.name}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Lernziel:</td>
                                                            <td>${elem.objective}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Beginn:</td>
                                                            <td>${this.convertMoment(elem.start)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Termin:</td>
                                                            <td>${this.convertMoment(elem.end)}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="vertical-align: top;">Ressourcen:&nbsp;&nbsp;</td>
                                                            <td>${res}</td>
                                                        </tr>
                                                    </table>
                                                `,
                                                children: resDom,
                                                color: '#84CED2'                                                                              
                                            }
                                            switch(elem.status){
                                                case 'urgent':      urgent.children.push(result);
                                                                    urgent.tooltip++;
                                                                    break;
                                                case 'missed':      missed.children.push(result);
                                                                    missed.tooltip++;
                                                                    break;
                                                case 'reflected':   reflected.children.push(result);
                                                                    reflected.count++;
                                                                    break;
                                                case 'progress':    ready.children.push(result);
                                                                    ready.tooltip++;
                                                                    break;
                                                case 'ready':       ready.children.push(result);
                                                                    ready.tooltip++;
                                                                    break;
                                            }
                                        }

                                        const childs = [];
                                        childs.push(ready);
                                        childs.push(urgent);
                                        childs.push(missed);
                                        childs.push(reflected);

                                        ready.tooltip = ready.tooltip+' Meilenstein(e)';
                                        urgent.tooltip = urgent.tooltip+' Meilenstein(e)';
                                        missed.tooltip = missed.tooltip+' Meilenstein(e)';
                                        reflected.tooltip = reflected.tooltip+' Meilenstein(e)';

                                        return {
                                            name: title,
                                            children: childs,
                                            type: 'root',
                                            tooltip: `${elements.length} Meilenstein(e)`
                                        }                                  
                                    }                                  
                                },
                                template: `
                                <div>
                                    <nav class="navbar navbar-expand-lg navbar-light bg-primary">
                                        <a class="navbar-brand" href="#"><span class="text-white">LADTopics Analytics Dashboard</span></a>
                                        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                                            <span class="navbar-toggler-icon"></span>
                                        </button>
                                        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                                            <div class="navbar-nav">
                                                <a class="nav-item nav-link active" v-on:click="setCurrentPage('home')" href="#"><span class="text-white">Gesamtübersicht</span></a>
                                                <a hidden class="nav-item nav-link" v-on:click="setCurrentPage('user')" href="#"><span class="text-white">Einzelansicht</span></a>
                                                <!-- <a class="nav-item nav-link" href="#"><span class="text-white">Self-Assessment</span></a> -->
                                            </div>
                                        </div>                  
                                    </nav>
                                    <!-- Home Dashboard -->
                                    <div class="my-2 px-1 bg-secondary" v-if="showHome">
                                        <div class="px-2 pt-2">
                                            <h4><b>Eingangsbefragung</b></h4>
                                            <div><b>Verfolgte Ziele</b></div>
                                            <piechart v-bind:chartData="getPlanPieData()" v-bind:color="['#FDF7C2', '#FF6961', '#70A1D7', '#A1DE93']"></piechart>
                                            <table class="table table-responsive">
                                                <tr>
                                                    <td>Prüfung</td>
                                                    <td>Orientierung</td>
                                                    <td>Interesse</td>
                                                    <td>Keine Angabe</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-center">{{ completeData['survey'].objectives.f1a ? completeData['survey'].objectives.f1a : 0 }}</td>
                                                    <td class="text-center">{{ completeData['survey'].objectives.f1b ? completeData['survey'].objectives.f1b : 0 }}</td>
                                                    <td class="text-center">{{ completeData['survey'].objectives.f1c ? completeData['survey'].objectives.f1c : 0 }}</td>
                                                    <td class="text-center">{{ completeData['survey'].objectives.f1d ? completeData['survey'].objectives.f1d : 0 }}</td>
                                                </tr>
                                            </table>
                                            <div><b>Geplante Lernstunden pro Woche</b></div>
                                            <barchart v-bind:chartData="getTimePieData()" v-bind:max="completeData['users']"></barchart>
                                            <table class="table table-responsive">
                                                <tr>                                                   
                                                    <td v-for="(count, index) in completeData['survey'].availTime">{{index}} Stunde(n)</td>
                                                </tr>
                                                <tr>
                                                    <td v-for="(count, index) in completeData['survey'].availTime" class="text-center">{{count}}</td>
                                                </tr>
                                            </table>
                                            <div><b>Zeitraum der Lernaktivitätsplanung</b></div>
                                            <piechart v-bind:chartData="getPlaningStyleData()" v-bind:color="['#8DA290', '#DEE2D9', '#FCF1D8', '#F2CBBB', '#EAEBFF', '#D3EEFF']"></piechart>
                                            <table class="table table-responsive">
                                                <tr>
                                                    <td>Nur für eine Woche.</td>                                                                    
                                                    <td>Für die nächsten 4 Wochen.</td>                                                               
                                                    <td>Für das ganze Semester mit Arbeitspaketen für je eine Woche.</td>
                                                    <td>Für das ganze Semester mit Arbeitspaketen für je 2 Wochen.</td>
                                                    <td>Für das ganze Semester mit Arbeitspaketen für je einen Monat.</td>
                                                    <td>Keine Angaben</td>    
                                                </tr>
                                                <tr>
                                                    <td class="text-center">{{ completeData['survey']['planingStyle']['planing-style-a'] ? completeData['survey']['planingStyle']['planing-style-a'] : 0 }}</td>
                                                    <td class="text-center">{{ completeData['survey']['planingStyle']['planing-style-b'] ? completeData['survey']['planingStyle']['planing-style-b'] : 0 }}</td>
                                                    <td class="text-center">{{ completeData['survey']['planingStyle']['planing-style-c'] ? completeData['survey']['planingStyle']['planing-style-c'] : 0}}</td>
                                                    <td class="text-center">{{ completeData['survey']['planingStyle']['planing-style-d'] ? completeData['survey']['planingStyle']['planing-style-d'] : 0}}</td>
                                                    <td class="text-center">{{ completeData['survey']['planingStyle']['planing-style-e'] ? completeData['survey']['planingStyle']['planing-style-e'] : 0}}</td>
                                                    <td class="text-center">{{ completeData['survey']['planingStyle']['planing-style-f'] ? completeData['survey']['planingStyle']['planing-style-f'] : 0 }}</td>
                                                </tr>                                   
                                            </table>
                                            <h4><b>LimeSurvey Umfragen</b></h4>
                                            <barchart v-bind:chartData="getLimeSurveyData()" v-bind:max="completeData['users']"></barchart>
                                            <table class="table table-responsive">
                                                <tr>
                                                    <td>ID</td>
                                                    <td>Name</td>
                                                    <td>LS-ID</td>
                                                    <td>Einreichungen</td>
                                                </tr>                                                
                                                <tr v-for="surv in completeData['lime']" v-bind:id="surv.id">
                                                    <td class="text-center">{{ surv.id }}</td>
                                                    <td class="text-center">{{ surv.name }}</td>
                                                    <td class="text-center">{{ surv.survey_id }}</td>
                                                    <td class="text-center">{{ surv.count }}/{{ completeData['users'] }}</td>
                                                </tr>
                                            </table>
                                            <h4><b>Meilensteine</b></h4>
                                            <piechart v-bind:chartData="getMileStonePieData()" v-bind:color="['#FDF7C2', '#FF6961', '#70A1D7', '#A1DE93']"></piechart>
                                            <table class="table table-responsive">
                                                <tr>
                                                    <td>Dringlich</td>
                                                    <td>Bereit</td>
                                                    <td>Abgelaufen</td>
                                                    <td>Reflektiert</td>
                                                    <td>Gesamt</td>
                                                    <td>Durchschnitt pro Benutzer*in</td>
                                                </tr>
                                                <tr>
                                                    <td class="text-center">{{ completeData['milestones'].urgent }}</td>
                                                    <td class="text-center">{{ completeData['milestones'].ready + completeData['milestones'].progress }}</td>
                                                    <td class="text-center">{{ completeData['milestones'].missed }}</td>
                                                    <td class="text-center">{{ completeData['milestones'].reflected }}</td>
                                                    <td class="text-center">{{ completeData['milestones'].sum }}</td>
                                                    <td class="text-center">{{ completeData['milestones'].sum / completeData['users'] }}</td>
                                                </tr>
                                            </table>
                                        </div>
                                    </div>
                                    <!-- User Dashboard -->
                                    <div hidden class="py-2">
                                        <div class="container-fluid">
                                            <div class="row">
                                                <div id="userContent" class="col-8 bg-secondary">
                                                    <div v-if="currentUser !== null" class="px-4 py-3" >
                                                        <h2 style="margin-bottom: 0px;"><b>{{currentUser.firstname+" "+currentUser.lastname}}</b></h2>
                                                        <span><<i>{{currentUser.email}}</i>></span>
                                                        <table class="table table-responsive">
                                                            <tbody>
                                                                <tr>                                                            
                                                                    <td style="border-top-style: none;"><i class="fa fa-calendar-alt"></i> Erster Login {{ convertUnix(currentUser.firstaccess) }}</td>   
                                                                    <td style="border-top-style: none;"><i class="fa fa-clock"></i> Letzter Login {{ convertUnix(currentUser.lastaccess) }}</td>
                                                                    <td style="border-top-style: none;">
                                                                        <i class="fa fa-check text-danger" v-if="currentUser.suspended == true"></i>
                                                                        <i class="fa fa-times text-success" v-if="currentUser.suspended == false"></i>
                                                                        Suspendiert
                                                                    </td>
                                                                    <td style="border-top-style: none;">
                                                                        <i class="fa fa-check text-danger" v-if="currentUser.deleted == true"></i>
                                                                        <i class="fa fa-times text-success" v-if="currentUser.deleted == false"></i>
                                                                        Gelöscht
                                                                    </td>
                                                                </tr>                                                       
                                                            </tbody>
                                                        </table>
                                                        <h4><b>Semesterplanung</b></h4>
                                                        <table class="table table-responsive">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="border-top-style: none;">Verfolgtes Ziel</td>
                                                                    <td style="border-top-style: none;">{{ typeof currentUser === "object" && typeof currentUser.initialSurvey === "object" && currentUser.initialSurvey !== null ? translateGoal(currentUser.initialSurvey.objectives) : "-" }}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="border-top-style: none;">Geplante Lernstunden pro Woche</td>
                                                                    <td style="border-top-style: none;">{{ typeof currentUser === "object" && typeof currentUser.initialSurvey === "object" && currentUser.initialSurvey !== null ? currentUser.initialSurvey.availableTime : "-" }}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="border-top-style: none;">Zeitraum der Lernaktivitätsplanung&nbsp;&nbsp;</td>
                                                                    <td style="border-top-style: none;">{{ typeof currentUser === "object" && typeof currentUser.initialSurvey === "object" && currentUser.initialSurvey !== null ? translatePlaningStyle(currentUser.initialSurvey.planingStyle) : "-" }}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <h4><b>Abeschlossene Umfragen</b></h4>
                                                        <table class="table table-responsive">
                                                            <thead>
                                                                <tr>
                                                                    <td scope="col">#</td>
                                                                    <td scope="col">Umfrage</td>
                                                                    <td scope="col">Umfragen-ID</td>
                                                                    <td scope="col">Einreichungs-ID</td>
                                                                    <td scope="col">Einreichungsdatum</td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr v-for="surv in currentUser.lime" v-bind:key="surv.id" >
                                                                    <td>{{ surv.id }}</td>
                                                                    <td>{{ surv.name }}</td>
                                                                    <td>{{ surv.survey_id }}</td>
                                                                    <td>{{ surv.submission_id }}</td>
                                                                    <td>{{ convertUnix(surv.complete_date) }}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        <!-- graphtree -->
                                                        <h4><b>Meilensteine</b></h4>
                                                        <div class="pb-1">Es sind <b>{{ currentUser.milestones.elements.length }}</b> Meilensteine vorhanden.</div>
                                                        <graphtree v-bind:chartData="createMSTreeData()"></graphtree>                                                        
                                                        <!-- Milestone list -->
                                                        <h4>Liste aller Meilensteine</h4>
                                                        <div id="mstones" v-if="currentUser.milestones !== null">
                                                            <div class="card" v-for="milestone in currentUser.milestones.elements" v-bind:key="milestone.id">
                                                                <div class="card-header" v-bind:id="'heading-ms'+milestone.id">
                                                                    <h5 class="mb-0">
                                                                        <button class="btn btn-link collapsed" data-toggle="collapse" v-bind:data-target="'#collapse-ms'+milestone.id" aria-expanded="false" v-bind:aria-controls="'collapse-ms'+milestone.id">
                                                                            {{ milestone.name }}
                                                                        </button>
                                                                    </h5>
                                                                </div>
                                                                <div v-bind:id="'collapse-ms'+milestone.id" class="collapse" v-bind:aria-labelledby="'collapse-ms'+milestone.id" data-parent="#mstones">
                                                                    <div class="card-body">
                                                                        <table class="table table-responsive">
                                                                            <tbody>                                                                        
                                                                                <tr>
                                                                                    <td>Lernziel</td>
                                                                                    <td>{{ milestone.objective }}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Status</td>
                                                                                    <td>{{ getMSStatus(milestone.status) }}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Beginn</td>
                                                                                    <td>{{ convertMoment(milestone.start) }}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Termin</td>
                                                                                    <td>{{ convertMoment(milestone.end) }}</td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>Ressourcen</td>
                                                                                    <td>
                                                                                        <ul style="list-style-type:none; padding-left: 0px;">
                                                                                            <li v-for="ressource in milestone.resources">
                                                                                                <i class="fa fa-check text-success" v-if="ressource.checked === true"></i>
                                                                                                <i class="fa fa-times text-danger" v-if="ressource.checked !== true"></i>
                                                                                                {{ ressource.instance_title }}
                                                                                                [<i>{{ cleanTitle(ressource.instance_type) }}</i>] 
                                                                                            </li>
                                                                                        </ul>
                                                                                    </td>
                                                                                </tr>                                                                        
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-4 bg-secondary">
                                                    <div class="form-group py-2">
                                                        <!-- <label for="chooseUser">Benutzer*in</label> -->
                                                        <select multiple class="form-control" id="chooseUser" style="min-height:300px;">
                                                            <option v-for="user in users" v-bind:key="user.id" v-on:click="setUser(user)" >{{user.firstname+" "+user.lastname+" ("+user.username+")"}}</option>
                                                        </select>
                                                    </div>
                                                </div>                                       
                                            </div>
                                        </div>
                                    </div>  
                                </div>
                                `
                            }
                        );
                    }
                );                
            }
        }
    }
);