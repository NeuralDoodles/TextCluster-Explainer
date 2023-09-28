import React, { useRef, useEffect, useState } from "react";
// import * as d3 from "d3";
// import * as d3lasso from "d3-lasso"
import d3 from "./d3-extended"
import lasso from "./d3-lasso-adapted"

function LassoSelectionCanvas({ data, width, height }) {

  
  console.log(data)
  const [ currentZoomScale, setCurrentZoomScale ] = useState(1)
  const [ coordinateShift, setCoordinateShift ] = useState([0,0])
  
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);
    var isLassoOn = false;
    const path = d3.geoPath() // NEW
    const l = svg.append("path").attr("class", "lasso") //NEW
    const g = svg.append("g")
    .attr("class", "circles");

    // styling the circles, when not hovered and hovered
    g.append("style").text(`
      .circles {
        stroke: transparent;
        stroke-width: 4px;
      }
      .circles circle:hover {
        stroke: green;
        stroke-width: 20px;
        stroke-opacity: 0.5;
        r: 8;
      }
    `);

    var color = 'black' // TODO: Change later

    // Drawing all circles
    const circles = g.selectAll("circle")
      .data(data)
      .join("circle")
        .attr("cx", ([x]) => 100 * x) //TODO: change the scaling depending on dimension
        .attr("cy", ([, y]) => 100 * y) //TODO: change the scaling depending on dimension
        .attr("r", 4) //TODO: adjust size dpeending on diimension
        .attr("fill", color)
      
    circles.append("title")
        .text((d, i) => d[2])
    
    // NEW Lasso Functionality ------
    svg.append("defs").append("style").text(` 
      .selected {r: 4; fill: red}
      .lasso { fill-rule: evenodd; fill-opacity: 0.1; stroke-width: 1.5; stroke: #000; }
    `);

    function draw(polygon) {
      if (isLassoOn) {
        l.datum({
          type: "LineString",
          coordinates: polygon
        }).attr("d", path);
    
        const selected = [];
        
    
        // note: d3.polygonContains uses the even-odd rule
        // which is reflected in the CSS for the lasso shape
        circles.classed(
          "selected",
          polygon.length > 2
            ? d => d3.polygonContains(polygon, [((d[0] * 100) - coordinateShift[0]) / currentZoomScale, ((d[1] * 100) + coordinateShift[1]) / currentZoomScale ]) && selected.push(d) // need to change scale
            : false
        );
          console.log("selected", selected)
          console.log("polygon", polygon)
      }
  
      // svg.node().value = { polygon, selected };
      // svg.node().dispatchEvent(new CustomEvent('input'));
    }

    const lassoModeOn = (event) => { // lasso mode on while shift key pressed
      if (event.shiftKey) {
        console.log("ON")
        isLassoOn = true;
        svg.call(lasso().on("start lasso end", draw)); // TURNS ON LASSO
      }
    }

    const lassoModeOff = () => {
      console.log("OFF")
      isLassoOn = false;
      // l.on('.lasso', null);
    }
    
    window.addEventListener('keydown', lassoModeOn);
    window.addEventListener('keyup', lassoModeOff)
  
    // svg.call(lasso().on("start lasso end", draw));

    ///--------

    //TURN ON Zoom Functionality
    svg.call(
      d3
        .zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 10]) // can change how much to zoom 
        .on("zoom", zoomed)
    );

    function zoomed({ transform }) {
      if (!isLassoOn) {
        g.attr("transform", transform);
        console.log("transform", transform)
        setCurrentZoomScale(transform.k)
        setCoordinateShift([transform.x, transform.y])
      }
    }

    
  
    //Lasso functionality TODO below



    //d3.lasso version 1

    // var lasso_start = function() {
    //   console.log('start')
    //     lasso.items()
    //         .attr("r",7) 
    //         .classed("not_possible",true)
    //         .classed("selected",false);
    // };
  
    // var lasso_draw = function() {
    //   console.log('draw')
    //     lasso.possibleItems()
    //         .classed("not_possible",false)
    //         .classed("possible",true);
    //     lasso.notPossibleItems()
    //         .classed("not_possible",true)
    //         .classed("possible",false);
    // };
  
    // var lasso_end = function() {
    //     console.log('end')
    //     lasso.items()
    //         .classed("not_possible",false)
    //         .classed("possible",false);
    //     lasso.selectedItems()
    //         .classed("selected",true)
    //         .attr("r",7);
    //     lasso.notSelectedItems()
    //         .attr("r",3.5);
    // };
    
    // const lasso = d3.lasso()
    //         .closePathDistance(305) 
    //         .closePathSelect(true) 
    //         .targetArea(svg)
    //         .items(circles) 
    //         .on("start",lasso_start) 
    //         .on("draw",lasso_draw) 
    //         .on("end",lasso_end); 
  
    // svg.call(lasso);







    // Initialize lasso

    //d3.lasso() version2

    // const lasso = d3.lasso()
    //   .hoverSelect(true)
    //   .items(circles)
    //   .targetArea(svg)
    //   .on("start", lassoStart)
    //   .on("draw", lassoDraw)
    //   .on("end", lassoEnd);

    // const lassoModeOn = (event) => { // lasso mode on while shift key pressed
    //   if (event.shiftKey) {
    //     console.log("ON")
    //     svg.call(lasso);
    //   }
    // }

    // const lassoModeOff = () => {
    //   console.log("OFF")
    //   svg.on('.lasso', null);
    // }
    
    // window.addEventListener('keydown', lassoModeOn);
    // window.addEventListener('keyup', lassoModeOff)

    // // Function to handle lasso start
    // function lassoStart() {
    //   console.log(d3.event)
    //   lasso.items().classed("selected", false); // Clear previous selections
    // }

    // // Function to handle lasso draw
    // function lassoDraw() {
    //   // Highlight the selected circles
    //   lasso.items().filter((d) => d.selected).classed("selected", true);
    // }

    // // Function to handle lasso end
    // function lassoEnd() {
    //   // Handle the selection (you can perform any desired actions here)
    //   const selectedCircles = lasso.items().filter((d) => d.selected);
    //   console.log("Selected circles:", selectedCircles.data());
    // }

    // return () => {
    //   // Cleanup: Remove the event listeners when the component unmounts
    //   window.removeEventListener('keydown', lassoModeOn);
    //   window.removeEventListener('keyup', lassoModeOff);
    // };
  }, [data]);

  

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}

