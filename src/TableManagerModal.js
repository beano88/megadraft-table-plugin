/*
 * Copyright (c) 2017, Globo.com <https://github.com/globocom/megadraft-table-plugin>
 *
 * License: MIT
 */

import React, {Component, PropTypes} from "react";

import Modal, {ModalBody, ModalFooter} from "backstage-modal";

import {HeaderStyle} from "./HeaderStyle";
import {Input} from "./FormComponents";
import {AddRemove} from "./AddRemove";
import {TableConfig} from "./TableConfig";
import {addRow, removeRow, addColumn} from "./TableManagerHelper";


const MIN_COLUMNS  = 1;
const MIN_ROWS = 1;

export default class TableManagerModal extends Component {

  static propTypes = {
    onCloseRequest: PropTypes.func,
    onSaveRequest: PropTypes.func
  }

  constructor(props) {
    super(props);
    this._onSaveRequest = ::this._onSaveRequest;
    this.onFormItemChange = ::this.onFormItemChange;
    this.addRow = ::this.addRow;
    this.removeRow = ::this.removeRow;
    this.addColumn = ::this.addColumn;
    this.removeColumn = ::this.removeColumn;
    this.state = {
      data: new TableConfig(this.props.data),
      selectedCell: [],
      errors: {
        title: []
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    const data = new TableConfig({...nextProps.data});
    this.setState({data});
  }

  _onSaveRequest() {
    if (this.isValid()) {
      this.props.onSaveRequest(this.state.data);
    }
  }

  isValid() {
    let newErrors = {title: []};
    if (this.state.data.title === "") {
      newErrors.title = ["Campo requirido"];
    }
    this.setState({errors: newErrors});
    return newErrors.title.length === 0;
  }

  _changeDataValue(prop, newValue) {
    const newData = { [prop]: newValue };
    const data = Object.assign({}, this.state.data, newData);
    this.setState({data});
  }

  onFormItemChange(e) {
    const {name, value} = e.target;
    this._changeDataValue(name, value);
  }

  _createNewRow() {
    if (this.state.data.rows.length > 0) {
      return Array.apply(null, new Array(this.state.data.rows[0].length)).map(x => "");
    } else {
      return [];
    }
  }

  _getRowPostion() {
    return this.state.selectedCell.length == 2 ? this.state.selectedCell[1] : null;
  }

  addRow() {
    const position = this._getRowPostion();
    const rows = addRow(this.state.data.rows, position);
    this._changeDataValue("rows", rows);
  }

  removeRow() {
    const position = this._getRowPostion();
    const rows = removeRow(this.state.data.rows, position);
    this._changeDataValue("rows", rows);
  }

  addColumn() {
    const position = this.state.selectedCell.length == 2 ? this.state.selectedCell[0] : null;

    const rows = addColumn(this.state.data.rows, position);
    this._changeDataValue("rows", rows);
  }

  removeColumn() {
    if (this.state.data.rows[0].length === MIN_COLUMNS) {
      return;
    }

    let columnNum;

    if (this.state.selectedCell.length == 2) {
      columnNum = this.state.selectedCell[0];
    } else {
      columnNum = this.state.data.rows[0].length - 1;
    }
    const rows = this.state.data.rows.map(row => {
      const newRow = [...row];
      newRow.splice(columnNum, 1);
      return newRow;
    });
    this._changeDataValue("rows", rows);
  }

  render() {
    const {data, errors} = this.state;
    return (
      <Modal className="table-manager-modal"
             title="Criar"
             isOpen={this.props.isOpen}
             onCloseRequest={this.props.onCloseRequest}
             width="90%">
        <ModalBody>
          <div className="table-manager-modal__form">
            <Input title="Título"
              name="title"
              value={data.title}
              errors={errors.title}
              onChange={this.onFormItemChange} />

            <HeaderStyle name="headerStyle"
              selectedOptions={data.headerStyle}
              onChange={this.onFormItemChange}/>

            <AddRemove
              className="add-remove-rows"
              title="Linhas"
              onAdd={this.addRow}
              onRemove={this.removeRow} />

            <AddRemove title="Colunas"
              className="add-remove-columns"
              onAdd={this.addColumn}
              onRemove={this.removeColumn} />

            <Input title="Fonte"
              name="source"
              value={data.source}
              onChange={this.onFormItemChange}
              isRequired={false} />

          </div>

          <div className="table-manager-modal__editable-table">"preview"</div>
        </ModalBody>
        <ModalFooter className="table-manager-modal__footer">
          <button className="table-manager-modal__add-button bs-ui-button bs-ui-button--background-blue bs-ui-button--small"
                  onClick={this._onSaveRequest}>Adicionar</button>
        </ModalFooter>
      </Modal>
    );
  }

}

