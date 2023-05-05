
import "../App.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";

import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";
import neurips from '../datasets/neurips.json';
import restaurants from '../datasets/restaurants.json';
import ag_news from '../datasets/ag_news.json';
import emotion from '../datasets/emotion.json';
import * as d3 from "d3";
import LassoSelectionCanvas from './scatterplot2';


import React, { useContext, useState } from 'react';
import { 
    DrawProjection,
    clearSVG,
} from "./utils";




import { AppContext } from '../AppContext';


library.add(faCheckSquare, faSquare);

const localDevURL = "http://127.0.0.1:8000/";
let width = window.innerWidth ;
let height = window.innerHeight - 50;

const LoadDataCircle = ({ loadingData }) => {
  if (!loadingData) {
    return <div></div>;
  } else {
    return <CircularProgress />;
  }
};


const ReductionOptions = ({
  reductionMethod,
  perplexity,
  perplexityChanger,
}) => {
  // Handle perplexity changes
  const handlePerplexityChange = (event, newPerplexity) => {
    if (newPerplexity !== perplexity) {
      perplexityChanger(newPerplexity);
    }
  };

  if (reductionMethod === "TSNE") {
    return (
      <div className="sliderBlock">
        <p>Perlexity</p>
        <Slider
          size="small"
          aria-label="perplexity"
          value={perplexity}
          onChange={handlePerplexityChange}
          min={0}
          max={100}
        />
        <p className="paramValue">{perplexity}</p>
      </div>
    );
  } else if (reductionMethod === "UMAP") {
    return <div></div>;
  } else {
    return <div></div>;
  }
};

// Item in the category key
const KeyItem = ({ props }) => {
  const [checked, setChecked] = useState(true);
  const [checkedlabel, setCheckedLabel] = useState(props.label);

  const handleClick = () => {
    setChecked(!checked);
    let slider = document.getElementById('explanation-slider')
    slider.value = props.label;
    console.log(slider.value)
    console.log(document.getElementById('explanation-slider'))

  };

  return (
    <div className="key-item" onClick={handleClick} spin>
      {/* Custom checkbox */}
      <FontAwesomeIcon
        icon={checked ? "check-square" : "square"}
        color={checked ? props.color : "#FAFAFA"}
      />
      <p>{props.label+" : "+props.keywords}</p>
    </div>
  );
};

