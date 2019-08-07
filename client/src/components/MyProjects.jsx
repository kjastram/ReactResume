import React from 'react';
import NavRight from './NavRight';
import Project from './Project';

export default function MyProjects() {
    return (
        <React.Fragment>
            <NavRight route="/">Welcome</NavRight>
            <div id="Projects-wrapper">
                <Project githubHref="https://github.com/kjastram/ReactResume">
                    <p>This Website</p>
                    <i>Resume Website I use to showcase personal projects and contact information.</i>
                    <i>Used Technologies: React, Sass, Express, Mongoose, nodemailer</i>
                </Project>
                <Project githubHref="https://github.com/kjastram" demoHref="/Ocr">
                    <p>Golf Scorecard OCR</p>
                    <i>Machine Learning Pipeline to read handwritten Golf scores in a score card template, as well as a React frontend to display JSON results.</i>
                    <i>Used Technologies: React, Python, Keras, OpenCV</i>
                </Project>
                <Project>
                    <p>More Projects Coming Soon...</p>
                </Project>
            </div>
        </React.Fragment>
    );
}