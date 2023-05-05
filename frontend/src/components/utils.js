import * as d3 from "d3";
import React, { useContext } from 'react';
import { AppContext } from '../AppContext';



// Storing state location data for quicker access
/*
  Schema:
  database = {
    id: {
      cx: float
      cy: float
      label: string
      originalColor: color
    }
  }
  */



let dataset = ""

// Clears SVG in the center panel when new data is uploaded
function clearSVG() {
  var svg = d3.select("#containerSVG");
  svg.selectAll("circle").remove(); // Removes plotted points
  svg.selectAll("#lasso").attr("d", ""); // Resets lasso
}




function makeColorMap(data, colorMap) {
    let uniqueCategories = new Set();
    let uniqueKeywords = new Set();
    let uniqueClusterCentroids = new Set();
  
  
    for (let item of data) {
      
      if (uniqueCategories.has(item[3])) {
        continue;
      } else {
        uniqueCategories.add(item[3]);
        uniqueKeywords.add(item[4]);
        uniqueClusterCentroids.add(item[5]);
      }
    }
    
  
  
    let categoriesArray = Array.from(uniqueCategories);
    let keywordsArray = Array.from(uniqueKeywords);
    let centroidsArray = Array.from(uniqueClusterCentroids);
  
    for (let i = 0; i < categoriesArray.length; i++) {
      colorMap[categoriesArray[i]] = [COLORS[i % 11], keywordsArray[i], JSON.parse(centroidsArray[i])] ;
    }
    
  }
const COLORS = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9', '#ffffff', '#000000'
  ];
  
// Make random id strings
function makeid(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  
  function assignColor(category, id, database, colorMap) {
    database[id].category = category;
    database[id].originalColor = colorMap[category][0];
    return colorMap[category][0];
  }

  
// Function to draw projection, called once at render time and when new data is uploaded
/*
  Schema:
  width = float
  height = float
  uploadedData = [x, y, label, color(if color column selected)]
*/

function DrawProjection(width, height, uploadedData, database, colorMap, globalDotSize, globalOpacity) {

    let data = JSON.parse(JSON.stringify(uploadedData));
    // Location var
    const MARGIN = { top: 20, right: 0, bottom: 50, left: 85 },
      SVG_X = width,
      SVG_Y = height,
      PLOT_X = SVG_X - MARGIN.right - MARGIN.left,
      PLOT_Y = SVG_Y - MARGIN.top - MARGIN.bottom;
  
    let x = d3.scaleLinear().range([MARGIN.left, PLOT_X]),
      y = d3.scaleLinear().range([PLOT_Y, MARGIN.top]);
  
  
      
    // SVG
    var svg = d3.select("#containerSVG")//.call(d3.zoom().on("zoom", function handleZoom(event) { svg.attr("transform",event.transform) }));
    //d3.select("#containerSVG").on('mousedown.zoom',null);
    // Re-setting database and colorMap and using uploaded data to draw when data has been loaded
    database = {};
   colorMap = {};
    console.log(data[0])
    if (data[0].length === 6) {
      makeColorMap(data);
    }
  
    var d_extent_x = d3.extent(data, (d) => +d[0]),
      d_extent_y = d3.extent(data, (d) => +d[1]);
  
    // Draw axes
    x.domain(d_extent_x);
    y.domain(d_extent_y);
  
    // Generate IDs for points
    for (let row of data) {
      row.push(makeid(10));
    }
  
    // Draw circles
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("g")
      .append("circle")
      .attr("r", globalDotSize)
      .attr("opacity", globalOpacity)
      .attr("id", (d) => {
        let id = d[d.length - 1];
        database[id] = { label: d[2], keyword:d[4]};
        return id;
      })
      .attr("cx", (d) => {
        let centerX = x(+d[0]);
        database[d[d.length - 1]].cx = centerX;
        return centerX;
      })
      .attr("cy", (d) => {
        let centerY = y(+d[1]);
        database[d[d.length - 1]].cy = centerY;
        return centerY;
      })
      .attr("fill", (d) => {
        if (d.length === 7) {
          return assignColor(d[3], d[6]);
        } else {
            database[d[d.length - 1]].originalColor = "black";
          return "black";
        }
      })
      .style("stroke", "black")
      .attr("class", "non-brushed");
      colorMap.x = x
      colorMap.y = y
    console.log(colorMap,x,y)
    //svg.append("g");
    //showKeywords(colorMap)
    
  }


export {
    DrawProjection,
    makeid,
    clearSVG
}