import { AppBar, Box, IconButton, Toolbar, Typography } from "@material-ui/core";
import Login from "./components/Login";


export const Header = () => {
  return (
    <div>
      <AppBar component="nav" style={{boxShadow: "none", background: "transparent"}}>
        <Toolbar
        id={"app-toolbar"}
        style={{textAlign: "left"}}>
          {/* <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography
            style={{ fontWeight: "bold", paddingTop: 54}}
            variant="h2"
            
            // component="div"
            // sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            THE DOWNLOAD
          </Typography>
          {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                {item}
              </Button>
            ))}
          </Box> */}
          <div style={{position: "fixed", right: "20px", top: 20}}>
          <Login />
            </div>
          
        </Toolbar>
      </AppBar>
    </div>
  );
}