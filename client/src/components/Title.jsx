import React, { Component } from "react";
import NavBar from "./Navbar";
class Title extends Component {
  render() {
    return (
      <div className="title-box text-center">
        <h1 id="header">Kyle Jastram</h1>
        <p id="subheader">
          I am a full stack software engineer looking for new opportunities.
        </p>
      </div>
    );
  }
}

export default Title;
