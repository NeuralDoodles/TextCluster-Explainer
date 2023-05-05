import React, { useContext, useState, useEffect} from 'react';
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Explain from './explanation'
import { AppContext } from '../AppContext';

const drawerWidth = 300;



const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start"
}));





export default function RightDrawer() {

  const appcontext = useContext(AppContext);
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(open===true?false:true)
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <IconButton
            onClick={handleDrawerOpen}
            edge="end"
            sx={{mt:2, ml: 0,  mr: 0, ...(open ) }}
          >
            
            <p style={{fontSize: 16}}>Explain</p>
          </IconButton>
      <Drawer
        sx={{
          width: 5,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth
          }
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
            Explanation
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Explain data= {appcontext.isinsidelasso} getexplain = {appcontext.getexplain} selected={appcontext.lassoed} />
        
        <Divider />
        
      </Drawer>
    </Box>
  );
}
