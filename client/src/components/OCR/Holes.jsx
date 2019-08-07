import React from 'react'
import Hole from './Hole'
import { TableBody, TableRow, TableHeaderColumn } from 'material-ui'

const Holes = (props) => {
    let holes = []
    for (let i = 1; i < 10; i++) {
        holes.push(
            <React.Fragment key={i}>
                <TableRow>
                    <TableHeaderColumn colSpan="8" style={{ textAlign: 'center' }}>
                        {`Hole #${i}`}
                    </TableHeaderColumn>
                </TableRow>
                <Hole holeData={props.data.filter((e => e.hole == i))} />
            </React.Fragment>)
    }
    return (holes)
}

export default Holes