import React, { useRef, useEffect, useState, useContext } from "react";
// import * as d3 from "d3";
// import * as d3lasso from "d3-lasso"
import d3 from "./d3-extended"
import lasso from "./d3-lasso-adapted"
import { AppContext } from "../../AppContext";

function LassoSelectionCanvas({ data, width, height }) {
  const appcontext = useContext(AppContext);

  let x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([0, height]);

  var d_extent_x = d3.extent(data, (d) => +d[0]),
    d_extent_y = d3.extent(data, (d) => +d[1]);

  // Draw axes
  x.domain(d_extent_x);
  y.domain(d_extent_y);

  var currentZoomScale = 1
  var coordinateShift = [0, 0]
  var lasso_counter = -1

  const svgRef = useRef(null);

  var color = 'black' // default color for the circles, TODO: Change later
  const circlesRef = useRef(null);

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

    // Drawing all circles
    circlesRef.current = g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", ([cx]) => x(cx))
      .attr("cy", ([, cy]) => y(cy))
      .attr("r", 1)
      .attr("fill", color)

    circlesRef.current.append("title")
      .text((d, i) => d[2])

    // NEW Lasso Functionality ------

    const initialStyles = ".lasso { fill-rule: evenodd; fill-opacity: 0.1; stroke-width: 1.5; stroke: #000; }"
    svg.append("defs").append("style").text(initialStyles);

    function draw(polygon) {

      if (isLassoOn) {
        l.datum({
          type: "LineString",
          coordinates: polygon
        }).attr("d", path);

        // Update the attributes of the selected circles
        circlesRef.current = circlesRef.current.join("circle")
          .attr("r", function (d) {
            // Check if the circle is selected based on the lasso selection
            var isCircleSelected = polygon.length > 2 ? d3.polygonContains(polygon, [x(d[0]) * currentZoomScale + coordinateShift[0], y(d[1]) * currentZoomScale + coordinateShift[1]]) : false;
            if (isCircleSelected) {
              appcontext.setLassoed(appcontext.lassoed.add(d))
            }
            else {
              console.log('PREV len', appcontext.prevlasso.length)
              for (var i = 0; i < appcontext.prevlasso.length; i++) { // goes through all of the previously lassoed points
                if (appcontext.prevlasso[i].has(d)) isCircleSelected = true
              }
            }
            // Define the new radius based on selection
            return isCircleSelected ? 4 : 1; // Adjust the radius values as needed
          })
          .attr("fill", function (d) {
            var isCircleSelected = polygon.length > 2 ? d3.polygonContains(polygon, [x(d[0]) * currentZoomScale + coordinateShift[0], y(d[1]) * currentZoomScale + coordinateShift[1]]) : false;
            var lasso_color = color
            if (isCircleSelected) {
              lasso_color = appcontext.clustercolors[lasso_counter]
            }
            for (var i = 0; i < appcontext.prevlasso.length; i++) { // goes through all of the previously lassoed points
              if (appcontext.prevlasso[i].has(d)) {
                lasso_color = appcontext.clustercolors[i]
              }
            }
            return lasso_color;
          });


      }
    }

    const lassoModeOn = (event) => { // lasso mode on while shift key pressed
      if (event.shiftKey) {
        lasso_counter = (lasso_counter + 1) % 100

        if (appcontext.lassoed.size != 0) { // updates the list of previous lassoes 
          // Didn't work when I used setPrevlasso and setLassoed functions
          // appcontext.prevlasso.push(new Set(appcontext.lassoed));
          // appcontext.lassoed.clear() // empties the set that contains the current lasso
          appcontext.setPrevlasso((prev) => {
            const updatedPrevLassoes = [...prev];

            // Push the new Set containing lassoed data
            updatedPrevLassoes.push(new Set(appcontext.lassoed));

            // Update the state with the updated value of prevlasso
            return updatedPrevLassoes;
          })

          // appcontext.setLassoed((prev) => {
          //   return new Set()
          // })
          appcontext.lassoed.clear()
        }

        console.log("ON")
        isLassoOn = true;
        svg.call(lasso().on("start lasso end", draw)); // TURNS ON LASSO
      }
    }

    const lassoModeOff = () => {
      console.log("OFF")
      isLassoOn = false;
    }

    window.addEventListener('keydown', lassoModeOn);
    window.addEventListener('keyup', lassoModeOff)


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
        currentZoomScale = transform.k
        coordinateShift = [transform.x, transform.y]
        // l.attr("transform", `translate(${coordinateShift[0]},${coordinateShift[1]}) scale(${currentZoomScale})`); // SCALING THE LASSO LINE. DOESN'T WORK ALL THE TIME

      }
    }
  }, [data]);

  useEffect(() => { console.log('prevlassochanged', appcontext.prevlasso) }, [appcontext.prevlasso])
  useEffect(() => { console.log('lassoed changed', appcontext.lassoed) }, [appcontext.lassoed])

  useEffect(() => {
    console.log("reset", appcontext.isLassoReset)
    if (appcontext.isLassoReset) {
      // appcontext.lassoed.clear()
      // appcontext.setPrevlasso([])
      appcontext.setLassoed((prev) => {
        return new Set()
      })
      appcontext.setPrevlasso((prev) => {
        return []
      })
      circlesRef.current.attr("r", function (d) {
        return 1; // Reset the radius to its original value
      }).attr("fill", function (d) {
        return color; // Reset the fill color to the default color
      });
      appcontext.setIsLassoReset(false)
    }
  }, [appcontext.isLassoReset])

  return (
    <div>
      <svg ref={svgRef} width={width} height={height}></svg>
    </div>
  );
}

