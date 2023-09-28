import React from 'react';
import MyNavbar from './components/navbar'
import { ProjectionView } from './components/projectionview';
import { ContextWrapper } from './AppContext';
import MyViz from './components/visualizationbody';

function App() {

  return (
    <div className="App">
      <ContextWrapper>
        <MyNavbar />
        <MyViz />
      </ContextWrapper>


    </div>
  );
}

export default App;