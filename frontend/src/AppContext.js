// Define a context that will be shared within all the app.
//Ref: https://4geeks.com/lesson/context-api

import React, { useState, useContext } from "react";
import * as d3 from "d3";
import vispubs from './datasets/vispubs.json'


export const AppContext = React.createContext(null);
// Create a ContextWrapper component that has to be the parent of every consumer.


export const ContextWrapper = (props) => {

  function generateColor (n) {

    return Array.from({length: n}, () => '#' +  Math.random().toString(16).substr(-6));
  }
  
  let colors = [
    '#5778a4',
   '#e49444',
  '#d1615d',
   '#85b6b2',
   '#6a9f58',
 '#e7ca60',
   '#a87c9f',
   '#f1a2a9',
 '#967662',
  '#b8b0ac',
  '#5778a4',
  '#e49444',
 '#d1615d',
  '#85b6b2',
  '#6a9f58',
'#e7ca60',
  '#a87c9f',
  '#f1a2a9',
'#967662',
 '#b8b0ac',
 '#5778a4',
 '#e49444',
'#d1615d',
 '#85b6b2',
 '#6a9f58',
'#e7ca60',
 '#a87c9f',
 '#f1a2a9',
'#967662',
'#b8b0ac',
'#5778a4',
'#e49444',
'#d1615d',
'#85b6b2',
'#6a9f58',
'#e7ca60',
'#a87c9f',
'#f1a2a9',
'#967662',
'#b8b0ac',
'#5778a4',
'#e49444',
'#d1615d',
'#85b6b2',
'#6a9f58',
'#e7ca60',
'#a87c9f',
'#f1a2a9',
'#967662',
'#b8b0ac',
'#5778a4',
'#e49444',
'#d1615d',
'#85b6b2',
'#6a9f58',
'#e7ca60',
'#a87c9f',
'#f1a2a9',
'#967662',
'#b8b0ac',
'#5778a4',
'#e49444',
'#d1615d',
'#85b6b2',
'#6a9f58',
'#e7ca60',
'#a87c9f',
'#f1a2a9',
'#967662',
'#b8b0ac',
'#5778a4',
'#e49444',
'#d1615d',
'#85b6b2',
'#6a9f58',
'#e7ca60',
'#a87c9f',
'#f1a2a9',
'#967662',
'#b8b0ac',
'#5778a4',
'#e49444',
'#d1615d',
'#85b6b2',
'#6a9f58',
'#e7ca60',
'#a87c9f',
'#f1a2a9',
'#967662',
'#b8b0ac',

  ]

  function makedata(width,height)
  {
    const rngx = d3.randomNormal(width / 2, Math.min(width, height) / 5),
      rngy = d3.randomNormal(height / 2, Math.min(width, height) / 5);
      let txt = "Placeholder text";
    return Array.from({ length: 100000 }, () => [rngx(), rngy(), txt]);
  }

  // Gets centroid of set of points
function getCentroid(points) {

  var first = points[0],
    last = points[points.length - 1];
  if (first.x !== last.x || first.y !== last.y) points.push(first);
  var twicearea = 0,
    x = 0,
    y = 0,
    nPoints = points.length,
    p1,
    p2,
    f;
  for (var i = 0, j = nPoints - 1; i < nPoints; j = i++) {
    p1 = points[i];
    p2 = points[j];
    f = p1.x * p2.y - p2.x * p1.y;
    twicearea += f;
    x += (p1.x + p2.x) * f;
    y += (p1.y + p2.y) * f;
  }
  f = twicearea * 3;
  console.log(points, x,y)
  return { x: x / f, y: y / f };
}
  const [dataset, setDataset] = useState('vispubs'); // File that hasn't been projected yet
  const [txtFile, setTxtFile] = useState(); 
  const [txtN, setTxtN] = useState(50); 

    const [rawFile, setRawFile] = useState(); // File that hasn't been projected yet
    const [reductionMethod, setReductionMethod] = useState("none");
    const [perplexity, setPerplexity] = useState(50);
    const [csvOutput, setCsvOutput] = useState("");
    const [csvColumns, setCsvColumns] = useState([
      <option key="select-a-column" value="select-a-column">
        select a column to color dots by
      </option>,
    ]); //reset
    const [colorCol, setColorCol] = useState("none");
    //For making projections
    const [xscale,setXscale] = useState()
    const [yscale,setYscale] = useState()
    const [zoomselected,setZoomselected] = useState(false)
    const [zoomscale,setZoomscale] = useState(1)
    const [cameraOffset,setCameraOffset] = useState({ x: 0, y: 0 })
    const [plottedData, setPlottedData] = useState(vispubs); // main variable for observable canvas
    const [prevselected, setPrevselected] = useState([])
    const [lastselected, setLastselected] = useState([])
    const [clusterk, setClusterk] = useState(1)


    const [clustercolors, setClustercolors] = useState(colors)
    const [autoclustercolors, setAutoclustercolors] = useState(colors)

    
    const [searched, setSearched] = useState([])

    const [prevlasso, setPrevlasso] = useState([])
    const [lassoed, setLassoed] = useState([])
    const [lassocentroid, setLassocentroid] = useState([])
    const [isinsidelasso, setIsinsidelasso] = useState([])
    const [getexplain, setGetexplain] = useState(false)
 
    const DEFAULT_PROMPT =
    "What is the common theme between the selected sentences?";
    
    const [apikey, setApikey] = useState("");
    const [topknumber, setTopknumber] = useState(30);
    const [makecloud, setMakecloud,] = useState(false);
    const [poswords, setPoswords] = useState([]);
    const [topwords, setTopwords] = useState([]);
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [langexplanation, setLangexplanation] = useState(
      "Select points to see an explanation"
    );

    const [testtext, setTesttext] = useState(DEFAULT_PROMPT);



    const localDevURL = "http://127.0.0.1:8000/";





    const value = {
        dataset, setDataset,
        rawFile, setRawFile,
        txtN, setTxtN,
        txtFile, setTxtFile,
        csvOutput, setCsvOutput,
        csvColumns, setCsvColumns,
        colorCol, setColorCol,
        reductionMethod, setReductionMethod,
        perplexity, setPerplexity,

        //
        zoomscale,setZoomscale,
        zoomselected,setZoomselected,
        cameraOffset,setCameraOffset,
        plottedData, setPlottedData,
        lassoed, setLassoed,
        lassocentroid, setLassocentroid,
        searched, setSearched,
        prevlasso, setPrevlasso,
        prevselected, setPrevselected,
        lastselected, setLastselected,
        clustercolors, setClustercolors,
        autoclustercolors, setAutoclustercolors,
        clusterk, setClusterk,
        xscale,setXscale,
        yscale,setYscale,
        //
        DEFAULT_PROMPT,
        localDevURL,
        //
        apikey, setApikey, 
        prompt, setPrompt,
        topknumber, setTopknumber,
        makecloud, setMakecloud,
        poswords, setPoswords,
        topwords, setTopwords,
        langexplanation, setLangexplanation,
        isinsidelasso, setIsinsidelasso,
        getexplain, setGetexplain,
        testtext, setTesttext,

      };
	
	return (
		<AppContext.Provider value={value}>
			{props.children}
		</AppContext.Provider>
	);
}