import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ExplanationDrawer from './rightdrawer';
import UploadDrawer from './leftdrawer';
import LabelSearch from './explanation'
import { AppContext } from '../AppContext';
import React, {useRef, useContext, useEffect} from "react";
import ExploreDrawer from './rightdrawer_explore';
import Slider from "@mui/material/Slider";
import ToggleButton from '@mui/material/ToggleButton';
import CheckIcon from '@mui/icons-material/Check';

import axios from "axios";





function MyNavbar() {


  function searchStringInArray (str, strArray) {
    let indices = []
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j][2].toLowerCase().match(str)) indices.push(j);
        
    }
    if (indices.length>0)return indices;
    return [];
}
  

function handleSearch(){
  appcontext.setSearched([])
    if (document.getElementById("search").value){
      let found = searchStringInArray (document.getElementById("search").value.toLowerCase(), appcontext.plottedData)
      appcontext.setSearched(found)
      console.log(found)
    }

  }

  function handleChagesearch(){
    handleSearch()

  }

  const appcontext = useContext(AppContext);
  const localDevURL = appcontext.localDevURL;



  
  function handleReset(){
    appcontext.setPrevlasso([])
    //appcontext.setPrevselected([])

  }
  /*
  <NavDropdown title="Display" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action3">Change Dotsize</NavDropdown.Item>
              <NavDropdown.Item href="#action4">
                Change Opacity
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5">
                Reset
              </NavDropdown.Item>
            </NavDropdown>
            */
  return (

    <>
    <Navbar bg="light" expand="lg" >
      <Container fluid>
        <Navbar.Brand href="#"><h3>TextCluster Explainer</h3><h6>Dataset: [Vis Papers]</h6></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className=  "navbar py-0 navbar-light bg-light me-auto"   
            
            navbarScroll
          >
            
          <UploadDrawer />
            
            
        <ExplanationDrawer />

        <ExploreDrawer />

        <Button variant="outline-success" onClick={handleReset}>Reset Lasso</Button>



        <ToggleButton variant="outline-success" 
         style={{display:"none"}}
          color="primary"  
            selected={appcontext.zoomselected}
          onClick={() => {
            appcontext.setZoomselected(!appcontext.zoomselected);
          }}>Zoom</ToggleButton>



          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              id="search"
              onChange={handleChagesearch}
              
              
            />
            <Button variant="outline-success" onClick={handleSearch}>Show</Button>
          </Form>



        </Navbar.Collapse>

      </Container>

    </Navbar>
    
    

  

  </>
  );
}

export default MyNavbar;


