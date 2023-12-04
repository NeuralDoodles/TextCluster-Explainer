import React, {useRef, useContext, useEffect} from "react";
import * as d3 from "d3";
import { AppContext } from '../AppContext';
import { quadtree } from 'd3-quadtree' // v^2.0.0
import Slider from "@mui/material/Slider";
import CircularProgress from '@mui/material/CircularProgress';



//datum:
//0: x
//1: y
//2: label


function drawPoint([cx,cy], r, ctx, color, alpha = 0.9, lineWidth = 0.0) {


  // NOTE; each point needs to be drawn as its own path
  // as every point needs its own stroke. you can get an insane
  // speed up if the path is closed after all the points have been drawn
  // and don't mind points not having a stroke
  ctx.beginPath();
  ctx.arc(cx, cy, r/1.5, 0, 2 * Math.PI);
  //context.closePath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "black";
  //ctx.stroke();
  ctx.fillStyle = color
  ctx.fill();
  ctx.globalAlpha = alpha
  //context.stroke();
}

function makeCanvas(id, class_name, w, h){
  var canvas = document.createElement('canvas');

  canvas.setAttribute('className',class_name)
  canvas.setAttribute('id',id)
  canvas.style.position = 'absolute';
  canvas.style.overflow = "visible"
  
  canvas.style.top = '20px'; 
  canvas.style.left = '280px';
  const context = canvas.getContext("2d");


  context.canvas.width  = w;
  context.canvas.height = h;
  document.body.appendChild(canvas);

  return canvas, context


}
var isinsidelasso = []
let isDragging = false
let isZooming = false

let dragStart = { x: 0, y: 0 }
let cameraOffset = { x: 0, y: 0 }
let MAX_ZOOM = 200
let MIN_ZOOM = 0.0005
let SCROLL_SENSITIVITY = 0.001
let DRAG_SENSITIVITY = 0.1
const leftpanelwidth = 300
const navbarheight = 100
const pad = 50

let scatterplotwidth = window.innerWidth-leftpanelwidth -pad-300;
let scatterplotheight = window.innerHeight-navbarheight -pad;

 makeCanvas('labels', 'lyr2', scatterplotwidth+300, scatterplotheight)

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

  // Gets the relevant location from a mouse or single touch event
  function getEventLocation(e) {
      if (e.touches && e.touches.length == 1)
      {
          return { x:e.touches[0].clientX, y: e.touches[0].clientY }
      }
      else if (e.clientX && e.clientY)
      {
          return { x: e.clientX, y: e.clientY }
      }
  }
  
  
  
  
  

