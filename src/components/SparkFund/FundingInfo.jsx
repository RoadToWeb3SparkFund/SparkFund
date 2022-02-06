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
          18 ETH
        </Typography>
        <Typography variant="body2" component="div" gutterBottom>
          54391.14 USD
        </Typography>
      </Box>
      <Box>
        <Typography variant="body1" component="div" gutterBottom>
          FUNDING GOAL
        </Typography>
        <Typography variant="h4" component="div" gutterBottom>
          20 ETH
        </Typography>
        <Typography variant="body2" component="div" gutterBottom>
          60434.60 USD
        </Typography>
      </Box>
    </Box>
  );
}

export default FundingInfo;
