// // CustomHeader.js
// import React from "react";

// const CustomHeader = (props) => {
//   const handleHeaderClick = () => {
//     // Notify that the column header is clicked
//     props.onHeaderClick(props.column);
//   };

//   return (
//     <div onClick={handleHeaderClick}>
//       {props.displayName}
//     </div>
//   );
// };

// export default CustomHeader;

// CustomHeaderCheckbox.js
import React, { useState, useEffect } from "react";

const CustomHeaderCheckbox = ({ column, api }) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    const updateHeaderCheckbox = () => {
      const selectedNodes = api.getSelectedNodes();
      const isAllSelected = selectedNodes.length > 0 && selectedNodes.every(node => node.data[column.field] !== undefined);
      setIsChecked(isAllSelected);
    };

    api.addEventListener("selectionChanged", updateHeaderCheckbox);

    return () => {
      api.removeEventListener("selectionChanged", updateHeaderCheckbox);
    };
  }, [api, column.field]);

  const onCheckboxChange = () => {
    const allNodes = api.getModel().getRowNodes();
    const selectedNodes = [];

    allNodes.forEach(node => {
      if (node.data[column.field] !== undefined) {
        selectedNodes.push(node);
      }
    });

    if (isChecked) {
      selectedNodes.forEach(node => node.setSelected(false));
    } else {
      selectedNodes.forEach(node => node.setSelected(true));
    }
  };

  return (
    <div className="custom-header-checkbox">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onCheckboxChange}
      />
    </div>
  );
};

export default CustomHeaderCheckbox;
