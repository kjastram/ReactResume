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
    desciption: "I can effectively use essential tools like NPM, and am comfortable with asynchronous programming concepts essential to Node.js.",

},
{
    skill: "Java",
    desciption: "Java was my foundation in learning OOP principles and writing clean structured code. I would love the opportunity to use my Java knowledge in Android development.",
},
{
    skill: "React",
    desciption: "My first experience with React was in implementing internationalization support for a data visualization company using React. I love creating clean resuable components, and am capable with popular libraries like React Router and Redux.",
},
{
    skill: "Python",
    desciption: "I am able to use python in various ML and statistical applications and visualizations using Matplotlib.",
},
{
    skill: "R",
    desciption: "I am proficient at using R in data manipulation and visualization. It is a great tool for manipulating large sets of data.",
},
{
    skill: "MongoDB",
    desciption: "I am adept at creating RESTful services that manipulate the MongoDB database, primarily with the Node Mongoose package.",
},
{
    skill: "Express",
    desciption: "Express applications are ideal for creating RESTful endpoints. On top of that, Express makes creating custom middleware and serving static content to the client easy and straightforward.",
},
{
    skill: "C",
    desciption: "Learning C as my introduction to software engineering was important to an understanding of computer architecture and ultimately better full stack development skills. I also enjoy working with embedded systems and gathering data with IoT devices.",
},
{
    skill: "HTML&CSS",
    desciption: "Solid grasp of CSS and HTML is essential for any front end development.",
},
{
    skill: "Javascript",
    desciption: "Javascript is the common language used in MERN stack technologies. My knowledge of general OOP principles as well as the DOM translates well into solid JS code.",
},
]