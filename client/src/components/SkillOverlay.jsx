import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import LogoSvg from './LogoSvg'


class SkillOverlay extends Component {

    getDescription(skill) {
        for (let s of skillDescriptions) {
            if (s.skill === skill) return s.desciption
        }
    }

    render() {
        return (
            <Link to="/MySkills" id="Overlay-Return">
                <div id="Overlay-Grid" >
                    <LogoSvg skill={this.props.match.params.id} width="256" fill="#ffffff" />
                    <p id="Text">{this.getDescription(this.props.match.params.id)}</p>
                </div>
            </Link>
        )
    }
}


export default SkillOverlay

const skillDescriptions = [{
    skill: "Node.js",
    desciption: "Node.js is an open-source, cross-platform JavaScript run-time environment that executes JavaScript code outside of a browser.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png"
},
{
    skill: "Java",
    desciption: "Java was my first intro to OOP.",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Java_programming_language_logo.svg/800px-Java_programming_language_logo.svg.png"
},
{
    skill: "React",
    desciption: "test",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/640px-React-icon.svg.png"
},
{
    skill: "Python",
    desciption: "test",
    logo: "https://www.python.org/static/opengraph-icon-200x200.png"
},
{
    skill: "R",
    desciption: "test",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/R_logo.svg/2000px-R_logo.svg.png"
},
{
    skill: "MongoDB",
    desciption: "test",
    logo: "https://webassets.mongodb.com/_com_assets/cms/mongodb-logo-rgb-j6w271g1xn.jpg"
},
{
    skill: "Express",
    desciption: "test",
    logo: "https://expressjs.com/images/express-facebook-share.png"
},
{
    skill: "C",
    desciption: "test",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/The_C_Programming_Language_logo.svg/1200px-The_C_Programming_Language_logo.svg.png"
},
{
    skill: "HTML&CSS",
    desciption: "test",
    logo: "http://www.bobbyberberyan.com/wp-content/uploads/2012/03/HTML5CSS3Logos.svg"
},
{
    skill: "Javascript",
    desciption: "Javascript is the common language used in MERN stack technologies. ",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png"
},
]