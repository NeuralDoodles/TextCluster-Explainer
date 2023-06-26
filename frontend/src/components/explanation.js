
import axios from "axios";
import { AppContext } from "../AppContext";
import React, { useContext, useState, useEffect} from 'react';
import { drawClouds } from "./phraseclouds";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import styled, { keyframes } from "styled-components";
import Slider from "@mui/material/Slider";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


function addlabel(label, center){
  var canvas = document.getElementById('labels')
  var context = canvas.getContext('2d');
  context.font = "15px Georgia";
  let w = context.measureText(label).width;
  context.fillText(label, center[0]-w/2,center[1]-10);
}


  // Gets centroid of set of points
  function getCentroid(arr) {

    
   
    var x = arr.map (xy => xy[0]);
    var y = arr.map (xy => xy[1]);
    var cx = (Math.min (...x) + Math.max (...x)) / 2;
    var cy = (Math.min (...y) + Math.max (...y)) / 2;
    console.log(arr,cx,cy)
    return [cx, cy];

  }

function clearSelectedMatchingPoints() {
  }

  function findMatchingPoints(substring) {
  }

// Reset projection to original state
function reset() {
  }
  

const LabelSearch = () => {
    const [substring, setSubstring] = useState("");
  
    const handleSubstringChange = (e) => {
      setSubstring(e.target.value);
    };
  
    const enterSubmit = (e) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    };
  
    const handleSubmit = () => {
      clearSelectedMatchingPoints();
      reset();
      findMatchingPoints(substring);
    };
  
    const handleReset = () => {
      clearSelectedMatchingPoints();
      reset();
    };
  
    return (
      <>
        <Form.Group className="mb-3" controlId="findSubstring">
            
          <div className="button-box">
            <Form.Control
              type="substring"
              size="sm"
              placeholder="Enter Keywords"
              onChange={handleSubstringChange}
              onKeyPress={enterSubmit}
            />
            <Button
              size="sm"
              variant="secondary"
              type="submit"
              onClick={handleSubmit}
            >
              Search
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              className="resetButton"
              onClick={handleReset}
            >
              reset
            </Button>
          </div>
        </Form.Group>
      </>
    );
  };

