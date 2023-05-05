import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import ExplanationDrawer from './rightdrawer';
import UploadDrawer from './leftdrawer';
import LabelSearch from './explanation'



function MyNavbar() {

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
    <Navbar bg="light" expand="lg">
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
  );
}

export default MyNavbar;


