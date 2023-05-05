import React, {useRef, useContext, useEffect} from "react";
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "./lasso_canvas";
import * as d3 from "d3";
import { AppContext } from '../AppContext';







function LassoSelectionCanvas(data) {
  console.log(data.data)
  const context = useContext(AppContext);
  const selectedRef = useRef();
  const viewofRef = useRef();




  useEffect(() => {
    const runtime = new Runtime();
    const main = runtime.module(define, name => {
      if (name === "viewof state") return new Inspector(viewofRef.current);
    });
    console.log(main);
    context.setMain(main)
    main.redefine("data", data.data);

    return () => { runtime.dispose();}
    
  }, []);

  
  return (
    <>
        <canvas id="canvas" width="1000" height="500"></canvas>

      <div ref={viewofRef} />
    </>
  );
}



export default LassoSelectionCanvas;