const toggleExpDiv = (e, id, txt) => {
    ["cloud-div","explain-test"].map(id => document.getElementById(id).style.display = "none")

    document.getElementById('explanation-type').textContent = txt
    var x = document.getElementById(id);
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }





 function Explain(data) {
    var selectedtext = []
    const appcontext = useContext(AppContext);
    const localDevURL = appcontext.localDevURL;



    
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    const [selectedItems, setSelectedItems] = useState([]);

function drawTestProjection(point){

        

        const canvas2 = document.getElementById('scatterplot');
        const ctx = canvas2.getContext('2d');

    
        ctx.beginPath();
        ctx.arc(appcontext.xscale(+point[0][0]),appcontext.yscale(+point[0][1]), 8, 0, 2 * Math.PI);
        ctx.stroke()      
        ctx.fillStyle = 'salmon';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    
    
      }
    

function handleChangetopknumber(e, newtopk){
    appcontext.setTopknumber(newtopk)
    axios
        .post(localDevURL + "categorize-data", {
          data: JSON.stringify(data.data),
          k: newtopk,
        })
        .then((response) => {
          console.log("Categorized!", response.data.data);
          let newTopWords = drawClouds(response.data.data);
          //context.setTopWords(newTopWords);
        })
        .catch((error) => {
          console.log(error);
        });
  }

  const handleChangeText = (e) => {
    appcontext.setTesttext(e.target.value)
};
const handleTextClick = (e) => {
    axios
      .post(localDevURL + "test-projection", {
        text: appcontext.testtext,
        dataset: appcontext.dataset
  
      })
      .then((response) => {
        console.log(response.data.data)
        drawTestProjection(response.data.data)
      })
      .catch((error) => {
        console.log(error);
      });
  };



    const handleClickMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    
    const handleClose = (e,id, txt) => {
        if (id !=""){toggleExpDiv(e, id, txt)}
        setAnchorEl(null);
    }
    
    
    
  
/*// Generates table items if there are selected points
  useEffect(() => {
    if (selectedPoints.length > 0) {
      let labelDict = {};

      // Calculates centroid of lassoed area
      console.log(pathPoints,selectedPoints)

      let centroid = {x:0, y:0}

      if (pathPoints.length != 0) {
        let centroid = getCentroid(pathPoints);

      }

      for (let point of selectedPoints) {
        // Creates ids for a table item, if there are multiple of the same label, this allows you to map from the table item to the labels
        if (point.label in labelDict) {
          labelDict[point.label].id =
            labelDict[point.label].id + " " + point.id;
        } else {
          labelDict[point.label] = { id: point.id };
        }

        // Calculates distance from the centroid of the lassoed area to the point
        labelDict[point.label].distFromCentroid = Math.sqrt(
          (point.cx - centroid.x) ** 2 + (point.cy - centroid.y) ** 2
        );
      }

      // Sorts labels by distance from the centroid
      let labelsArray = Object.entries(labelDict);
      labelsArray.sort(function (a, b) {
        return a[1].distFromCentroid - b[1].distFromCentroid;
      });

      let newSelectedItems = [];
      for (let [label, countInfo] of labelsArray) {
        // Highlights top words in the label if topwords is populated
        if (topWords.positiveWord !== null) {
          let splitLabel = label.split(" ");
          for (let i = splitLabel.length - 1; i > -1; i--) {
            let lowercaseCopy = splitLabel[i]
              .toLowerCase()
              .replace(/[.,/#!$?%^&*;:"{}=\-_`~()]/g, "");

            switch (lowercaseCopy) {
              case topWords.positiveWords[0]:
                splitLabel[i] = (
                  <mark key={countInfo.id} className="positive-mark-1">
                    {splitLabel[i]}
                  </mark>
                );
                break;
              case topWords.positiveWords[1]:
                splitLabel[i] = (
                  <mark key={countInfo.id} className="positive-mark-2">
                    {splitLabel[i]}
                  </mark>
                );
                break;
              case topWords.positiveWords[2]:
                splitLabel[i] = (
                  <mark key={countInfo.id} className="positive-mark-3">
                    {splitLabel[i]}
                  </mark>
                );
                break;
              case topWords.negativeWord:
                splitLabel[i] = (
                  <mark key={countInfo.id} className="negative-mark">
                    {splitLabel[i]}
                  </mark>
                );
                break;
              default:
                break;
            }

            // Adds space
            if (i === splitLabel.length - 1) {
              continue;
            } else {
              splitLabel.splice(i + 1, 0, " ");
            }
          }
          label = splitLabel;
          // console.log("newLabel", lab el);
        }
        newSelectedItems.push(
          <tr key={countInfo.id} onClick={(e) => highlightLabel(e)}>
            <td>{newSelectedItems.length + 1}</td>
            <td id={countInfo.id} className="label">
              {label}
            </td>
          </tr>
        );
      }

      setSelectedItems(newSelectedItems);
    } // Update selected items if selection is cleared
    else if (selectedPoints.length === 0 && selectedItems.length > 0) {
      setSelectedItems([]);
    }
  }, [appcontext.lassoed, appcontext.topwords]);

    */


  const handleReset = () => {
    appcontext.setPrompt(appcontext.DEFAULT_PROMPT);
    document.querySelector("#promptTextArea").value = "";
  };


  const handleChangePrompt = (e) => {
    appcontext.setPrompt(e.target.value);
  };

  const handleChangeKey = (e) => {
    console.log("setting key value:", e.target.value);
    appcontext.setApikey(e.target.value);
  };


  const handleNewPrompt = (e) => {
    if (appcontext.prompt !== "") {
      appcontext.setPrompt(appcontext.prompt);
    }
    //document.querySelector("#promptTextArea").value = "";
  };





    if (data.getexplain){

        for (const d of data.selected) {
            selectedtext.push(d[2]);
         }

    
        /*axios
        .post(localDevURL + "categorize-data", {
          data: JSON.stringify(data.data),
          k: 30,
        })
        .then((response) => {
          console.log("Categorized!", response.data.data);
          let newTopWords = drawClouds(response.data.data);
          //context.setTopWords(newTopWords);
        })
        .catch((error) => {
          console.log(error);
        });*/
        
        axios
        .post(localDevURL + "GPT-explanation", {
          apiKey: appcontext.apikey,
          selectedtext: JSON.stringify([appcontext.prompt, ...selectedtext]),
        })
        .then((response) => {
          console.log(response, getCentroid(appcontext.lassoed))
          appcontext.setLangexplanation(response.data);
          var centroid = getCentroid(appcontext.lassoed)
          addlabel(response.statusText, centroid)
          

        })
        .catch((error) => {
          console.log(error);
        });

    }

    
      


    return (
        
        <div id ="explain-div" className="explain-panel">

        <Button
        variant="light"
        id="menu-buttion-1"
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClickMenu}
      >
      <h5 id="explanation-type"> Test New Input</h5>
      </Button>
      <Menu
        id="menu-1"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={(e) => { handleClose(e,  "cloud-div", "Explanation as Keywords");}}>Explanation as Keywords </MenuItem>
        <MenuItem onClick={(e) => { handleClose(e, "explain-test", "Test New Input");}}> Test New Input </MenuItem>

      </Menu>


      <div id="cloud-div">
      
        <div id="positive-cloud-div"style={{display:'none'}} >
        <Slider
            aria-label="Word Cloud number"
            valueLabelDisplay="auto"
            value={appcontext.topknumber}
            onChange={handleChangetopknumber}
            step={1}
            marks
            min={5}
            max={50}
          />
          </div>

        
      </div>

      <div id="explain-test" style={{display:'block'}}>


      <Form.Control
            className="form-control"
            id="TestProjectionArea"
            size="sm"
            as="textarea"
            placeholder={"Enter Text Here to creat new projection point"}
            onChange={handleChangeText}
          ></Form.Control>
          <p></p>
      <Button
            size="sm"
            variant="secondary"
            type="submit"
            onClick={handleTextClick}>
            Show
          </Button>
        <hr />
        <Form.Group>
        <h5 id="explanation-type"> Natural Language Explanation</h5>
          <Form.Control
            className="form-control"
            id="promptTextArea"
            size="sm"
            as="textarea"
            rows={3}
            value={appcontext.prompt}
            onChange={handleChangePrompt}
          ></Form.Control>

          <div className="button-box" style={{position:"relative",top:10}}>
            <Button
              size="sm"
              variant="secondary"
              type="submit"
              onClick={handleNewPrompt}
            >
              Set Prompt
            </Button>
            <Button
              style={{position:"relative", left:130}}
              size="sm"
              variant="outline-secondary"   
              className="resetButton"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </Form.Group>
        <Form.Control
            style={{position:"relative",top:20}}
            className="form-control"
            id="explanation"
            size="sm"
            as="textarea"
            rows={8}
            value={appcontext.langexplanation}
            //onChange={handleChangeExplanation}
          ></Form.Control>
      </div>

        
      <div id="apikey" style={{position:'relative', left:0,}}>
      <Form.Control
            className="form-control"
            size="sm"
            value={appcontext.apikey === "" ? "OpenAI API Key" : appcontext.apikey}
            onChange={handleChangeKey}
          ></Form.Control>
        </div>


      <div id="explore-selection" style={{display:"none"}}>

<div id="unique-items-div">
  <p className="title">
    {selectedItems.length > 0
      ? selectedItems.length + " total unique"
      : 0}{" "}
    items
  </p>
</div>
<div className="tableDiv">
  <Table bordered>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
      </tr>
    </thead>
    <tbody>{selectedItems}</tbody>
  </Table>
</div>
</div>
        </div>

    
      ); 
}

export default Explain