export default LassoSelectionCanvas;

// -----
// import * as d3 from "d3";
// import React, { useRef, useEffect } from "react";

// const leftpanelwidth = 300;
// const navbarheight = 100;
// const pad = 50;
// let scatterplotwidth = window.innerWidth - leftpanelwidth - pad;
// let scatterplotheight = window.innerHeight - navbarheight - pad;

// function LassoSelectionCanvas() {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const context = canvas.getContext("2d");

//     const randomX = (scatterplotwidth / 2) + 80 * Math.random();
//     const randomY = (scatterplotheight / 2) + 80 * Math.random();
//     const data1 = Array.from({ length: 2000 }, () => [randomX, randomY]);

//     context.clearRect(0, 0, scatterplotwidth, scatterplotheight);

//     data1.forEach(([x, y]) => {
//       context.beginPath();
//       context.arc(x, y, 1.5, 0, 2 * Math.PI);
//       context.fillStyle = "blue";
//       context.fill();
//       context.closePath();
//     });

//     const zoomed = ({ transform }) => {
//       context.clearRect(0, 0, scatterplotwidth, scatterplotheight);
//       context.setTransform(transform);
//       data1.forEach(([x, y]) => {
//         context.beginPath();
//         context.arc(x, y, 1.5, 0, 2 * Math.PI);
//         context.fillStyle = "blue";
//         context.fill();
//         context.closePath();
//       });
//     };

