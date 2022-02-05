import React from "react";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import Account from "../Account/Account";

function BackerContainer() {
  return (
    <div className="backer-container">
      <Box>
        <Typography variant="h4" component="div" gutterBottom>
          Project Name
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="body1" component="div">
          Redeem by connecting your wallet if you backend this project.
        </Typography>
        <Box>
          <Account></Account>
        </Box>
      </Box>
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h5" component="div">
          Backers List
        </Typography>
      </Box>
    </div>
  );
}

export default BackerContainer;
