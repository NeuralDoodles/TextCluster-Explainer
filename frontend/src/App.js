import React, { useContext} from 'react';
import MyNavbar from './components/navbar'
import { ContextWrapper } from './AppContext';
import ExplanationDrawer from './components/rightdrawer';
import ExploreDrawer from './components/rightdrawer_explore';
import UploadDrawer from './components/leftdrawer';
import Explore from './components/explore';
import { AppContext } from './AppContext';

import * as d3 from "d3";



function App() {
 
  //<MyNavbar />
//<h6>Dataset: [Vis Papers]</h6>
  return (
    <div className="App">
      <p style={{marginLeft: '1em',marginTop: '1em'}}>
        <h1 style={{ textShadow: '2px 2px 2px #888888' }}>TextCluster Explainer</h1>
        <h5 style={{  position:'relative',left:'15px'}}>An interative text clusting framework</h5>
        <h6 style={{  position:'relative',left:'15px'}}>Dataset: Viz papers 1990-2022</h6>

        </p>
        <ContextWrapper>
          <UploadDrawer />
        
          <ExplanationDrawer />

          <Explore />


      	</ContextWrapper>

        <div style={{position:"absolute", top: '96%', left: '94%'}}>
            <a href='sraval@g.harvard.edu'>Contact us</a>
        </div>
    </div>
  );
}

export default App;