import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import myContext from "../context/myContext";
import { useContext } from "react";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  maxWidth: "100%",
  bgcolor: "background.paper",
  p: 4,
};

const Validate = ({ columns,columnDataTypes, setColumnDataTypes, setColumnDataTypesChanged
 }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {forceRerender, setRunCustomRenderer} = useContext(myContext);

  const handleSelectChange = (columnName, dataType) => {
    setColumnDataTypes((prevDataTypes) => ({
      ...prevDataTypes,
      [columnName]: dataType,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setColumnDataTypesChanged(true);
    setRunCustomRenderer(true);
  };

  return (
    <>
      <button
        className="btn  font-bold border border-black"
        onClick={handleOpen}
      >
        Validate columns
      </button>
      <div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <form onSubmit={handleSubmit}>
              <div className="flex justify-center items-center gap-6">
                {columns.map((column) => (
                  <div
                    key={column}
                  >
                    <div className="flex justify-center items-center flex-col">
                      <label className="whitespace-nowrap">{column}:</label>
                      <select
                        value={columnDataTypes[column] || "none"}
                        onChange={(e) =>
                          handleSelectChange(column, e.target.value)
                        }
                        className="border border-black rounded-sm"
                      >
                        <option value="none">None</option>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex w-full justify-center x mt-6">
              <button type="submit" className="btn black-btn" onClick={()=> forceRerender()}>
                Submit
              </button>
              </div>
            </form>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default Validate;
