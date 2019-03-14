import React from 'react'
import { Link } from 'react-router-dom';

const Skill = (props) => {
    return (
        <Link className="skill" style={{ backgroundColor: props.color }} to={"/MySkills/" + props.children}>
            <p>{props.children}</p>
        </Link>
    )
}

export default Skill