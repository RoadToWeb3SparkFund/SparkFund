import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import BackerContainer from "./BackerContainer";

function ProjectPage() {
  return (
    <div className="ProjectPage">
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        <Typography variant="h2" component="div" gutterBottom>
          Spark Fund
        </Typography>
        <Typography variant="h5" component="div" gutterBottom>
          TL:DR
        </Typography>
        <Typography variant="body1" component="div">
          Here is some project info Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
          irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
          fugiat nulla pariatur.
        </Typography>
      </Box>
      <Box sx={{ marginTop: "40px" }}>
        <BackerContainer></BackerContainer>
      </Box>
    </div>
  );
}

export default ProjectPage;
