
import axios from "axios";
import { AppContext } from "../AppContext";
import React, { useContext, useState, useEffect} from 'react';
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import styled, { keyframes } from "styled-components";
import Slider from '@mui/material/Slider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import WordCloud from 'react-d3-cloud';
import Divider from "@mui/material/Divider";


const data = [
  { text: 'Hey', value: 1000 },
  { text: 'lol', value: 200 },
  { text: 'first impression', value: 800 },
  { text: 'very cool', value: 1000000 },
  { text: 'duck', value: 10 },
];

const localDevURL = "http://127.0.0.1:8000/";




 function Explore(data) {

  let labelDict = {};
  let SelectedItems = []
    const appcontext = useContext(AppContext);


    
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    
    

    function handleAutoCluster(event){
      appcontext.setClusterk(10)
      let req = {
        clusterThresholdDist: 8
      };
    
      axios //sending data to the backend
            .post(localDevURL + "auto-cluster", req)
            .then((response) => {
              appcontext.setPlottedData(response.data.data)
              console.log(response.data.data)
            })
            .catch((error) => {
              console.log(error);
    
            });
    
    }

    function searchStringInArray (str, strArray) {
      let indices = []
      for (var j=0; j<strArray.length; j++) {
          if (strArray[j][2].toLowerCase().match(str)) indices.push(j);
          
      }
      if (indices.length>0)return indices;
      return [];
  }
    
  
  function handleSearch(txt){
    appcontext.setSearched([])
        let found = searchStringInArray (txt.toLowerCase(), appcontext.plottedData)
        appcontext.setSearched(found)

  
    }
    function handleClusterKchange(event, newK){
      appcontext.setClusterk(newK)
      let req = {
        clusterThresholdDist: appcontext.clusterk
      };
    
      axios //sending data to the backend
            .post(localDevURL + "auto-cluster", req)
            .then((response) => {
              appcontext.setPlottedData(response.data.data)
              console.log(response.data.data)
            })
            .catch((error) => {
              console.log(error);
    
            });
    
    }

    const handleClickMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    function handleChangetopknumber(e, newtopk){
      appcontext.setTopknumber(newtopk)

  
      
      if (appcontext.lassoed.length > 0) {
        console.log(appcontext.topknumber)
      
          
          //categorizedPoints.push([idInfo.label, 1]);
  
          axios
          .post(localDevURL + "categorize-data", {
            data: JSON.stringify(appcontext.isinsidelasso),
            k: appcontext.topknumber,
          })
          .then((response) => {
            console.log("Categorized!", response.data.data);
  
            let words = response.data.data.map(function (e){
              
              return { text: e[0], value: (e[1]*30)**3 }
            })
  
            appcontext.setPoswords(words)         
            //appcontext.setMakecloud(false)
          
            
            //let newTopWords = drawClouds(response.data.data);
            //console.log(newTopWords)
            //setWordsLoading(false);
            //appcontext.setTopwords(newTopWords.positiveWords);
            // TODO: do things with response
          })
          .catch((error) => {
            console.log(error);
          });
  
      

      }
    }
  
    
    

    
    


      if (appcontext.lassoed.length > 0) {

        if (appcontext.makecloud) {

        //categorizedPoints.push([idInfo.label, 1]);

        axios
        .post(localDevURL + "categorize-data", {
          data: JSON.stringify(appcontext.isinsidelasso),
          k: appcontext.topknumber,
        })
        .then((response) => {
          console.log("Categorized!", response.data.data);

          let words = response.data.data.map(function (e){
            
            return { text: e[0], value: (e[1]*30)**3 }
          })

          appcontext.setPoswords(words)         
          appcontext.setMakecloud(false)
        
          
          //let newTopWords = drawClouds(response.data.data);
          //console.log(newTopWords)
          //setWordsLoading(false);
          //appcontext.setTopwords(newTopWords.positiveWords);
          // TODO: do things with response
        })
        .catch((error) => {
          console.log(error);
        });

      }
        appcontext.lassoed.forEach(element => {
          SelectedItems.push(
            <tr  >
              <td>{SelectedItems.length + 1}</td>
              <td  className="label">
                {element[2]}
              </td>
            </tr>
          );
          
        });
        

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

    
      


    return (
        
        <div id ="explore-div" className="explore-panel">
          <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', position:"relative", top: -12,}}> 
        <Button variant="secondary" size="sm" onClick={handleAutoCluster}>AutoCluster</Button>
      </div>
      <Divider />
              <br/>
        <div id = "positive-cloud-div"  >
        
              Show top keyyyyyy  phrases in selection
              <Form.Control
                style={{ position:"relative", top: -25, left:55,width:50}}
                size="sm"
                type="number"
                value={appcontext.topknumber}
                onChange={handleChangetopknumber}
              /> 
        
        

        {appcontext.lastselected.length > 0
              ?   <WordCloud
              data={appcontext.poswords}
              width={300}
              height={300}
              //font="Times"
              //fontStyle="italic"
              //fontWeight="bold"
              //fontSize={(word) => Math.log2(word.value) * 5}
              spiral="rectangular"
              rotate={0}
              padding={2}
              //random={Math.random}
              fill={(d, i) => 'black'}
              onWordClick={(event, d) => {
                //handleSearch(d.text)
                console.log(`onWordClick: ${d.text}`);
              }}
              onWordMouseOver={(event, d) => {
                
                console.log(`onWordMouseOver: ${d.text}`);
              }}
              onWordMouseOut={(event, d) => {
                //appcontext.setSearched([])
                console.log(`onWordMouseOut: ${d.text}`);
              }}
            />
              : null}



              
              </div>

              <Divider />
              <br/>
                  <div  className='cluster-slider' style={{display:"none"}}>
        
                    <Slider
                      size="small"
                      aria-label="autoclusters"
                      value={appcontext.clusterk}
                      onChange={handleClusterKchange}
                      min={0}
                      max={100}
                    />
                  </div>

              <Divider />
              <br/>


      <div id="explore-selection" style={{display:"block", height:"300"}}>
      
        <div id="unique-items-div">
          <p className="title">
          {appcontext.lastselected.length > 0
              ? appcontext.lastselected.length + " total unique"
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
            <tbody>{SelectedItems}</tbody>
          </Table>
        </div>
              </div>




        </div>

    
      ); 
}

export default Explore
