import React, { Component } from 'react'
import SingleArrowDown from './SingleArrowDown'
import ContactForm from './ContactForm';

export default class Footer extends Component {
    render() {
        return (
            <div id="Footer" >
                <div id="arrows" onClick={this.props.toggleContactForm}>
                    <SingleArrowDown />
                </div>
                <p id="arrows-text">Get In Contact</p>

                <ContactForm
                    visibility={this.props.contactFormVisible}
                    toggleContactForm={this.props.toggleContactForm}
                    contactFormValue={this.props.contactFormValue}
                    handleChangeContactForm={this.props.handleChangeContactForm}
                />
            </div>
        )
    }
}
