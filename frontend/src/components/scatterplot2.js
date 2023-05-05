import React, {useRef, useContext, useEffect} from "react";
import * as d3 from "d3";
import { AppContext } from '../AppContext';
import { quadtree } from 'd3-quadtree' // v^2.0.0
import  Explain  from "./explanation";

//datum:
//0: x
//1: y
//2: label

var isinsidelasso = []

function trackPointer(e, { start, move, out, end }) {
    const tracker = {},
      id = (tracker.id = e.pointerId),
      target = e.target;
    tracker.point = d3.pointer(e, target);
    target.setPointerCapture(id);
  
    d3.select(target)
      .on(`pointerup.${id} pointercancel.${id} lostpointercapture.${id}`, (e) => {
        if (e.pointerId !== id) return;
        tracker.sourceEvent = e;
        d3.select(target).on(`.${id}`, null);
        target.releasePointerCapture(id);
        end && end(tracker);
      })
      .on(`pointermove.${id}`, (e) => {
        if (e.pointerId !== id) return;
        tracker.sourceEvent = e;
        tracker.prev = tracker.point;
        tracker.point = d3.pointer(e, target);
        move && move(tracker);
      })
      .on(`pointerout.${id}`, (e) => {
        if (e.pointerId !== id) return;
        tracker.sourceEvent = e;
        tracker.point = null;
        out && out(tracker);
      });
  
    start && start(tracker);
  }


