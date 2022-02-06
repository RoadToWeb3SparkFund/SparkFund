import React from "react";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";

function FundingInfo() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "40px"
      }}
    >
      <Box>
        <Typography variant="body1" component="div" gutterBottom>
          FUNDS RAISED
        </Typography>
        <Typography variant="h4" component="div" gutterBottom>
          60,000 DAI
        </Typography>
        <Typography variant="body1" component="div" gutterBottom>
          10,000 DAI Upfront <br></br>
          90,000 DAI streamed over 12 months via Superfluid
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1" component="div" gutterBottom>
          FUNDING GOAL
        </Typography>
        <Typography variant="h4" component="div" gutterBottom>
          100,000 DAI
        </Typography>
      </Box>
    </Box>
  );
}

export default FundingInfo;
