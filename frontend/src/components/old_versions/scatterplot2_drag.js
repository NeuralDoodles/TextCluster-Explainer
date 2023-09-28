import React, {useRef, useContext, useEffect} from "react";
import * as d3 from "d3";
import { AppContext } from '../../AppContext';
import { quadtree } from 'd3-quadtree' // v^2.0.0
import  Explain  from "../explanation";

//datum:
//0: x
//1: y
//2: label

makeCanvas('scatterplot', 'lyr2', window.innerWidth, window.innerHeight*0.75)
let isDragging = false
let dragStart = { x: 0, y: 0 }

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

function LassoSelectionCanvas(data) {

  const appcontext = useContext(AppContext);
  data = data.data
  let x = d3.scaleLinear().range([0, window.innerWidth]),
      y = d3.scaleLinear().range([0, window.innerHeight]);

    
    

    var d_extent_x = d3.extent(data, (d) => +d[0]),
        d_extent_y = d3.extent(data, (d) => +d[1]);

    // Draw axes
    x.domain(d_extent_x);
    y.domain(d_extent_y);
    //console.log(x,y)


    appcontext.xscale = x
    appcontext.yscale = y
    

  data = data.map((d) => [x(+d[0]), y(+d[1]),d[2]]);
  
  let cameraOffset = { x: 0, y: 0 }
  let cameraZoom = 1
  let MAX_ZOOM = 200
  let MIN_ZOOM = 0.0005
  let SCROLL_SENSITIVITY = 0.001
  let DRAG_SENSITIVITY = 0.1


function draw() {
    var canvas = document.getElementById('scatterplot')
    var ctx = canvas.getContext("2d");
    ctx.clearRect(-30, -30, window.innerWidth+50, window.innerHeight+50);
    // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
    ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
    ctx.scale(cameraZoom, cameraZoom)
    ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )

  console.log(cameraOffset)
    /*const path = d3.geoPath().context(ctx);
    ctx.beginPath();
    path.pointRadius(2)({ type: "MultiPoint", coordinates: data });
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fill();*/
    //console.log(cameraZoom)
    
    data.forEach(function(point, index) {
      drawPoint([point[0],point[1]], 1+2*100**(1-cameraZoom), ctx, "rgba(0, 0, 0, 0.5)");
    })
    ctx.closePath()


    
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





function onPointerDown(e) {
  console.log(e.shiftKey)

    isDragging = true
    dragStart.x = getEventLocation(e).x 
    dragStart.y = getEventLocation(e).y
}

function onPointerUp(e) {
    isDragging = false
    lastZoom = cameraZoom
}

function onPointerMove(e) {

  

    if (isDragging)

    {
      //console.log(cameraOffset)
      cameraOffset.x = (getEventLocation(e).x - dragStart.x)
      cameraOffset.y = (getEventLocation(e).y- dragStart.y)
      appcontext.setCameraOffset(cameraOffset)
    }
}



let lastZoom = cameraZoom

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
var canvas = document.getElementById('scatterplot')
canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
//canvas.addEventListener('mousedown', onPointerDown)
//canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('mousemove', onPointerMove)


// Ready, set, go
draw()

return (
    <>
    
    </>
  ); 
}



export default LassoSelectionCanvas;
