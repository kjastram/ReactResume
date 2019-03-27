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
                        <Skill>Node.js</Skill>
                        <Skill>Python</Skill>
                        <Skill>React</Skill>
                        <Skill>R</Skill>
                        <Skill>MongoDB</Skill>
                        <Skill>Java</Skill>
                        <Skill>Express</Skill>
                        <Skill>C</Skill>
                        <Skill>HTML&CSS</Skill>
                        <Skill>Javascript</Skill>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
