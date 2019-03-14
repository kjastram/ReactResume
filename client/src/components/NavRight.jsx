import React from 'react'
import DoubleArrowsRight from './DoubleArrowsRight'
import { Link } from 'react-router-dom'

const NavRight = (props) => {
    return (
        <div id="Middle-right-grid">
            <Link to="/MySkills" id="arrows">
                <div >
                    <DoubleArrowsRight color='#979797' />
                </div>
            </Link>
            <p id="arrows-text">{props.children}</p>
        </div>
    )
}

export default NavRight
