import React from "react";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";
import Account from "../Account/Account";
import { useMoralis } from "react-moralis";

function BackerContainer() {
  const { isAuthenticated } = useMoralis();

  return (
    <div className="backer-container">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" component="div" gutterBottom>
            Project Name
          </Typography>
        </Box>
        {isAuthenticated && (
          <Box>
            <Button variant="contained">Fund Project</Button>
          </Box>
        )}
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
      <Box sx={{ marginTop: "40px", marginBottom: "100px" }}>
        <Typography variant="h5" component="div">
          Backers List
        </Typography>
      </Box>
    </div>
  );
}

export default BackerContainer;