//     const zoom = d3.zoom()
//       .extent([[0, 0], [scatterplotwidth, scatterplotheight]])
//       .scaleExtent([1, 8])
//       .on("zoom", zoomed);

//     canvas.addEventListener("wheel", (event) => {
//       zoom.scaleBy(canvas, event.deltaY > 0 ? 1.1 : 0.9);
//     });

//     return () => {
//       canvas.removeEventListener("wheel", () => {});
//     };
//   }, []);

//   return (
//     <div>
//       <canvas
//         ref={canvasRef}
//         width={scatterplotwidth}
//         height={scatterplotheight}
//       ></canvas>
//     </div>
//   );
// }

// export default LassoSelectionCanvas;

//----------


// import React, { useRef, useContext, useEffect, useState } from "react";
// import * as d3 from "d3";
// import { AppContext } from '../../AppContext';
// import { quadtree } from 'd3-quadtree' // v^2.0.0
// import { drawPoint, makeCanvas, trackPointer, getEventLocation } from "./scatterplot_setup";
// // import Slider from "@mui/material/Slider";

// const lassoCursor = document.getElementById("lasso-cursor");
// var isinsidelasso = []

// let dragStart = { x: 0, y: 0 }
// let cameraOffset = { x: 0, y: 0 }
// let MAX_ZOOM = 200
// let MIN_ZOOM = 0.0005
// let SCROLL_SENSITIVITY = 0.001
// let DRAG_SENSITIVITY = 0.1
// const leftpanelwidth = 300
// const navbarheight = 100
// const pad = 50

// let scatterplotwidth = window.innerWidth - leftpanelwidth - pad;
// let scatterplotheight = window.innerHeight - navbarheight - pad;

// //makeCanvas('labels', 'lyr2', scatterplotwidth + 300, scatterplotheight)

// function LassoSelectionCanvas(data) {
//   const appcontext = useContext(AppContext);
//   // const [isDragging, setIsDragging] = useState(false)
//   // const [isZooming, setIsZooming] = useState(false)
//   const [isLassoMode, setIsLassoMode] = useState(false)

//   let cameraZoom = appcontext.zoomscale


//   function adjustZoom(zoomAmount, zoomFactor) {
//     // if (!isDragging) {
//     if (zoomAmount) {
//       cameraZoom += zoomAmount
//       appcontext.setZoomscale(cameraZoom)
//     }
//     else if (zoomFactor) {
//       //console.log(zoomFactor)
//       cameraZoom = zoomFactor * lastZoom
//       appcontext.setZoomscale(cameraZoom)
//     }

//     cameraZoom = Math.min(cameraZoom, MAX_ZOOM)
//     cameraZoom = Math.max(cameraZoom, MIN_ZOOM)
//     appcontext.setZoomscale(cameraZoom)

//     //w = w+(zoomAmount)*300


//     // }

//   }

//   useEffect(() => console.log("isLassoMode", isLassoMode), [isLassoMode])

//   function lasso() {
//     const dispatch = d3.dispatch("start", "lasso", "end");
//     const lasso = function (selection) {
//       // console.log(selection)
//       const node = selection.node();
//       const polygon = [];


