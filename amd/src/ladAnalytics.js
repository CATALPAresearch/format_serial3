/**
* @author Marc Burchart
* @email marc.burchart@fernuni-hagen.de
* @description  
* @version 1.0.0
*/

define([
    'jquery',
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/vue.min.js",
    M.cfg.wwwroot + "/course/format/ladtopics/lib/build/moment-with-locales.min.js"    
],
    function($, Vue, moment){  
        
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
            init: function(users){
                require(
                    ['d3'],
                    function(d3){   
                        
                        // Sunburst Component
                        const sunburst = Vue.component('sunburst',
                            {
                                props: ['chartData', 'color'],
                                mounted: function(){
                                    // create svg
                                    const svg = d3
                                        .select(`#${this.id}`)
                                        .append('svg')
                                        .attr('width', '100%')
                                        .style('font', '10px sans-serif');

                                    const _this = this;
                                    const data = this.chartData;                                  

                                    $(document).ready(
                                        function(){
                                            const elem = $(`#${_this.id}`).find('svg');   
                                            width = elem.width();    
                                           
                                            const group = svg.append('g')
                                                .attr("transform", `translate(100,100)`)
                                                .attr('fill', 'red');
                                            
                                            var line = d3.line()
                                                .x(
                                                    function(d){                                                        
                                                        return d.x;
                                                    })
                                                .y(
                                                    function(d){
                                                        return d.y;
                                                    }
                                                )
                                                .curve(d3.curveLinear);

                                            group
                                                .selectAll('path')
                                                .data([data])
                                                .enter()
                                                .append('path')
                                                .attr('d', line);

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
                                    users: users,
                                    currentPage: 'user',
                                    currentUser: null,
                                    sunData: [
                                        {x: 10, y:20},
                                        {x: 40, y:60},
                                        {x: 50, y:70}
                                    ]
                                },
                                components: {
                                    'sunburst': sunburst
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
                                    setCurrentPage: function(page){
                                        this.currentPage = page;
                                    },
                                    setUser: function(user){
                                        this.currentUser = user;
                                    },
                                    convertUnix: function(unix){
                                        let date = new Date(unix * 1000);
                                        let day = date.getDate();
                                        let month = date.getMonth();
                                        let year = date.getFullYear();
                                        let hours = date.getHours();
                                        let minutes = date.getMinutes();
                                        return `${day.toString().length !== 1 ? day : "0" + day}.${month.toString().length !== 1 ? month : "0" + month}.${year} ${hours.toString().length !== 1 ? hours : "0" + hours}:${minutes.toString().length !== 1 ? minutes : "0" + minutes}`;                         
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
                                                <a class="nav-item nav-link active" v-on:click="setCurrentPage('home')" href="#"><span class="text-white">Meilensteine</span></a>
                                                <a class="nav-item nav-link" v-on:click="setCurrentPage('user')" href="#"><span class="text-white">Benutzer</span></a>
                                                <a class="nav-item nav-link" href="#"><span class="text-white">xxx</span></a>
                                            </div>
                                        </div>                  
                                    </nav>
                                    <!-- Home Dashboard -->
                                    <div class="py-2 px-1" v-if="showHome">
                                        home
                                    </div>
                                    <!-- User Dashboard -->
                                    <div class="py-2" v-if="showUser">
                                        <div class="container-fluid">
                                            <div class="row">
                                                <div class="col-8 bg-secondary">
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
                                                        <!-- Sunburst -->
                                                        <h4>Meilensteine</h4>
                                                        <sunburst v-bind:chartData="sunData" color="my"></sunburst>
                                                        <!-- Milestone list -->
                                                        <h4>Eigene Meilensteine</h4>
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
                                                                                    <td>{{ convertMoment(milestone.start) }}</td>
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
                                                        <select multiple class="form-control" id="chooseUser">
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