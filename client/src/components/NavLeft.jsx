import React from 'react'
import DoubleArrowsLeft from './DoubleArrowsLeft'
import { Link } from 'react-router-dom'

const NavLeft = (props) => {
    return (
        <div id="Middle-left-grid">
            <p id="arrows-text">{props.children}</p>
            <Link to="/" id="arrows">
                <div >
                    <DoubleArrowsLeft />
                </div>
            </Link>
        </div>
    )
}

export default NavLeft
