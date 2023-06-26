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

  const appcontext = useContext(AppContext);

  const localDevURL = appcontext.localDevURL;


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
        <Navbar.Brand href="#"><h3>TextCluster Explainer</h3></Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className=  "navbar py-0 navbar-light bg-light me-auto"   
            
            navbarScroll
          >
            
            <UploadDrawer />
            
            
        <ExplanationDrawer />

        <ExploreDrawer />

        <Button variant="outline-success" onClick={handleReset}>Reset</Button>

        <ToggleButton variant="outline-success"  
          color="primary"  
            selected={appcontext.zoomselected}
          onClick={() => {
            appcontext.setZoomselected(!appcontext.zoomselected);
          }}>Zoom</ToggleButton>

          </Nav>
          
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Input Test Text"
              className="me-2"
              aria-label="Search"
              
            />
            <Button variant="outline-success">Show</Button>
          </Form>


        </Navbar.Collapse>

      </Container>

    </Navbar>
    
    <div  className='cluster-slider' style={{display:"none"}}>
    
    Clusters
    <Slider
      size="small"
      aria-label="perplexity"
      value={appcontext.clusterk}
      onChange={handleClusterKchange}
      min={0}
      max={100}
    />
  </div>

  

  </>
  );
}

export default MyNavbar;


