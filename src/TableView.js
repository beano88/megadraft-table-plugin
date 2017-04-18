import React, {Component} from "react";

import * as Table from "reactabular-table";
import { cloneDeep, findIndex } from 'lodash';
import * as edit from 'react-edit';


export default class TableView extends Component {

  constructor(props) {
    super(props);
    let columns = this.buildColumns(props.rows);
    let rows = this.buildRows(props.rows, columns);
    this.state = {
      columns: columns,
      rows: rows
    };

  }

  buildColumns(rows) {
    let columns = [];
    const editable = edit.edit({
      isEditing: ({ columnIndex, rowData }) => columnIndex === rowData.editing,
      onActivate: ({ columnIndex, rowData }) => {
        const index = findIndex(this.state.rows, { id: rowData.id });
        const rows = cloneDeep(this.state.rows);

        rows[index].editing = columnIndex;

        this.setState({ rows });
      },
      onValue: ({ value, rowData, property }) => {
        const index = findIndex(this.state.rows, { id: rowData.id });
        const rows = cloneDeep(this.state.rows);

        rows[index][property] = value;
        rows[index].editing = false;

        this.setState({ rows });
      }
    });

    for(let rowIndex=0; rowIndex < rows[0].length; rowIndex++) {
      let propertyName = "c" + rowIndex;
      columns.push({property: propertyName, cell: {transforms: [editable(edit.input())]}});
    }
    return columns;
  }

  buildRows(rows, columns) {
    let newRows = [];
    for(let rowIndex=0 ; rowIndex< rows.length; rowIndex++) {
      let row = {};
      for(let columnIndex=0; columnIndex < rows[rowIndex].length; columnIndex++) {
        let propertyName = columns[columnIndex].property;
        row[propertyName] = rows[rowIndex][columnIndex];
        row["id"] = this.buildRowId(propertyName, rowIndex, columnIndex);
      }
      if(Object.keys(row).length !== 0) {
        newRows.push(row);
      }

    }
    return newRows;
  }

  buildRowId(propertyName, rowIndex, columnIndex) {
    return propertyName + rowIndex + "-"+ columnIndex;
  }

  buildPropertyName(columnIndex) {
    return "c" + columnIndex;
  }

  render() {
    return (
        <Table.Provider columns={this.state.columns} >
          <Table.Body rows={this.state.rows} rowKey="id" />
        </Table.Provider>
          );
  }
}