"use strict";!function(){function e(){for(var e=[],n=0,t=0;t<j.game.board.count-1;t++)e[t]=j.game.board.panels[t].picId;for(t=0;t<j.game.board.count-1;t++)-1!==e[t]&&(n+=a(e,t)-1);return n>=j.game.board.count-j.game.size&&n%2==0}function a(e,a){for(var n,t=1,o=e[a];e[a]>=0&&o!==a;)t++,n=o,o=e[o],e[n]=-1;return t}function n(){j.initGame(0),c(w);var e=[12,0,2,14,12,8,11,3,2,14],a=j.game.board.slidePanel.bind(j.game.board);e.concat(15).forEach(a);var n=function(t){if(0===e.length)return t();a(e.pop()),setTimeout(n.bind(null,t),100)};w.attr("data-state",""),D["start.png"].removeClass("show"),G.changePage("title",function(){e.unshift(15),n(function(){h(w,function(){D["start.png"].addClass("show")})})})}function t(){j.loadUserData(function(){$(".stage-panel").each(function(e){var a=$(this),n=j.getLastStage(),t=e+1;e<=n?(a.addClass("selectable"),e<n?a.css("backgroundImage",'url("image/cat-'+t+'.jpg")'):a.css("backgroundImage",'url("image/stage-next.png")')):(a.removeClass("selectable"),a.css("backgroundImage",'url("image/stage-unknown.png")'))}),G.changePage("select")})}function o(e){j.initGame(e),c(P),l(),u(),P.attr("data-state",""),D["gameover.png"].removeClass("show").addClass("hide"),G.changePage("game",function(){G.shield.on(),G.serial([[1200,f],[2e3,m],[800,p],[500,function(){G.shield.off(),s()}]])})}function s(){j.game.timerId=setInterval(function(){0==--j.game.score.time&&g(),u()},1e3)}function i(){clearInterval(j.game.timerId),G.shield.on()}function r(){i();var e=j.game.score.time*k-j.game.score.move*T;e<0&&(e=0),j.getLastStage<j.game.stage&&(j.getLastStage=j.game.stage),j.saveUserData(j.getLastStage,e,function(){h(P,function(){v(function(){b(function(){I.shield.one(U,t)})})})})}function g(){i(),C(P,function(){I.shield.one(U,t)})}function c(e){e.empty(),j.game.board.panels=[];for(var a=0;a<j.game.board.count;a++){var n=G.idx2pos(a);j.game.board.panels.push({picId:a,$elem:$("<div/>").addClass("panel").addClass("panel-size"+j.game.size).css("background-image",'url("image/cat-'+j.game.stage+'.jpg")').css("background-position",G.px(-n.x)+" "+G.px(-n.y)).css("left",n.x).css("top",n.y).data("picId",a).appendTo(e)})}}function l(){j.game.board.shuffle()}function d(){for(var e=$(this).data("picId"),a=-1,n=0;n<j.game.board.count;n++)if(j.game.board.panels[n].picId===e){a=n;break}var t=j.game.board.slidePanel(a);t>0&&(j.game.score.move++,u(),2===t&&r())}function u(){z.stage.text(j.game.stage),z.score.text(j.game.score.score),z.time.text(j.game.score.time),z.move.text(j.game.score.move)}function m(e){for(var a=0;a<j.game.board.count;a++)j.game.board.movePanel(a);e()}function f(e){e(),G.log("ready:hide"),D["ready.png"].removeClass("hide"),G.serial([[10,function(e){G.log("ready:show"),D["ready.png"].addClass("show"),e()}],[2e3,function(){G.log("ready:finish"),D["ready.png"].removeClass("show").addClass("hide")}]])}function p(e){e(),G.log("go:hide"),D["go.png"].removeClass("hide"),G.serial([[10,function(e){G.log("go:show"),D["go.png"].addClass("show"),e()}],[1e3,function(){G.log("go:finish"),D["go.png"].removeClass("show").addClass("hide")}]])}function h(e,a){G.serial([[10,function(a){e.attr("data-state","flush"),a()}],[500,function(a){e.attr("data-state","clear"),a()}],[500,a]])}function v(e){var a=["c","l","e","a","r"];G.serial(a.map(function(e){return[100,function(a){D["clear-"+e+".png"].addClass("show"),a()}]}).concat([[1500,function(e){a.forEach(function(e){D["clear-"+e+".png"].addClass("end")}),e()}],[1e3,function(){a.forEach(function(e){D["clear-"+e+".png"].removeClass("show").removeClass("end")}),e()}]]))}function b(e){var a=j.game.score,n=function(e){if(0===a.time)return e();a.time>=3?(a.time-=3,a.score+=3*k):(a.score+=k*a.time,a.time=0),u(),setTimeout(n.bind(null,e),30)},t=function(e){if(0===a.move)return e();a.move--,a.score-=T,a.score<0&&(a.score=0),u(),setTimeout(t.bind(null,e),30)};G.serial([[300,n],[900,t],[10,e]])}function C(e,a){G.serial([[1e3,function(a){G.log("grayscale"),e.attr("data-state","gameover"),a()}],[1200,function(e){G.log("gameover:ready"),D["gameover.png"].removeClass("hide"),e()}],[100,function(){G.log("gameover:show"),D["gameover.png"].addClass("show"),a()}]])}function x(){if(!E.loaded())return G.log("wait to load images..."),void setTimeout(x,100);y=$("#container").append(D["ready.png"].addClass("anim-ready").addClass("hide")).append(D["go.png"].addClass("anim-go").addClass("hide")),I={title:$("#page-title").append(D["start.png"].addClass("anim-start")),select:$("#page-select"),game:$("#page-game").append(D["gameover.png"].addClass("anim-gameover")),shield:$("#page-shield")},w=$("#title-board"),P=$("#game-board").on(U,".panel",d),z={stage:$("#game-stage"),score:$("#high-score"),time:$("#rest-time"),move:$("#move-count")},["c","l","e","a","r"].forEach(function(e,a){D["clear-"+e+".png"].addClass("anim-clear").css("left",18+115*a).appendTo(I.game)}),I.title.on(U,t);for(var e=1;e<=16;e++)$("<div/>").addClass("stage-panel").attr("data-stage",e).appendTo(I.select);I.select.on(U,".stage-panel.selectable",function(){o($(this).data("stage"))}),n(),j.getCurrentPage().fadeIn(500)}for(var y,I,w,P,z,S=[4,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6],k=270,T=90,D={},E=["start.png","stage-next.png","stage-unknown.png","ready.png","go.png","clear-c.png","clear-l.png","clear-e.png","clear-a.png","clear-r.png","gameover.png"],L=0;L<=16;L++)E.push("cat-"+L+".jpg");E.loadCount=0,E.loaded=function(){return this.loadCount===this.length};var U="mousedown touchstart",j=function(){var a="title",n={lastStage:0};return{game:{board:{panels:[],shuffle:function(){do{for(var a=this.count-1;--a>=0;){var n=Math.floor(Math.random()*(a+1));this.swapPanel(a,n)}}while(!e())},swapPanel:function(e,a){var n=this.panels[e];this.panels[e]=this.panels[a],this.panels[a]=n},movePanel:function(e){var a=G.idx2pos(e);this.panels[e].$elem.css("left",a.x).css("top",a.y)},sorted:function(){for(var e=0;e<this.count;e++)if(this.panels[e].picId!==e)return!1;return!0},slidePanel:function(e){var a=G.idx2pos(e),n=G.idx2pos(this.blankIndex);if(a.x!==n.x&&a.y!==n.y)return 0;var t;t=a.y===n.y?n.x<a.x?1:-1:(n.y<a.y?1:-1)*j.game.size;for(var o=this.blankIndex;o!=e;o+=t)this.swapPanel(o,o+t),this.movePanel(o);return this.movePanel(this.blankIndex=e),this.sorted()?2:1}}},getCurrentPage:function(){return $("#page-"+a)},setCurrentPage:function(e){return a=e,this.getCurrentPage()},getLastStage:function(){return n.lastStage},loadUserData:function(e){var a=localStorage.getItem("userData");a&&(n=JSON.parse(a)),e()},saveUserData:function(e,a,t){n.lastStage=e,n.highScore=a,localStorage.setItem("userData",JSON.stringify(n)),t()},initGame:function(e){this.game.stage=e,this.game.size=S[e],this.game.board.count=this.game.size*this.game.size,this.game.board.blankIndex=this.game.board.count-1,this.game.board.size=420/this.game.size,this.game.board.panels=[],this.game.score={score:0,time:30*this.game.board.count+10*e,move:0},this.game.timerId=null}}}(),G={idx2pos:function(e){return{x:parseInt(e%j.game.size)*j.game.board.size,y:parseInt(e/j.game.size)*j.game.board.size}},px:function(e){return 0===e?0:e+"px"},shield:{on:function(){I.shield.show()},off:function(){I.shield.hide()}},serial:function(e){var a=-1,n=function(){++a<e.length&&setTimeout(function(){e[a][1](n)},e[a][0])};n()},changePage:function(e,a){G.shield.on(),j.getCurrentPage().fadeOut(200,function(){j.setCurrentPage(e).fadeIn(200,function(){G.shield.off(),a&&a()})})},log:function(){console.info.apply(console,arguments)}};E.forEach(function(e){D[e]=$('<img src="image/'+e+'"/>').on("load",function(){E.loadCount++}).on("error",function(){E.loadCount++,console.warn("Can't load "+e)})}),$(x)}();