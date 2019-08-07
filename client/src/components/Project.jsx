import React from 'react';
import GithubLogo from './GithubLogo';

export default function Project(props) {
    let demoButtonId = "Demo-button"
    if (props.demoHref == null) demoButtonId = "Demo-button-disable"
    return (
        <div id="Project">
            {props.children}
            <GithubLogo href={props.githubHref} width="48px" />
            <a id={demoButtonId} href={props.demoHref}>Demo</a>
        </div>
    )
}
