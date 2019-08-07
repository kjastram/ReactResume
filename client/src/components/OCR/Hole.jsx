import React from 'react'
import Rows from './Rows';
import { TableRow } from 'material-ui'


const Hole = (props) => {
    let rows = []
    for (let i = 0; i < 10; i++) {
        rows.push(<TableRow key={i}><Rows key={i * 11} rowData={
            props.holeData.filter((e => e.row == i))
        } /></TableRow>)
    }
    return (rows)
}

export default Hole