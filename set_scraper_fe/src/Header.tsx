import { AppBar, Box, IconButton, Toolbar, Typography } from "@material-ui/core";

export const Header = () => {
  return (
    <div>
      <AppBar component="nav">
        <Toolbar
        style={{textAlign: "center"}}>
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
            style={{margin: "0 auto", fontWeight: "bold"}}
            variant="h2"
            
            // component="div"
            // sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            SET SCRAPER
          </Typography>
          {/* <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                {item}
              </Button>
            ))}
          </Box> */}
        </Toolbar>
      </AppBar>
    </div>
  );
}