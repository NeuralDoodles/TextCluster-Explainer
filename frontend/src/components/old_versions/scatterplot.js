import React, {useRef, useContext, useEffect} from "react";
import * as d3 from "d3";
import { AppContext } from '../AppContext';
import { quadtree } from 'd3-quadtree' // v^2.0.0
import  Explain  from "./explanation";

//datum:
//0: x
//1: y
//2: label

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 200
let MIN_ZOOM = 0.0005
let SCROLL_SENSITIVITY = 0.0001

let isDragging = false
let dragStart = { x: 0, y: 0 }

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


function onPointerDown(e) {
    isDragging = true
    dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
    dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e) {
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e) {
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    }
}

function handleTouch(e, singleTouchHandler) {
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e) {
    e.preventDefault()

    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2

    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor) {
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            console.log(zoomFactor)
            cameraZoom = zoomFactor*lastZoom
        }

        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )

        console.log(zoomAmount,cameraZoom)

    }

}

function drawPoint([cx,cy], r, ctx, color) {


  // NOTE; each point needs to be drawn as its own path
  // as every point needs its own stroke. you can get an insane
  // speed up if the path is closed after all the points have been drawn
  // and don't mind points not having a stroke
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  //context.closePath();
  ctx.fillStyle = color
  ctx.fill();
  //context.stroke();
}

function makeCanvas(id, class_name, w, h){
  var canvas = document.createElement('canvas');

  canvas.setAttribute('className',class_name)
  canvas.setAttribute('id',id)
  canvas.style.position = 'absolute';
  canvas.style.overflow = "visible"
  
  canvas.style.x = 10;
  canvas.style.y = 10;
  const context = canvas.getContext("2d");


  context.canvas.width  = w;
  context.canvas.height = h;
  document.body.appendChild(canvas);

  return canvas, context


}
var isinsidelasso = []
 makeCanvas('labels', 'lyr2', 2000, 800)

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
                  appcontext.prevlasso.push(polygon)
                  const canvas = document.getElementById('scatterplot');

                  console.log(canvas)

                  
                  
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

    function maketooltip(data, width, height){

        //console.log(document.getElementById('scatterplot'),  document.getElementById('tooltip'))
       
      
        var canvas, context = makeCanvas('tooltip', 'lyr1', 2000, height)
        
      
      
      
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

    function draw(polygon) {
    
    
        context.clearRect(0, 0,window.innerWidth, window.innerHeight);
  

    
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
    
    
        data.forEach(function(point, index) {
          drawPoint([point[0],point[1]], 2, context, "rgba(0, 0, 0, 0.5)");
        })
    
        appcontext.prevselected.forEach(function(point, index) {
          drawPoint([point[0],point[1]], 3, context, "rgba(3,93,96,0.5)");
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
        // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
        context.translate( window.innerWidth  / 2, window.innerHeight / 2 )
        context.scale(cameraZoom, cameraZoom)
        context.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
        
 
        requestAnimationFrame( draw )

        
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






    let x = d3.scaleLinear().range([-window.innerWidth/2, window.innerWidth/2]),
        y = d3.scaleLinear().range([-window.innerHeight/2, window.innerHeight/2]);

    
    

    var d_extent_x = d3.extent(data, (d) => +d[0]),
        d_extent_y = d3.extent(data, (d) => +d[1]);

    // Draw axes
    x.domain(d_extent_x);
    y.domain(d_extent_y);
    //console.log(x,y)


    appcontext.xscale = x
    appcontext.yscale = y
    

    data = data.map((d) => [x(+d[0]), y(+d[1]),d[2]]);


    makeCanvas('scatterplot', 'lyr0', scatterplotwidth+pad, scatterplotheight+pad)
    var canvas = document.getElementById('scatterplot')
    var context = canvas.getContext("2d");
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight*0.75


    canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    canvas.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    
    


  //console.log(context.scale(2,2))

  const path = d3.geoPath().context(context);



  draw([[0,0]]);

 
  /*maketooltip(data, scatterplotwidth, scatterplotheight)

 // var cElements = document.getElementsByTagName('canvas');

  //console.log(cElements)

  const canvas2 = document.getElementById('tooltip');
        
 const ctx = canvas2.getContext('2d');
  d3.select(ctx.canvas)
    .call(lasso().on("start lasso end", draw))
*/


return (
    <>
    
    </>
  ); 
}



export default LassoSelectionCanvas;
