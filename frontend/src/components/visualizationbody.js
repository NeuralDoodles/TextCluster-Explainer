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
import LassoSelectionCanvas from './scatterplot/scatterplot_enako';

function MyViz() {
  const appcontext = useContext(AppContext)

  function getScreenSize(navBarHeight) {
    return {
      width: window.innerWidth,
      height: window.innerHeight - navBarHeight,
    };
  }

  const [screenSize, setScreenSize] = useState(null)
  const [foundNavBarHeight, setFoundNavBarHeight] = useState(false)


  useEffect(() => {
    if (appcontext.navBarHeight) {
      setFoundNavBarHeight(true)
    }
  }, [appcontext.navBarHeight])

  useEffect(() => { //dynamically resizes the scatter plot canvas
    if (foundNavBarHeight) {
      function handleResize() {
        setScreenSize(getScreenSize(appcontext.navBarHeight)); //adjusts height by height of navbar
      }

      handleResize()

      // Add a resize event listener
      window.addEventListener("resize", handleResize);

      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [foundNavBarHeight]);

  return (
    <>
      {
        (screenSize === null) ?
          <div> Loading... </div> :
          <LassoSelectionCanvas
            data={appcontext.plottedData}
            width={screenSize.width}
            height={screenSize.height}
          />
      }

    </>

  )
}


export default MyViz