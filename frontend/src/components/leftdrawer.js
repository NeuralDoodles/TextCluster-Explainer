import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Upload } from './upload';

const drawerWidth = 300;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function LeftDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(open===true?false:true)

  };

  const handleDrawerClose = () => {
    setOpen(false);
  };




  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <IconButton
            onClick={handleDrawerOpen}
            edge="start"
            sx={{mt:2, ml: 0,  mr: 0, ...(open ) }}
          >
            
            <p style={{fontSize: 16}}>Upload</p>
          </IconButton>
      <Drawer
        sx={{
          width: 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >

        <DrawerHeader>
          <IconButton id="uploadnavbutton" onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
            Upload Data
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Upload />
        <Divider />
        
      </Drawer>
    </Box>
  );
}
