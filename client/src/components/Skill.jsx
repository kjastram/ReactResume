import React from 'react'
import { Link } from 'react-router-dom';
//style={{ backgroundColor: props.color }}
const Skill = (props) => {
    return (
        <Link className="skill" to={"/MySkills/" + props.children}>
            <p>{props.children}</p>
        </Link>
    )
}

export default Skill