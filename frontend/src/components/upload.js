
import "../App.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ToggleButton from '@mui/material/ToggleButton';
import CheckIcon from '@mui/icons-material/Check';



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




import { AppContext } from '../AppContext';


library.add(faCheckSquare, faSquare);


let width = window.innerWidth ;
let height = window.innerHeight - 50;



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

    const appcontext = useContext(AppContext);

    const localDevURL = appcontext.localDevURL;
    

    const fileReader = new FileReader();
    


  // Set raw file on raw file upload
  const handleRawFileChange = (e) => { 
    appcontext.setRawFile(e.target.files[0]);

    // Uses first row from CSV to create dropdown of column names
    let rows;
    fileReader.onload = function (event) {
      appcontext.setCsvOutput(event.target.result);
      

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

      console.log(colNames)
      for (let colName of colNames) {
        
        colItems.push(
          <option key={colName} value={colName}>
            {colName}
          </option>
        );
      }
      appcontext.setCsvColumns(colItems);
      appcontext.setColorCol("none");
    };

    fileReader.readAsText(e.target.files[0]);
  };

  const handleRawTxtFileChange = (e) => { 
    fileReader.onload = function (event) {
      appcontext.setTxtFile(event.target.result)
    };
    fileReader.readAsText(e.target.files[0]);
    
    }


    const handleTxtToEmb = (e) => { 
      let req = {
        text: appcontext.txtFile,
        n: appcontext.txtN
      };
      document.getElementById("progress_embed").style.display="block"
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
          document.getElementById("progress_embed").style.display="none"




    
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
      console.log(e)
      fileReader.onload = function (event) {
        console.log(JSON.parse(event.target.result))
        appcontext.setPlottedData(JSON.parse(event.target.result));
        document.getElementById("uploadnavbutton").click();
        let req = {
          data: event.target.result,
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



  const handleChangeTxtN = (e) => {
    appcontext.setTxtN(e.target.value);
  };

  const handleChangeColorCol= (e) => {
    appcontext.setColorCol(e.target.value);
  };

  const handleReductionMethodChange = (e) => {
    appcontext.setReductionMethod(e.target.value);
  };

   // Handle file projection
   const handleFileProject = (e) => {
    e.preventDefault();

    // Submits post request if there is not a request already being processed
    if (appcontext.rawFile && !appcontext.loadingData && appcontext.reductionMethod !== "none") {

      let req = {
        data: appcontext.csvOutput,
        reductionMethod: appcontext.reductionMethod,
        selectedCol: appcontext.ColorCol
      };

      // Constructing request based on reduction Method
      if (appcontext.reductionMethod === "TSNE") {
        req.perplexity = appcontext.perplexity;
      }
      document.getElementById("progress_project").style.display="block"
      axios //sending data to the backend
        .post(localDevURL + "upload-data", req)
        .then((response) => {
          //console.log("SUCCESS", response.data.data);
          appcontext.setPlottedData(response.data.data)
          document.getElementById("uploadnavbutton").click();
          document.getElementById("progress_project").style.display="none"
          appcontext.setDataset('')
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (!appcontext.rawFile) {
      alert("please upload a file");
    } else if (appcontext.reductionMethod === "none") {
      alert("please select a reduction method!");
      return;
    }
  };

    // Handles save of currently projected data
  const handleProjectionSave = (e) => {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(appcontext.plottedData)
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
                value={appcontext.txtN}
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
              <div id= "progress_embed" style={{position:'relative', left: 80,top:-105, display:"none"}}><CircularProgress />
              <Box  style={{position:'relative', left: 0,top:-10}}>
                <Typography variant="caption" component="div" color="text.secondary"> Loading</Typography>
               </Box>
               </div>  
                

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

              <Form.Select
                className="form-select input-sm"
                size="sm"
                aria-label="column-selection"
                onChange={handleReductionMethodChange}
              ></Form.Select>

              Color by column
              <Form.Control
                style={{width:60}}
                size="sm"
                type="text"
                value={appcontext.colorCol}
                onChange={handleChangeColorCol}
              />
              
        </Form.Group>

        {/* TODO: add column selector*/}
        {/* Dimensionality reduction method selection */}
        <ReductionOptions
          reductionMethod={appcontext.reductionMethod}
          perplexity={appcontext.perplexity}
          perplexityChanger={appcontext.setPerplexity}
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
              <div id= "progress_project" style={{position:'relative', left: 80,top:-35, display:"none"}}><CircularProgress />
              <Box  style={{position:'relative', left: 0,top:-5}}>
                <Typography variant="caption" component="div" color="text.secondary"> Loading</Typography>
               </Box>
               </div>  
                
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

      <LassoSelectionCanvas data = {appcontext.plottedData}/>


      </>
      
  );
};