// Data upload + control panel
export const Upload = () => {

    const context = useContext(AppContext);
    

    const fileReader = new FileReader();
    


  // Set raw file on raw file upload
  const handleRawFileChange = (e) => { 
    context.setRawFile(e.target.files[0]);

    // Uses first row from CSV to create dropdown of column names
    let rows;
    fileReader.onload = function (event) {
      context.setCsvOutput(event.target.result);
      console.log(context.csvOutput)


      rows = event.target.result.split("\n");

      let colNames = rows[0].split(",");

      let colItems = [
        <option key="select-a-column" value="select-a-column">
          select a column to color dots by
        </option>,
        <option key="none" value="none">
          none
        </option>,
      ];

      for (let colName of colNames) {
        colItems.push(
          <option key={colName} value={colName}>
            {colName}
          </option>
        );
      }
      context.setCsvColumns(colItems);
      context.setColorCol("none");
    };

    fileReader.readAsText(e.target.files[0]);
  };

  const handleRawTxtFileChange = (e) => { 
    fileReader.onload = function (event) {
      context.setTxtFile(event.target.result)
    };
    fileReader.readAsText(e.target.files[0]);
    
    }


    const handleTxtToEmb = (e) => { 
      let req = {
        text: context.txtFile,
        n: context.txtN
      };
      axios //sending data to the backend
      .post(localDevURL + "generate-embeddings", req)
      .then((response) => {
          let  data = response.data.data
          //console.log(data.unshift(response.data.columns))
          
          let req = {
            data: JSON.stringify(data),
            reductionMethod: "UMAP",
          };
           data = data.map(function(value,index) { 
             value[0] =  "\""+value[0].replace(/"/g, '""')+"\"";
            return value
          });
          
            
        
          let csvContent = "data:text/csv;charset=utf-8," +response.data.columns.join(",")+"\n"
          + data.map(e => e.join(",")).join("\n");

          console.log(csvContent)
          const link = document.createElement("a");
          link.href = csvContent;
          link.download = "embeddings.csv";
          link.click();



    
          /*
    
          axios //sending data to the backend
            .post(localDevURL + "upload-data", req)
            .then((response) => {
              //console.log("SUCCESS", response.data.data);
              context.setPlottedData(response.data.data)
              document.getElementById("uploadnavbutton").click();
            })
            .catch((error) => {
              console.log(error);
            })*/
      })
          
      .catch((error) => {
        console.log(error);
      });  
      }
  






  // Set projected file on projected file upload
  const handleProjectedFileChange = (e) => {
      fileReader.onload = function (event) {
        console.log(JSON.parse(event.target.result))
        context.setPlottedData(JSON.parse(event.target.result));
        document.getElementById("uploadnavbutton").click();
        let req = {
          data: JSON.stringify(event.target.result),
        };
  
        axios //sending data to the backend
          .post(localDevURL + "quickload", req)
          .then((response) => {
           console.log('Done')
          })
          .catch((error) => {
            console.log(error);
          });  
          
      };
      console.log(e)
      fileReader.readAsText(e.target.files[0]);
      
    };

  const handleColChange = (e) => {
    context.SetselectedCol(e.target.value);
  };

  const handleChangeTxtN = (e) => {
    context.setTxtN(e.target.value);
  };

  const handleReductionMethodChange = (e) => {
    context.setReductionMethod(e.target.value);
  };

   // Handle file projection
   const handleFileProject = (e) => {
    e.preventDefault();

    // Submits post request if there is not a request already being processed
    if (context.rawFile && !context.loadingData && context.reductionMethod !== "none") {

      let req = {
        data: context.csvOutput,
        reductionMethod: context.reductionMethod,
        selectedCol: context.ColorCol
      };

      // Constructing request based on reduction Method
      if (context.reductionMethod === "TSNE") {
        req.perplexity = context.perplexity;
      }

      axios //sending data to the backend
        .post(localDevURL + "upload-data", req)
        .then((response) => {
          //console.log("SUCCESS", response.data.data);
          context.setPlottedData(response.data.data)
          document.getElementById("uploadnavbutton").click();
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (!context.rawFile) {
      alert("please upload a file");
    } else if (context.reductionMethod === "none") {
      alert("please select a reduction method!");
      return;
    }
  };

    // Handles save of currently projected data
  const handleProjectionSave = (e) => {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(context.plottedData)
      )}`;
      // console.log(plottedData);
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "projectionview.json";
      link.click();
    };



  return (
    <>
      
      <div id ="upload-div" className="upload-panel">
      <h6>UPLOAD TEXT FILE</h6>
      <Form.Group controlId="formFile" className="mb-3" style={{height:80}}>
              <Form.Control
              style={{position:'relative', width:200}}
                className="form-control input-sm"
                size="sm"
                type="file"
                accept=".txt"
                onChange={handleRawTxtFileChange}
              />
              
              <p style={{position:'relative', left:215, top:-50,width:200}}>
              Embed First
              <Form.Control
                style={{width:60}}
                size="sm"
                type="number"
                value={context.txtN}
                onChange={handleChangeTxtN}
              />sentences</p>



      <Button
                style={{position:'relative', top:-70}}
                size="sm"
                id="dataUploadButton"
                variant="secondary"
                onClick={(e) => {
                  handleTxtToEmb(e);
                  }}
              >
                Embed
              </Button>

              </Form.Group>
        <hr/>
      <h6>UPLOAD EMBEDDINGS FILE</h6>
        {/* File selection */}
        <Form.Group controlId="formFile" className="mb-3">
              <Form.Control
                className="form-control input-sm"
                size="sm"
                type="file"
                accept=".csv"
                onChange={handleRawFileChange}
              />
              <Form.Select
                className="form-select input-sm"
                size="sm"
                aria-label="column-selection"
                onChange={handleColChange}
              >
                {context.csvColumns}
              </Form.Select>
              <Form.Select
                className="form-select input-sm"
                size="sm"
                aria-label="column-selection"
                onChange={handleReductionMethodChange}
              >
                <option key="none" value="none">
                  select a reduction method
                </option>
                <option key="TSNE" value="TSNE">
                  T-SNE
                </option>
                <option key="UMAP" value="UMAP">
                  UMAP
                </option>
              </Form.Select>
        </Form.Group>

        {/* TODO: add column selector*/}
        {/* Dimensionality reduction method selection */}
        <ReductionOptions
          reductionMethod={context.reductionMethod}
          perplexity={context.perplexity}
          perplexityChanger={context.setPerplexity}
            />
        <div className="submitButton">
              <Button
                size="sm"
                id="dataUploadButton"
                variant="secondary"
                onClick={(e) => {
                    handleFileProject(e);
                  }}
              >
                Project
              </Button>
              <LoadDataCircle loadingData={null} />
        </div>
        <hr />
        {/* Use previously cached projection */}
        <h6>LOAD PROJECTION</h6>

        <Form.Group controlId="previousProjectionFile" className="mb-3">
        <Form.Control
          className="form-control input-sm"
          size="sm"
          type="file"
          accept=".json"
          onChange={handleProjectedFileChange}
        />
      </Form.Group>
      <div className="button-box">
        
        <hr />
        <Button
          size="sm"
          id="bookmarkButton"
          variant="outline-secondary"
          onClick={handleProjectionSave}
        >
          Download Projection
        </Button>
        </div>
      </div>

      <LassoSelectionCanvas data = {context.plottedData}/>
      
      </>
      
  );
};