//       selection
//         // .on('wheel', e => { // Controls zoom
//         //   e.preventDefault()
//         //   // isZooming = true
//         //   console.log("zoom")
//         //   // if (isZooming) {
//         //   adjustZoom(e.deltaY * SCROLL_SENSITIVITY)
//         //   // }
//         // })
//         .on("touchmove", e => e.preventDefault()) // prevent scrolling
//         .on("touchdown", e => e.preventDefault()) // prevent scrolling
//         .on("touchmove", e => e.preventDefault()) // prevent scrolling
//         .on("touchup", e => e.preventDefault()) // prevent scrolling
//         .on("mousedown", e => {
//           if (e.button === 2) { // if right mouse / two fingers is pressed down, drag
//             console.log("DRAGGING")
//             dragStart.x = getEventLocation(e).x - cameraOffset.x
//             dragStart.y = getEventLocation(e).y - cameraOffset.y
//           }
//         })
//         .on("dblclick", e => { // double click to go in and out of lasso mode ONLY WORKS ONCE
//           e.preventDefault();
//           setIsLassoMode(!isLassoMode)
//           console.log("lasso mode", isLassoMode)
//           if (isLassoMode) {
//             console.log("LASSO MODE") // WANT TO CHANGE CURSOR TO LASSO MODE, CURRENTLY BROKEN
//             document.addEventListener("mousemove", (e) => {
//               // Update the custom cursor's position to follow the mouse pointer
//               lassoCursor.style.left = e.clientX + "px";
//               lassoCursor.style.top = e.clientY + "px";
//             });
//           }
//         })
//         // .on("mousedown", e => {
//         //   if (e.shiftKey) {
//         //     // isDragging = true
//         //     dragStart.x = getEventLocation(e).x - cameraOffset.x
//         //     dragStart.y = getEventLocation(e).y - cameraOffset.y
//         //     console.log(dragStart)
//         //   }
//         // }) // prevent scrolling 
//         /*.on("mouseup", e => isDragging = false) // prevent scrolling
//         .on("mousemove", e => {
//           if (isDragging)
 
//           {
//             cameraOffset.x = (getEventLocation(e).x - dragStart.x)
//             cameraOffset.y = (getEventLocation(e).y- dragStart.y)
//             appcontext.setCameraOffset(cameraOffset)
//             console.log(appcontext.cameraOffset,  dragStart)
//           }
//         })*/
//         .on("pointerdown", e => {
//           if (isLassoMode) { // if in lasso mode, lasso
//             trackPointer(e, {
//               start: p => {
//                 polygon.length = 0;
//                 // isZooming = false

//                 // isDragging = false
//                 appcontext.setZoomselected(false)
//                 dispatch.call("start", node, polygon);



//               },
//               move: p => {
//                 // isZooming = false


//                 polygon.push(p.point);
//                 dispatch.call("lasso", node, polygon);

//               },
//               end: p => {
//                 // isZooming = false


//                 dispatch.call("end", node, polygon);
//                 appcontext.prevlasso.push(polygon)



//                 const canvas = document.getElementById('scatterplot');

//                 if (canvas.value['polygon'].length > 1) {
//                   appcontext.setLassoed(canvas.value['selected']);
//                   appcontext.setGetexplain(true);
//                   appcontext.setIsinsidelasso(isinsidelasso)
//                 };
//                 appcontext.setMakecloud(true)
//                 appcontext.prevselected.push(canvas.value['selected'])
//                 appcontext.setLastselected(canvas.value['selected'])



//               }
//             });
//           }
//         });
//     };
//     lasso.on = function (type, _) {
//       return _ ? (dispatch.on(...arguments), lasso) : dispatch.on(...arguments);
//     };

//     return lasso;
//   }



//   let prev_scatter = document.getElementById('scatterplot')
//   let prev_tooltip = document.getElementById('tooltip')
//   if (prev_tooltip != null) {
//     prev_tooltip.remove()
//   }

//   if (prev_scatter != null) {
//     prev_scatter.remove()
//   }


//   data = data.data


//   function maketooltip(data, width, height) {

//     //console.log(document.getElementById('scatterplot'),  document.getElementById('tooltip'))

//     const canvas = document.getElementById('scatterplot');
//     let transf_matrix = canvas.getContext('2d').getTransform();
//     const transformedPoint = (point, matrix) => {
//       let x = matrix.a * point[0] + matrix.c * point[1] + matrix.e
//       let y = matrix.b * point[1] + matrix.d * point[1] + matrix.f

//       point[0] = x
//       point[1] = y
//       return point
//     };



//     let transformed_data = data.map(point => transformedPoint(point, transf_matrix))

//     const quadtreeInstance = quadtree()//here 500 is the width and height of the canvas or the max x/y range of the points in scatter chart.
//       .x(function (d) { return +d[0] })
//       .y(function (d) { return +d[1] }).addAll(transformed_data)

