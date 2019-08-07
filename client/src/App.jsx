import React, { Component } from "react";
import { Route } from "react-router-dom";
import { AnimatedSwitch, spring } from 'react-router-transition'

import Welcome from "./components/Welcome";
import MySkills from "./components/MySkills";
import MyProjects from "./components/MyProjects";
import SkillOverlay from './components/SkillOverlay';
import Footer from './components/Footer'
import Header from './components/Header'

import "./styles/css/input.css";
import OcrTable from "./components/OCR/OcrTable";


export default class App extends Component {
  constructor(props) {
    super(props)

    this.toggleContactForm = this.toggleContactForm.bind(this)
    this.handleChangeContactForm = this.handleChangeContactForm.bind(this)
    this.bounce = this.bounce.bind(this)
    this.mapStyles = this.mapStyles.bind(this)


    this.state = {
      contactFormValue: "",
      contactFormVisible: false
    }
  }

  handleChangeContactForm(event) {
    this.setState({ contactFormValue: event.target.contactFormValue })
  }

  toggleContactForm() {
    if (this.state.contactFormVisible) this.setState(
      { contactFormVisible: false }
    )
    else if (!this.state.contactFormVisible) this.setState(
      { contactFormVisible: true }
    )
  }

  mapStyles(styles) {
    return {
      transform: `translateX(${styles.offset}%)`,
    };
  }

  bounce(val) {
    return spring(val, {
      stiffness: 330,
      damping: 22,
    });
  }

  bounceTransition = {
    atEnter: {
      offset: -100,
    },
    atLeave: {
      offset: -100,
    },
    atActive: {
      offset: 0,
    },
  };

  render() {
    return (
      <div>
        <Route path="/MySkills/:id" component={SkillOverlay} />
        <div id="Grid">
          <Header />
          <div id="Main">
            <AnimatedSwitch
              atEnter={this.bounceTransition.atEnter}
              atLeave={this.bounceTransition.atLeave}
              atActive={this.bounceTransition.atActive}
              mapStyles={this.mapStyles}
              className="route-wrapper"
            >
              <Route path="/Ocr" component={OcrTable} />
              <Route path="/MyProjects" component={MyProjects} />
              <Route path="/MySkills" component={MySkills} />
              <Route exact path="/" component={Welcome} />
            </AnimatedSwitch>
          </div>
          <Footer
            contactFormVisible={this.state.contactFormVisible}
            toggleContactForm={this.toggleContactForm}
            contactFormValue={this.state.contactFormValue}
            handleChangeContactForm={this.handleChangeContactForm} />
        </div>
      </div >
    );
  }
}