export default LassoSelectionCanvas;

// import React, { useRef, useEffect, useState, useContext } from "react";
// // import * as d3 from "d3";
// // import * as d3lasso from "d3-lasso"
// import d3 from "./d3-extended"
// import lasso from "./d3-lasso-adapted"
// import { AppContext } from "../../AppContext";

// function LassoSelectionCanvas({ data, width, height }) {
//   const appcontext = useContext(AppContext);

//   let x = d3.scaleLinear().range([0, width]),
//     y = d3.scaleLinear().range([0, height]);

//   var d_extent_x = d3.extent(data, (d) => +d[0]),
//     d_extent_y = d3.extent(data, (d) => +d[1]);

//   // Draw axes
//   x.domain(d_extent_x);
//   y.domain(d_extent_y);

//   var currentZoomScale = 1
//   var coordinateShift = [0, 0]
//   var lasso_counter = -1

//   const svgRef = useRef(null);

//   var color = 'black' // default color for the circles, TODO: Change later
//   const circlesRef = useRef(null);

//   // var prevlasso = []
//   // var lassoed = new Set()
//   const [prevlasso, setPrevlasso] = useState([])
//   const [lassoed, setLassoed] = useState(new Set())

//   useEffect(() => {
//     const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);
//     var isLassoOn = false;
//     const path = d3.geoPath() // NEW
//     const l = svg.append("path").attr("class", "lasso") //NEW
//     const g = svg.append("g")
//       .attr("class", "circles");

//     // styling the circles, when not hovered and hovered
//     g.append("style").text(`
//       .circles {
//         stroke: transparent;
//         stroke-width: 4px;
//       }
//       .circles circle:hover {
//         stroke: green;
//         stroke-width: 20px;
//         stroke-opacity: 0.5;
//         r: 8;
//       }
//     `);

//     // Drawing all circles
//     circlesRef.current = g.selectAll("circle")
//       .data(data)
//       .join("circle")
//       .attr("cx", ([cx]) => x(cx))
//       .attr("cy", ([, cy]) => y(cy))
//       .attr("r", 1)
//       .attr("fill", color)

//     circlesRef.current.append("title")
//       .text((d, i) => d[2])

//     // NEW Lasso Functionality ------

//     const initialStyles = ".lasso { fill-rule: evenodd; fill-opacity: 0.1; stroke-width: 1.5; stroke: #000; }"
//     svg.append("defs").append("style").text(initialStyles);

