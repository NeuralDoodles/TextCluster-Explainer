import React, { useContext, useState, useEffect} from 'react';
import Explain from './explanation'
import { AppContext } from '../AppContext';





export default function RightDrawer() {

  const appcontext = useContext(AppContext);
  return (

      
        <>
        <Explain data= {appcontext.isinsidelasso} getexplain = {appcontext.getexplain} selected={appcontext.lassoed} />
        
     

        </>
        
  );
}
