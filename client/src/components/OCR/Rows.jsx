import React from 'react'
import { TableRowColumn } from 'material-ui'

const Rows = (props) => {
    const columnSearch = (columnName) => {
        if (props.rowData.find((e) => e.column == columnName)) {
            return <TableRowColumn>{props.rowData.find((e) => e.column == columnName).result}</TableRowColumn>
        }
        else return <TableRowColumn></TableRowColumn>
    }

    return (
        <React.Fragment>
            {columnSearch("From")}
            {columnSearch("Distance")}
            {columnSearch("ClubL")}
            {columnSearch("ClubR")}
            {columnSearch("L/R")}
            {columnSearch("S/P")}
            {columnSearch("Result")}
            {columnSearch("Recovery")}
        </React.Fragment>
    )
}

export default Rows