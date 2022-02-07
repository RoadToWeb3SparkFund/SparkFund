import React from "react";
import Box from "@mui/material/Box";
import { Typography, Paper } from "@mui/material";
import BackerContainer from "./BackerContainer";
import FundingInfo from "./FundingInfo";

function ProjectPage() {
  return (
    <div className="ProjectPage">
      <Box sx={{ width: "100%", maxWidth: 650 }}>
        <Typography variant="h3" component="div" gutterBottom>
          Metaverse my ride ($PIMP)
        </Typography>
        <Paper sx={{ marginTop: "40px" }} variant="outlined">
          <img src="/in-my-garage.jpeg" />
        </Paper>
        <Typography
          sx={{ marginTop: "20px" }}
          variant="h5"
          component="div"
          gutterBottom
        >
          TL:DR
        </Typography>
        <Typography variant="body1" component="div">
          As a crypto bro with a lambo, I know the value of a sick whip 🚗💨 But
          souped-up rides aren’t just for my massive garage. With the metaverse
          on the way, soon we’ll need the keys + cars to drift around our
          virtual world. Metaverse my ride ($PIMP) is an open source protocol
          for converting your daily-driver into a metaverse-ready roadster.
          Minivan? Nah man. Hyundai? Nice try. Tokenized Bugatti Veron? Cmonnnn
          I have the KNOWLEDGE to drive this vision, but need funding to make it
          a reality.
        </Typography>
        <br></br>
        <Typography variant="body1" component="div">
          Click the crowdfunding modal below to ride shotgun and turbo-charge
          this. Anyone with an Ethereum address can directly fund this vision,
          and own a proportional piece of the pie! Let’s hit the road.
        </Typography>
      </Box>
      <Box>
        <FundingInfo></FundingInfo>
      </Box>
      <Box sx={{ marginTop: "40px" }}>
        <BackerContainer></BackerContainer>
      </Box>
    </div>
  );
}

export default ProjectPage;
