import React from 'react';
import MyNavbar from './components/navbar'
import { ProjectionView } from './components/projectionview';
import { ContextWrapper } from './AppContext';
import LassoSelectionCanvas from './components/scatterplot2';
import * as d3 from "d3";



function App() {
 
  
  return (
    <div className="App">
        <ContextWrapper>
          <MyNavbar />
      	</ContextWrapper>


    </div>
  );
}

export default App;