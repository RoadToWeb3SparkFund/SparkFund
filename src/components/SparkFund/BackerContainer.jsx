import React from "react";
import Box from "@mui/material/Box";
import { Typography, Button, Modal, Backdrop } from "@mui/material";
import Account from "../Account/Account";
import DexModal from "./DexModal";
import FundingInfo from "./FundingInfo";
import { useMoralis } from "react-moralis";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
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
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Text in a modal
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
            </Typography>
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
          Redeem by connecting your wallet if you backend this project.
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
