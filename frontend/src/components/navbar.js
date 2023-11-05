import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import RightDrawer from './rightdrawer_general';
import UploadDrawer from './leftdrawer';
import LabelSearch from './explanation'
import { AppContext } from '../AppContext';
import React, { useRef, useContext, useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import ToggleButton from '@mui/material/ToggleButton';
import CheckIcon from '@mui/icons-material/Check';





function MyNavbar() {


  function searchStringInArray(str, strArray) {
    let indices = []
    for (var j = 0; j < strArray.length; j++) {
      if (strArray[j][2].toLowerCase().match(str)) indices.push(j);

    }
    if (indices.length > 0) return indices;
    return [];
  }


  function handleSearch() {
    appcontext.setSearched([])
    if (document.getElementById("search").value) {
      let found = searchStringInArray(document.getElementById("search").value.toLowerCase(), appcontext.plottedData)
      appcontext.setSearched(found)
      console.log(found)
    }

  }

  function handleChagesearch() {
    handleSearch()

  }

  const appcontext = useContext(AppContext);
  const localDevURL = appcontext.localDevURL;
  const [openExplanation, setOpenExplanation] = React.useState(false);
  const [openExplore, setOpenExplore] = React.useState(false);
  const navbarRef = useRef(null)

  useEffect(() => {
    const navbarElement = navbarRef.current
    if (navbarElement) {
      appcontext.setNavBarHeight(navbarElement.offsetHeight)
    }
  }, [navbarRef])


  function handleReset() {
    appcontext.setIsLassoReset(true)
  }

  return (

    <>
      <Navbar ref={navbarRef} bg="light" expand="lg" >
        <Container fluid>
          <Navbar.Brand href="#"><h3>TextCluster Explainer</h3><h6>Dataset: [Vis Papers]</h6></Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />

          <Navbar.Collapse id="navbarScroll">
            <Nav
              className="navbar py-0 navbar-light bg-light me-auto"

              navbarScroll
            >

              <UploadDrawer />

              <RightDrawer
                type={"Explanation"}
                open={openExplanation}
                setOpen={setOpenExplanation}
                setOtherOpen={setOpenExplore}
              />

              <RightDrawer
                type={"Explore Your Data"}
                open={openExplore}
                setOpen={setOpenExplore}
                setOtherOpen={setOpenExplanation}
              />

              <Button variant="outline-success" onClick={handleReset}>Reset Lasso</Button>



              <ToggleButton variant="outline-success"
                style={{ display: "none" }}
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


