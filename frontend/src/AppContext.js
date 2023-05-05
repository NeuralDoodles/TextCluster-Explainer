// Define a context that will be shared within all the app.
//Ref: https://4geeks.com/lesson/context-api

import React, { useState, useContext } from "react";
import * as d3 from "d3";
import vispubs from './datasets/vispubs.json'


export const AppContext = React.createContext(null);
// Create a ContextWrapper component that has to be the parent of every consumer.


export const ContextWrapper = (props) => {

  function makedata(width,height)
  {
    const rngx = d3.randomNormal(width / 2, Math.min(width, height) / 5),
      rngy = d3.randomNormal(height / 2, Math.min(width, height) / 5);
      let txt = "Hello";
    return Array.from({ length: 1000 }, () => [rngx(), rngy(), txt]);
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
    const [plottedData, setPlottedData] = useState(vispubs); // main variable for observable canvas
    const [prevselected, setPrevselected] = useState([])
    const [lassoed, setLassoed] = useState([])
    const [isinsidelasso, setIsinsidelasso] = useState([])
    const [getexplain, setGetexplain] = useState(false)
 
    const DEFAULT_PROMPT =
    "What is the common theme between the selected sentences?";
    
    const [apikey, setApikey] = useState("");
    const [topknumber, setTopknumber] = useState("");
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
        plottedData, setPlottedData,
        lassoed, setLassoed,
        prevselected, setPrevselected,
        xscale,setXscale,
        yscale,setYscale,
        //
        DEFAULT_PROMPT,
        localDevURL,
        //
        apikey, setApikey, 
        prompt, setPrompt,
        topknumber, setTopknumber,
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