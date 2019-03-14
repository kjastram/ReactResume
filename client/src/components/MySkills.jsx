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
                        <Skill color="#2E7505">Node.js</Skill>
                        <Skill color="#9013FE">Python</Skill>
                        <Skill color="#4A90E2">React</Skill>
                        <Skill color="#D0021B">R</Skill>
                        <Skill color="#AEDE7E">MongoDB</Skill>
                        <Skill color="#50E3C2">Java</Skill>
                        <Skill color="#F5A623">Express</Skill>
                        <Skill color="#624311">C</Skill>
                        <Skill color="#F5238D">HTML&CSS</Skill>
                        <Skill color="#D8CD48">Javascript</Skill>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
