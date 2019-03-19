import React, { Component } from 'react';
import Skill from './Skill';
import NavLeft from './NavLeft';

export default class MySkills extends Component {
    render() {
        return (
            <React.Fragment>
                <NavLeft>Welcome</NavLeft>
                <div id="Skills-wrapper">
                    <div id="Skills-subgrid">
                        <Skill color="#000000">Node.js</Skill>
                        <Skill color="#000000">Python</Skill>
                        <Skill color="#000000">React</Skill>
                        <Skill color="#000000">R</Skill>
                        <Skill color="#000000">MongoDB</Skill>
                        <Skill color="#000000">Java</Skill>
                        <Skill color="#000000">Express</Skill>
                        <Skill color="#000000">C</Skill>
                        <Skill color="#000000">HTML&CSS</Skill>
                        <Skill color="#000000">Javascript</Skill>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
