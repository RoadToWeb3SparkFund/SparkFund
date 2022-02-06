import React from "react";
import Box from "@mui/material/Box";
import { Typography, Button, Modal, Backdrop } from "@mui/material";
import Account from "../Account/Account";
import FundingInfo from "./FundingInfo";
import { useMoralis } from "react-moralis";
import DEX from "../DEX/DEX";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  borderRadius: "20px",
  boxShadow: 24,
  p: 4
};

function BackerContainer() {
  const { isAuthenticated } = useMoralis();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="backer-container">
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" component="div" gutterBottom>
            Project Name
          </Typography>
        </Box>
        {isAuthenticated && (
          <Box onClick={handleOpen}>
            <Button variant="contained">Fund Project</Button>
          </Box>
        )}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          
        >
          <Box sx={modalStyle}>
            <Typography
              sx={{ marginBottom: "20px" }}
              id="modal-modal-title"
              variant="h4"
              component="h2"
            >
            </Typography>
            <DEX></DEX>
          </Box>
        </Modal>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <Typography variant="body1" component="div">
          Redeem by connecting your wallet if you backed this project.
        </Typography>
        <Box>
          <Account></Account>
        </Box>
      </Box>
      <FundingInfo></FundingInfo>
      <Box sx={{ marginTop: "40px", marginBottom: "100px" }}>
        <Typography variant="h5" component="div">
          Backers List
        </Typography>
      </Box>
    </div>
  );
}

export default BackerContainer;