//     d3.select("#tooltip").on("mousemove", function (event) {

//       //find in the vicinity of 10 pixel around the click.
//       const newHoverPoint = quadtreeInstance.find(event.pageX, event.pageY - navbarheight + 20, 10)




//       const canvas2 = document.getElementById('tooltip');

//       const ctx = canvas2.getContext('2d');
//       ctx.clearRect(0, 0, canvas2.width, canvas2.height);




//       //ctx.beginPath();
//       //ctx.arc(event.pageX,  event.pageY-100, 10, 0, 2 * Math.PI);
//       //ctx.stroke();


//       ctx.font = "20px serif";
//       try {
//         let txt = newHoverPoint[2]
//         var w = ctx.measureText(txt).width;

//         let point = transformedPoint(newHoverPoint, transf_matrix)
//         // rectangle
//         ctx.beginPath();
//         ctx.lineWidth = "2";
//         ctx.strokeStyle = "black";
//         ctx.rect(event.pageX + 10, event.pageY - 120, w + 10, 30);
//         ctx.fillStyle = 'white';
//         ctx.fill();
//         ctx.stroke();

//         ctx.beginPath();
//         ctx.arc(newHoverPoint[0], newHoverPoint[1], 10, 0, 2 * Math.PI);
//         ctx.stroke()
//         ctx.fillStyle = 'green';
//         ctx.fill();
//         ctx.lineWidth = 1;
//         ctx.strokeStyle = '#003300';
//         ctx.stroke();



//         ctx.fillStyle = 'black';
//         ctx.fillText(txt, event.pageX + 12, event.pageY - 100, w + 20);
//       } catch (e) {

//       }




//       //console.log(newHoverPoint);
//     })



//   }



//   let x = d3.scaleLinear().range([pad, scatterplotwidth]),
//     y = d3.scaleLinear().range([pad, scatterplotheight]);




//   var d_extent_x = d3.extent(data, (d) => +d[0]),
//     d_extent_y = d3.extent(data, (d) => +d[1]);

//   // Draw axes
//   x.domain(d_extent_x);
//   y.domain(d_extent_y);
//   //console.log(x,y)


//   appcontext.xscale = x
//   appcontext.yscale = y


//   data = data.map((d) => [x(+d[0]), y(+d[1]), d[2], d[3], d[4], d[5]]);


//   var canvas, context = makeCanvas('scatterplot', 'lyr0', scatterplotwidth + pad, scatterplotheight + pad)
//   context.globalAlpha = 0.5





//   const path = d3.geoPath().context(context);

//   function draw(polygon) {

//     context.clearRect(0, 0, scatterplotwidth, scatterplotheight);
//     context.clearRect(-30, -30, window.innerWidth + 50, window.innerHeight + 50);
//     // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at



//     context.translate(scatterplotwidth / 2, scatterplotheight / 2)
//     context.scale(cameraZoom, cameraZoom)
//     context.translate(-scatterplotwidth / 2 + cameraOffset.x, -scatterplotheight / 2 + cameraOffset.y)





//     context.beginPath();
//     path({
//       type: "LineString",
//       coordinates: polygon
//     });
//     context.fillStyle = "rgba(0,0,0,.1)";
//     context.fill("evenodd");
//     context.lineWidth = 2;
//     context.stroke();


//     appcontext.prevlasso.forEach(element => {
//       context.beginPath();
//       path({
//         type: "LineString",
//         coordinates: element
//       });
//       context.fillStyle = "rgba(0,0,0,.1)";
//       context.fill("evenodd");
//       context.lineWidth = 0.5;
//       context.stroke();


//     });

//     const selected = [];

//     isinsidelasso = []
//     appcontext.setGetexplain(false)
//     for (const d of data) {
//       const contains =
//         polygon.length > 2 &&
//         d3.polygonContains(polygon, d) &&
//         selected.push(d) &&
//         isinsidelasso.push([d[2], 1]) || isinsidelasso.push([d[2], 0])
//     }