function LassoSelectionCanvas(data) {
    const appcontext = useContext(AppContext);

    let cameraZoom = appcontext.zoomscale


    function adjustZoom(zoomAmount, zoomFactor) {
        if (!isDragging)
        {
            if (zoomAmount)
            {
                cameraZoom += zoomAmount
                appcontext.setZoomscale(cameraZoom)
            }
            else if (zoomFactor)
            {
                //console.log(zoomFactor)
                cameraZoom = zoomFactor*lastZoom
                appcontext.setZoomscale(cameraZoom)
            }
    
            cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
            cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
            appcontext.setZoomscale(cameraZoom)
    
            //w = w+(zoomAmount)*300
    
    
        }
    
    }  

    function lasso() {
        const dispatch = d3.dispatch("start", "lasso", "end");
        const lasso = function(selection) {
          const node = selection.node();
          const polygon = [];
          
      
          selection
            /*.on('wheel', e => {
              isZooming = true
              console.log("zoom")
              if (isZooming){
                adjustZoom(e.deltaY*SCROLL_SENSITIVITY)
              }}) */
            .on("touchmove", e => e.preventDefault()) // prevent scrolling
            .on("touchdown", e => e.preventDefault()) // prevent scrolling
            .on("touchmove", e => e.preventDefault()) // prevent scrolling
            .on("touchup", e => e.preventDefault()) // prevent scrolling
            /*.on("mousedown", e => {
              if (e.shiftKey){
                isDragging = true
                dragStart.x = getEventLocation(e).x - cameraOffset.x
                dragStart.y = getEventLocation(e).y- cameraOffset.y
                console.log(dragStart)
              }
            }) // prevent scrolling
            .on("mouseup", e => isDragging = false) // prevent scrolling
            .on("mousemove", e => {
              if (isDragging)
    
              {
                cameraOffset.x = (getEventLocation(e).x - dragStart.x)
                cameraOffset.y = (getEventLocation(e).y- dragStart.y)
                appcontext.setCameraOffset(cameraOffset)
                console.log(appcontext.cameraOffset,  dragStart)
              }
            })*/
            .on("pointerdown", e => {
              trackPointer(e, {
                start: p => {
                  polygon.length = 0;
                  isZooming = false
                  
                    isDragging = false
                    appcontext.setZoomselected(false)
                    dispatch.call("start", node, polygon);
                  
                  
                  
                },
                move: p => {
                  isZooming = false

                
                  polygon.push(p.point);
                  dispatch.call("lasso", node, polygon);
                
                },
                end: p => {
                  isZooming = false

                  
                    dispatch.call("end", node, polygon);
                    appcontext.prevlasso.push(polygon)
                    
                  

                  const canvas = document.getElementById('scatterplot');
                  
                  if (canvas.value['polygon'].length>1){
                    appcontext.setLassoed(canvas.value['selected']);
                    appcontext.setGetexplain(true); 
                    appcontext.setMakecloud(true)
                    appcontext.setIsinsidelasso(isinsidelasso)};
                    appcontext.prevselected.push(canvas.value['selected'])
                    appcontext.setLastselected(canvas.value['selected'])
                    
                  
                  

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




function maketooltip(data, width, height){

  //console.log(document.getElementById('scatterplot'),  document.getElementById('tooltip'))
 
  const canvas = document.getElementById('scatterplot');
  let transf_matrix = canvas.getContext('2d').getTransform();
  const transformedPoint = (point, matrix) => {
    let x =  matrix.a * point[0] + matrix.c * point[1] + matrix.e
    let y = matrix.b * point[1]+ matrix.d * point[1] + matrix.f

    point[0] = x
    point[1] = y
    return point
  };



let transformed_data = data.map(point=> transformedPoint(point, transf_matrix))

  const quadtreeInstance =  quadtree()//here 500 is the width and height of the canvas or the max x/y range of the points in scatter chart.
  .x(function(d) {return +d[0]})
  .y(function(d) {return +d[1]}).addAll(transformed_data)
 
  d3.select("#tooltip").on("mousemove", function(event){
      
      //find in the vicinity of 10 pixel around the click.
      const newHoverPoint = quadtreeInstance.find(event.pageX-280,  event.pageY -20, 10)

      


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

          let point = transformedPoint(newHoverPoint, transf_matrix)
          // rectangle
          ctx.beginPath();
          ctx.lineWidth = "2";
          ctx.strokeStyle = "black";
          ctx.rect(event.pageX+10-280,  event.pageY-20-20, w+10, 30);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(newHoverPoint[0], newHoverPoint[1], 10, 0, 2 * Math.PI);
          ctx.stroke()      
          ctx.fillStyle = 'green';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#003300';
          ctx.stroke();

          

          ctx.fillStyle = 'black';
          ctx.fillText(txt, event.pageX +12-280,  event.pageY-20, w+20);
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
    

    data = data.map((d) => [x(+d[0]), y(+d[1]),d[2],d[3],d[4],d[5]]);


    var canvas, context = makeCanvas('scatterplot', 'lyr0', scatterplotwidth+pad, scatterplotheight+pad)
    context.globalAlpha = 0.5





  const path = d3.geoPath().context(context);

  function draw(polygon) {
    
    context.clearRect(0, 0, scatterplotwidth, scatterplotheight);
    context.clearRect(-30, -30, window.innerWidth+50, window.innerHeight+50);
    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    
                  

      context.translate( scatterplotwidth / 2, scatterplotheight / 2 )
      context.scale(cameraZoom, cameraZoom)
      context.translate( -scatterplotwidth / 2 + cameraOffset.x, -scatterplotheight / 2 + cameraOffset.y )

    
    


    context.beginPath();
    path({
      type: "LineString",
      coordinates: polygon
    });
    context.fillStyle = "rgba(0,0,0,.1)";
    context.fill("evenodd");
    context.lineWidth = 2;
    context.stroke();


    appcontext.prevlasso.forEach(element => {
      context.beginPath();
    path({
      type: "LineString",
      coordinates: element
    });
    context.fillStyle = "rgba(0,0,0,.1)";
    context.fill("evenodd");
    context.lineWidth = 0.5;
    context.stroke();

      
    });
    
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
    

    /*context.beginPath();
    path.pointRadius(2)({ type: "MultiPoint", coordinates: data });
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fill();
    
    context.beginPath();
    path.pointRadius(2)({ type: "MultiPoint", coordinates: appcontext.prevselected });
    context.fillStyle = "steelblue";
    context.globalAlpha = 0.7
    context.fill();
    */
    var clr = ['#999999',
      '#f781bf',
      '#4daf4a',
      '#984ea3',
      '#ff7f00',
      '#e41a1c',
      '#a65628',
      '#377eb8']
      
      var clr = ['#999999',
      '#f032e6',
      '#911eb4',
      '#4363d8',
      '#3cb44b',
      '#ffe119',
      '#f58231',
      '#e6194B']


      
    data.forEach(function(point, index) {
      if  (appcontext.clusterk>1) {
        //console.log(point)
        let clr = appcontext.clustercolors[point[3]]
        if (point[3] == -1){ clr = "#dcdcdc99"}
        drawPoint([point[0],point[1]], 3.5, context, clr);
      }else{
        //console.log(point[3])
        //clr[point[3]]
        drawPoint([point[0],point[1]], 2.5, context, '#14716c');
      }
      
    })

    //console.log(appcontext.prevselected)
    appcontext.prevselected.forEach(function(points, index) {
      
      points.forEach(function(point) {
        drawPoint([point[0],point[1]], 1, context, clr[point[3]])
      //drawPoint([point[0],point[1]], 3, context,appcontext.clustercolors[index]);
    })})

    appcontext.searched.forEach(function(index) {
      drawPoint([data[index][0],data[index][1]], 10, context, '#c2677a', 0.7, 2);

    })
    context.closePath()

    

    if (polygon.length > 2) {
      /*context.beginPath();
      path.pointRadius(3.5)({ type: "MultiPoint", coordinates: selected });
      context.fillStyle = "steelblue";
      context.globalAlpha = 0.7
      context.fill();*/

      selected.forEach(function(point, index) {
        drawPoint([point[0],point[1]], 4, context, "rgba(3,93,96,0.8)");
      })
      context.closePath()
      
    }
    //console.log(selected)

    context.canvas.value = { polygon, selected };
    context.canvas.dispatchEvent(new CustomEvent('input'));
    var ctx = context.canvas.getContext('2d');
    var found = [];
    var color = 'black';

    maketooltip(data, scatterplotwidth, scatterplotheight)



      
      //context = d3.select("canvas").node().getContext("2d");
  
     
    
  }



  let lastZoom = cameraZoom
 

  makeCanvas('tooltip', 'lyr1', 2*scatterplotwidth, scatterplotheight)
  var canvas = document.getElementById('tooltip')
  //canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
  /*canvas.addEventListener('mousedown', onPointerDown)
  canvas.addEventListener('mouseup', onPointerUp)
  canvas.addEventListener('mousemove', onPointerMove)*/
  draw([[0,0]]);
  

  var cElements = document.getElementsByTagName('canvas');

  //console.log(cElements)

  const canvas2 = document.getElementById('tooltip');
  canvas2.className = "lyr3"


function adjustZoom(zoomAmount, zoomFactor) {
  console.log(isDragging)
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
            appcontext.setZoomscale(cameraZoom)
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
            appcontext.setZoomscale(cameraZoom)
        }

        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        appcontext.setZoomscale(cameraZoom)

        console.log(zoomAmount,cameraZoom)
        //w = w+(zoomAmount)*300


    }

}
requestAnimationFrame( draw )
const ctx = canvas2.getContext('2d');
if (appcontext.zoomselected){
  //ctx.canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
}else{
  ctx.canvas.removeEventListener('wheel', adjustZoom);
}
//
        
 //const ctx = canvas2.getContext('2d');
 d3.select(ctx.canvas)
   .call(lasso().on("start lasso end", draw))


  


return (
    <>
    
    </>
  ); 
}



export default LassoSelectionCanvas;  