function LassoSelectionCanvas(data) {
    const appcontext = useContext(AppContext);



    function lasso() {
        const dispatch = d3.dispatch("start", "lasso", "end");
        const lasso = function(selection) {
          const node = selection.node();
          const polygon = [];
          
      
          selection
            .on("touchmove", e => e.preventDefault()) // prevent scrolling
            .on("pointerdown", e => {
              trackPointer(e, {
                start: p => {
                  polygon.length = 0;
                  dispatch.call("start", node, polygon);
                  
                  
                  
                  
                },
                move: p => {
                  polygon.push(p.point);
                  dispatch.call("lasso", node, polygon);
                },
                end: p => {
                  dispatch.call("end", node, polygon);
                  const canvas = document.querySelector('canvas');

                  console.log(canvas.value)

                  
                  
                  if (canvas.value['polygon'].length>1){
                    appcontext.setLassoed(canvas.value['selected']);
                    appcontext.setGetexplain(true); 
                    appcontext.setIsinsidelasso(isinsidelasso)};
                    appcontext.setPrevselected(canvas.value['selected'])
                  
                  

                }
              });
            });
        };
        lasso.on = function(type, _) {
          return _ ? (dispatch.on(...arguments), lasso) : dispatch.on(...arguments);
        };
      
        return lasso;
      }
    

    
    let prev_scatter = document.getElementById('scatterplot')
    let prev_tooltip = document.getElementById('tooltip')
    if (prev_tooltip !=null){
        prev_tooltip.remove()
    }

    if (prev_scatter !=null){
    prev_scatter.remove()    
}
        
    
    data = data.data

    const leftpanelwidth = 300
    const navbarheight = 100
    const pad = 50

    let scatterplotwidth = window.innerWidth-leftpanelwidth -pad;
    let scatterplotheight = window.innerHeight-navbarheight -pad;


function maketooltip(data, width, height){

  //console.log(document.getElementById('scatterplot'),  document.getElementById('tooltip'))

  var canvas = document.createElement('canvas');

  canvas.setAttribute('className','lyr1')
  canvas.setAttribute('id','tooltip')
  canvas.style.position = 'absolute';
  canvas.style.overflow = "visible"
  
  canvas.style.x = 10;
  canvas.style.y = 10;
  const context = canvas.getContext("2d");


  context.canvas.width  = width;
  context.canvas.height = height;
  document.body.appendChild(canvas);



  const quadtreeInstance =  quadtree()//here 500 is the width and height of the canvas or the max x/y range of the points in scatter chart.
  .x(function(d) {return +d[0]})
  .y(function(d) {return +d[1]}).addAll(data)
 
  d3.select("#tooltip").on("mousemove", function(event){
      
      //find in the vicinity of 10 pixel around the click.
      const newHoverPoint = quadtreeInstance.find(event.pageX,  event.pageY-navbarheight+20, 10)


      const canvas2 = document.getElementById('tooltip');
      
      const ctx = canvas2.getContext('2d');
      ctx.clearRect(0, 0, canvas2.width, canvas2.height);


      

      //ctx.beginPath();
      //ctx.arc(event.pageX,  event.pageY-100, 10, 0, 2 * Math.PI);
      //ctx.stroke();

 
      ctx.font = "20px serif";
      try{
          let txt = newHoverPoint[2]
          var w = ctx.measureText(txt).width;


          // rectangle
          ctx.beginPath();
          ctx.lineWidth = "2";
          ctx.strokeStyle = "black";
          ctx.rect(event.pageX+10,  event.pageY-120, w+10, 30);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(newHoverPoint[0],  newHoverPoint[1], 5, 0, 2 * Math.PI);
          ctx.stroke()      
          ctx.fillStyle = 'green';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#003300';
          ctx.stroke();

          

          ctx.fillStyle = 'black';
          ctx.fillText(txt, event.pageX +12,  event.pageY-100, w+20);
      }catch(e){
          
       }
      

      

      //console.log(newHoverPoint);
    })



}



    let x = d3.scaleLinear().range([pad,scatterplotwidth]),
        y = d3.scaleLinear().range([pad,scatterplotheight]);

    
    

    var d_extent_x = d3.extent(data, (d) => +d[0]),
        d_extent_y = d3.extent(data, (d) => +d[1]);

    // Draw axes
    x.domain(d_extent_x);
    y.domain(d_extent_y);
    //console.log(x,y)


    appcontext.xscale = x
    appcontext.yscale = y
    

    data = data.map((d) => [x(+d[0]), y(+d[1]),d[2]]);





  var canvas = document.createElement('canvas');
  
  canvas.setAttribute('className','lyr0')
  canvas.setAttribute('id','scatterplot')
  canvas.style.position = 'absolute';
  canvas.style.x = 10;
  canvas.style.y = 10;
  const context = canvas.getContext("2d");
  

  context.canvas.width  = scatterplotwidth+pad;
  context.canvas.height = scatterplotheight+pad;
  
  document.body.appendChild(canvas);


  const path = d3.geoPath().context(context);

  function draw(polygon) {
    
    
    context.clearRect(0, 0, scatterplotwidth, scatterplotheight);

    context.beginPath();
    path({
      type: "LineString",
      coordinates: polygon
    });
    context.fillStyle = "rgba(0,0,0,.1)";
    context.fill("evenodd");
    context.lineWidth = 1.5;
    context.stroke();

    const selected = [];

    isinsidelasso = []
    appcontext.setGetexplain(false)
    for (const d of data) {
      const contains =
        polygon.length > 2 &&
        d3.polygonContains(polygon, d) &&
        selected.push(d) &&
        isinsidelasso.push([d[2], 1])||isinsidelasso.push([d[2], 0])
    }
    

    context.beginPath();
    path.pointRadius(2)({ type: "MultiPoint", coordinates: data });
    context.fillStyle = "#000";
    context.globalAlpha = 0.7
    context.fill();

    context.beginPath();
    path.pointRadius(2)({ type: "MultiPoint", coordinates: appcontext.prevselected });
    context.fillStyle = "steelblue";
    context.globalAlpha = 0.7
    context.fill();

    if (polygon.length > 2) {
      context.beginPath();
      path.pointRadius(3.5)({ type: "MultiPoint", coordinates: selected });
      context.fillStyle = "steelblue";
      context.globalAlpha = 1
      context.fill();
      
    }
    //console.log(selected)

    context.canvas.value = { polygon, selected };
    context.canvas.dispatchEvent(new CustomEvent('input'));
    var ctx = context.canvas.getContext('2d');
    var found = [];
    var color = 'black';




      
      //context = d3.select("canvas").node().getContext("2d");
     
     
    
  }

  const defaultLasso = [
    [366, 143],
    [351, 135],
    [337, 132],
    [318, 130],
    [294, 129],
    [268, 132],
    [247, 141],
    [227, 159],
    [209, 184],
    [197, 214],
    [192, 248],
    [192, 281],
    [201, 310],
    [219, 331],
    [263, 343],
    [315, 339],
    [370, 321],
    [393, 298]
  ]
  draw([[0,0]]);
  maketooltip(data, scatterplotwidth, scatterplotheight)

  var cElements = document.getElementsByTagName('canvas');

  //console.log(cElements)

  const canvas2 = document.getElementById('tooltip');
        
 const ctx = canvas2.getContext('2d');
  d3.select(ctx.canvas)
    .call(lasso().on("start lasso end", draw))



return (
    <>
    
    </>
  ); 
}



export default LassoSelectionCanvas;