//     function draw(polygon) {

//       if (isLassoOn) {
//         l.datum({
//           type: "LineString",
//           coordinates: polygon
//         }).attr("d", path);

//         // Update the attributes of the selected circles
//         circlesRef.current = circlesRef.current.join("circle")
//           .attr("r", function (d) {
//             // Check if the circle is selected based on the lasso selection
//             var isCircleSelected = polygon.length > 2 ? d3.polygonContains(polygon, [x(d[0]) * currentZoomScale + coordinateShift[0], y(d[1]) * currentZoomScale + coordinateShift[1]]) : false;
//             if (isCircleSelected) {
//               // appcontext.setLassoed(appcontext.lassoed.add(d)) // works
//               // lassoed.add(d)
//               const updatedLassoed = new Set(lassoed);

//               // Add the element 'd' to the updated set
//               updatedLassoed.add(d);

//               // Update the state with the updated value of lassoed
//               setLassoed(updatedLassoed);
//             }
//             else {
//               for (var i = 0; i < prevlasso.length; i++) { // goes through all of the previously lassoed points
//                 if (prevlasso[i].has(d)) isCircleSelected = true
//               }
//             }
//             // Define the new radius based on selection
//             return isCircleSelected ? 4 : 1; // Adjust the radius values as needed
//           })
//           .attr("fill", function (d) {
//             var isCircleSelected = polygon.length > 2 ? d3.polygonContains(polygon, [x(d[0]) * currentZoomScale + coordinateShift[0], y(d[1]) * currentZoomScale + coordinateShift[1]]) : false;
//             var lasso_color = color
//             if (isCircleSelected) {
//               lasso_color = appcontext.clustercolors[lasso_counter]
//             }
//             for (var i = 0; i < prevlasso.length; i++) { // goes through all of the previously lassoed points
//               if (prevlasso[i].has(d)) {
//                 lasso_color = appcontext.clustercolors[i]
//               }
//             }
//             return lasso_color;
//           });


//       }
//     }

//     const lassoModeOn = (event) => { // lasso mode on while shift key pressed
//       if (event.shiftKey) {
//         lasso_counter = (lasso_counter + 1) % 100

//         if (lassoed.size != 0) { // updates the list of previous lassoes 
//           // prevlasso.push(new Set(lassoed));
//           // lassoed.clear() // empties the set that contains the current lasso
//           const updatedPrevLassoes = [...prevlasso];

//           // Push the new Set containing lassoed data
//           updatedPrevLassoes.push(new Set(lassoed));

//           // Update the state with the updated value of prevlasso
//           setPrevlasso(updatedPrevLassoes);

//           // Clear the lassoed data
//           setLassoed(new Set());
//         }

//         console.log("ON")
//         isLassoOn = true;
//         svg.call(lasso().on("start lasso end", draw)); // TURNS ON LASSO
//       }
//     }

//     const lassoModeOff = () => {
//       console.log("OFF")
//       isLassoOn = false;
//     }

//     window.addEventListener('keydown', lassoModeOn);
//     window.addEventListener('keyup', lassoModeOff)


//     ///--------

//     //TURN ON Zoom Functionality
//     svg.call(
//       d3
//         .zoom()
//         .extent([[0, 0], [width, height]])
//         .scaleExtent([0.5, 10]) // can change how much to zoom 
//         .on("zoom", zoomed)
//     );

//     function zoomed({ transform }) {
//       if (!isLassoOn) {
//         g.attr("transform", transform);
//         console.log("transform", transform)
//         currentZoomScale = transform.k
//         coordinateShift = [transform.x, transform.y]
//         // l.attr("transform", `translate(${coordinateShift[0]},${coordinateShift[1]}) scale(${currentZoomScale})`); // SCALING THE LASSO LINE. DOESN'T WORK ALL THE TIME

//       }
//     }


//   }, [data]);

//   useEffect(() => { console.log(lassoed, prevlasso); appcontext.setPrevlasso(prevlasso) }, [prevlasso])
//   useEffect(() => { appcontext.setLassoed(lassoed) }, [lassoed])