//     /*context.beginPath();
//     path.pointRadius(2)({ type: "MultiPoint", coordinates: data });
//     context.fillStyle = "rgba(0, 0, 0, 0.8)";
//     context.fill();
    
//     context.beginPath();
//     path.pointRadius(2)({ type: "MultiPoint", coordinates: appcontext.prevselected });
//     context.fillStyle = "steelblue";
//     context.globalAlpha = 0.7
//     context.fill();
//     */
//     var clr = ['#999999',
//       '#f781bf',
//       '#4daf4a',
//       '#984ea3',
//       '#ff7f00',
//       '#e41a1c',
//       '#a65628',
//       '#377eb8']

//     var clr = ['#999999',
//       '#f032e6',
//       '#911eb4',
//       '#4363d8',
//       '#3cb44b',
//       '#ffe119',
//       '#f58231',
//       '#e6194B']


//     // Controls color
//     data.forEach(function (point, index) {
//       if (appcontext.clusterk > 1) {
//         //console.log(point)
//         let clr = appcontext.clustercolors[point[3]]
//         if (point[3] == -1) { clr = "#dcdcdc99" }
//         drawPoint([point[0], point[1]], 2.5, context, clr);
//       } else {
//         //console.log(point[3])
//         //clr[point[3]]
//         drawPoint([point[0], point[1]], 1.5, context, '#14716c');
//       }

//     })

//     //console.log(appcontext.prevselected)
//     appcontext.prevselected.forEach(function (points, index) {

//       points.forEach(function (point) {
//         drawPoint([point[0], point[1]], 1, context, clr[point[3]])
//         //drawPoint([point[0],point[1]], 3, context,appcontext.clustercolors[index]);
//       })
//     })

//     console.log(data)
//     appcontext.searched.forEach(function (index) {
//       drawPoint([data[index][0], data[index][1]], 10, context, '#c2677a', 0.9, 2);

//     })
//     context.closePath()



//     if (polygon.length > 2) {
//       /*context.beginPath();
//       path.pointRadius(3.5)({ type: "MultiPoint", coordinates: selected });
//       context.fillStyle = "steelblue";
//       context.globalAlpha = 0.7
//       context.fill();*/

//       selected.forEach(function (point, index) {
//         drawPoint([point[0], point[1]], 4, context, "rgba(3,93,96,0.8)");
//       })
//       context.closePath()

//     }
//     //console.log(selected)

//     context.canvas.value = { polygon, selected };
//     context.canvas.dispatchEvent(new CustomEvent('input'));
//     var ctx = context.canvas.getContext('2d');
//     var found = [];
//     var color = 'black';

//     maketooltip(data, scatterplotwidth, scatterplotheight)




//     //context = d3.select("canvas").node().getContext("2d");



//   }



//   let lastZoom = cameraZoom


//   makeCanvas('tooltip', 'lyr1', 2 * scatterplotwidth, scatterplotheight)
//   var canvas = document.getElementById('tooltip')
//   //canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
//   /*canvas.addEventListener('mousedown', onPointerDown)
//   canvas.addEventListener('mouseup', onPointerUp)
//   canvas.addEventListener('mousemove', onPointerMove)*/
//   draw([[0, 0]]);


//   var cElements = document.getElementsByTagName('canvas');

//   //console.log(cElements)

//   const canvas2 = document.getElementById('tooltip');
//   canvas2.className = "lyr3"



//   requestAnimationFrame(draw)
//   const ctx = canvas2.getContext('2d');
//   if (appcontext.zoomselected) {
//     //ctx.canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
//   } else {
//     ctx.canvas.removeEventListener('wheel', adjustZoom);
//   }
//   //

//   //const ctx = canvas2.getContext('2d');
//   d3.select(ctx.canvas)
//     .call(lasso().on("start lasso end", draw))





//   return (
//     <>
//     </>
//   );
// }



// export default LassoSelectionCanvas;  
