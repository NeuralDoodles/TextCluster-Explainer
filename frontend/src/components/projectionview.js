import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import * as d3 from "d3";

import "../App.css";
import axios from "axios";

const localDevURL = "http://127.0.0.1:8000/";
const DEFAULT_PROMPT =
  "What is the common theme between the selected sentences?";

let width = window.innerWidth ;
let height = window.innerHeight - 50;


// Line element
const Line = ({ points, drawing }) => {
    const line = useMemo(() => {
      return d3
        .line()
        .x((d) => d.x)
        .y((d) => d.y);
    }, []);
  
    var dataCopy = points;
    // console.log(points);
  
    // Closes loop if done drawing
    if (dataCopy.length > 0 && !drawing) {
      dataCopy = [...dataCopy, points[0]];
    }
  
    return (
      <path
        id="lasso"
        d={line(dataCopy)}
        style={{
          stroke: "black",
          strokeWidth: 3,
          strokeLinejoin: "round",
          strokeLinecap: "round",
          fill: "rgba(0,100,255,0.05)",
        }}
      />
    );
  };
  
  
  
export const ProjectionView= ({ x, y, width, height }) => {
  


  return (
      <svg
        id="containerSVG"
        width={width}
        height={height}>
    
      </svg>
  );
};