//   useEffect(() => {
//     console.log("reset", appcontext.isLassoReset)
//     if (appcontext.isLassoReset) {
//       setLassoed(new Set())
//       setPrevlasso([])
//       circlesRef.current.attr("r", function (d) {
//         return 1; // Reset the radius to its original value
//       }).attr("fill", function (d) {
//         return color; // Reset the fill color to the default color
//       });
//       appcontext.setIsLassoReset(false)
//     }
//   }, [appcontext.isLassoReset])

//   return (
//     <div>
//       <svg ref={svgRef} width={width} height={height}></svg>
//     </div>
//   );
// }

// export default LassoSelectionCanvas;

//____________

// import React, { useRef, useEffect, useState, useContext } from "react";
// // import * as d3 from "d3";
// // import * as d3lasso from "d3-lasso"
// import d3 from "./d3-extended"
// import lasso from "./d3-lasso-adapted"
// import { AppContext } from "../../AppContext";

// function LassoSelectionCanvas({ data, width, height }) {
//   const appcontext = useContext(AppContext);

//   let x = d3.scaleLinear().range([0, width]),
//     y = d3.scaleLinear().range([0, height]);

//   var d_extent_x = d3.extent(data, (d) => +d[0]),
//     d_extent_y = d3.extent(data, (d) => +d[1]);

//   // Draw axes
//   x.domain(d_extent_x);
//   y.domain(d_extent_y);

//   var currentZoomScale = 1
//   var coordinateShift = [0, 0]
//   var lasso_counter = -1

//   const svgRef = useRef(null);

//   var color = 'black' // default color for the circles, TODO: Change later
//   const circlesRef = useRef(null);

//   useEffect(() => {
//     const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);
//     var isLassoOn = false;
//     const path = d3.geoPath() // NEW
//     const l = svg.append("path").attr("class", "lasso") //NEW
//     const g = svg.append("g")
//       .attr("class", "circles");

//     // styling the circles, when not hovered and hovered
//     g.append("style").text(`
//       .circles {
//         stroke: transparent;
//         stroke-width: 4px;
//       }
//       .circles circle:hover {
//         stroke: green;
//         stroke-width: 20px;
//         stroke-opacity: 0.5;
//         r: 8;
//       }
//     `);

//     // Drawing all circles
//     circlesRef.current = g.selectAll("circle")
//       .data(data)
//       .join("circle")
//       .attr("cx", ([cx]) => x(cx))
//       .attr("cy", ([, cy]) => y(cy))
//       .attr("r", 1)
//       .attr("fill", color)

//     circlesRef.current.append("title")
//       .text((d, i) => d[2])

//     // NEW Lasso Functionality ------

//     const initialStyles = ".lasso { fill-rule: evenodd; fill-opacity: 0.1; stroke-width: 1.5; stroke: #000; }"
//     svg.append("defs").append("style").text(initialStyles);

//     function draw(polygon) {

//       if (isLassoOn) {
//         l.datum({
//           type: "LineString",
//           coordinates: polygon
//         }).attr("d", path);

//         // Update the attributes of the selected circles
//         circlesRef.current = circlesRef.current.join("circle")
//           .attr("r", function (d) {
//             // Check if the circle is selected based on the lasso selection
//             var isCircleSelected = polygon.length > 2 ? d3.polygonContains(polygon, [x(d[0]) * currentZoomScale + coordinateShift[0], y(d[1]) * currentZoomScale + coordinateShift[1]]) : false;
//             if (isCircleSelected) {
//               appcontext.setLassoed(appcontext.lassoed.add(d))
//             }
//             else {
//               for (var i = 0; i < appcontext.prevlasso.length; i++) { // goes through all of the previously lassoed points
//                 if (appcontext.prevlasso[i].has(d)) isCircleSelected = true
//               }
//             }
//             // Define the new radius based on selection
//             return isCircleSelected ? 4 : 1; // Adjust the radius values as needed
//           })
//           .attr("fill", function (d) {
//             var isCircleSelected = polygon.length > 2 ? d3.polygonContains(polygon, [x(d[0]) * currentZoomScale + coordinateShift[0], y(d[1]) * currentZoomScale + coordinateShift[1]]) : false;
//             var lasso_color = color
//             if (isCircleSelected) {
//               lasso_color = appcontext.clustercolors[lasso_counter]
//             }
//             for (var i = 0; i < appcontext.prevlasso.length; i++) { // goes through all of the previously lassoed points
//               if (appcontext.prevlasso[i].has(d)) {
//                 lasso_color = appcontext.clustercolors[i]
//               }
//             }
//             return lasso_color;
//           });


