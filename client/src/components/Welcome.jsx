import React, { Component } from 'react';
import NavRight from './NavRight';


export default class Welcome extends Component {
    render() {
        return (
            <React.Fragment>
                <NavRight>My Skills</NavRight>
                <div id="Intro">
                    <div id="Intro-1">
                        <p>
                            Hello.
                        </p>
                        <p>
                            I am a Software Engineer with interests including but not limited to:
                        </p>
                    </div>
                    <div id="Intro-2">
                        <p>
                            Web Design
                        </p>
                        <p>
                            Embedded Systems
                        </p>
                        <p>
                            Data Science
                        </p>
                        <p>
                            Machine Learning
                        </p>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