//       }
//     }

//     const lassoModeOn = (event) => { // lasso mode on while shift key pressed
//       if (event.shiftKey) {
//         lasso_counter = (lasso_counter + 1) % 100

//         if (appcontext.lassoed.size != 0) { // updates the list of previous lassoes 
//           // Didn't work when I used setPrevlasso and setLassoed functions
//           appcontext.prevlasso.push(new Set(appcontext.lassoed));
//           appcontext.lassoed.clear() // empties the set that contains the current lasso
//           // appcontext.setPrevlasso([...appcontext.prevlasso, appcontext.lassoed])
//           // appcontext.setLassoed(new Set())
//         }

//         console.log("ON")
//         isLassoOn = true;
//         svg.call(lasso().on("start lasso end", draw)); // TURNS ON LASSO
//       }
//     }

//     const lassoModeOff = () => {
//       console.log("OFF")
//       isLassoOn = false;
//     }

//     window.addEventListener('keydown', lassoModeOn);
//     window.addEventListener('keyup', lassoModeOff)


//     ///--------

//     //TURN ON Zoom Functionality
//     svg.call(
//       d3
//         .zoom()
//         .extent([[0, 0], [width, height]])
//         .scaleExtent([0.5, 10]) // can change how much to zoom 
//         .on("zoom", zoomed)
//     );

//     function zoomed({ transform }) {
//       if (!isLassoOn) {
//         g.attr("transform", transform);
//         console.log("transform", transform)
//         currentZoomScale = transform.k
//         coordinateShift = [transform.x, transform.y]
//         // l.attr("transform", `translate(${coordinateShift[0]},${coordinateShift[1]}) scale(${currentZoomScale})`); // SCALING THE LASSO LINE. DOESN'T WORK ALL THE TIME

//       }
//     }

//     // RESET: IF RESET BUTTON IS PRESSED, THEN REMOVE ALL "selected" TAG ON THE CIRCLE OBJECT, ALSO EMPTY THE selected SET
//     // currently, there is the appcontext.prevlasso, but now that is the selected set. can we get rid of prevlasso (not used elsewhere)
//     // and just work with selected set? we can also store it in appcontext if that's helpful later. 
//     // basic idea: 
//     // 1) create a resetLasso boolean useState in AppContext
//     // 2) set resetLasso = True when reset button is pressed
//     // 3) when resetLasso == True, then here, make selected set empty, and also get rid of selected tags from all the circles
//     // 4) set resetLasso = False at the end here


//   }, [data]);

//   useEffect(() => { console.log('prevlassochanged', appcontext.prevlasso) }, [appcontext.prevlasso])

//   useEffect(() => {
//     console.log('circle', circlesRef.current)
//     console.log("reset", appcontext.isLassoReset)
//     if (appcontext.isLassoReset) {
//       appcontext.lassoed.clear()
//       appcontext.setPrevlasso([])
//       // appcontext.prevlasso = []
//       console.log(appcontext.lassoed, appcontext.prevlasso)
//       circlesRef.current.attr("r", function (d) {
//         return 1; // Reset the radius to its original value
//       }).attr("fill", function (d) {
//         return color; // Reset the fill color to the default color
//       });
//       appcontext.setIsLassoReset(false)
//     }
//   }, [appcontext.isLassoReset])

//   return (
//     <div>
//       <svg ref={svgRef} width={width} height={height}></svg>
//     </div>
//   );
// }

// export default LassoSelectionCanvas;