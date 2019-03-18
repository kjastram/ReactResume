import React, { Component } from 'react'
import { CSSTransition } from 'react-transition-group'
import axios from 'axios'
import Checkmark from './Checkmark'


export default class ContactForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            contactSent: false,
            contact: {
                name: '',
                email: '',
                number: '',
                message: ''
            }
        }
    }

    handleChange = (event) => {
        const contact = { ...this.state.contact }
        contact[event.currentTarget.name] = event.currentTarget.value
        this.setState({ contact })
    }

    handleSubmit = async (event) => {
        event.preventDefault();


        try {
            const response = await axios.post("/api/contact", this.state.contact);
        }
        catch (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error123', error.message);
            }
            console.log(error.config);
        }

        this.setState({
            contact: {
                name: '',
                email: '',
                number: '',
                message: ''
            }
        })
        this.setState({ contactSent: true })
        setTimeout(() => this.setState({ contactSent: false }), 2500)
    }

    render() {
        return (
            <React.Fragment>
                <CSSTransition in={this.state.contactSent} classNames="checkmark-logo" mountOnEnter unmountOnExit timeout={300}>
                    <div className="checkmark-logo">
                        <Checkmark />
                        <h4>Message Sent!</h4>
                    </div>
                </CSSTransition>
                <CSSTransition in={this.props.visibility} classNames="contact-form" unmountOnExit timeout={300}>
                    <form className="contact-form" onSubmit={this.handleSubmit}>
                        <div id="close" onClick={this.props.toggleContactForm} />

                        <p>Email</p>
                        <input
                            type="text"
                            name="email"
                            value={this.state.contact.email}
                            onChange={this.handleChange} />

                        <p>Name</p>
                        <input
                            type="text"
                            name="name"
                            value={this.state.contact.name}
                            onChange={this.handleChange} />

                        <p>Phone Number</p>
                        <input
                            type="text"
                            name="number"
                            value={this.state.contact.number}
                            onChange={this.handleChange} />

                        <label id="submit">
                            <input type="submit" id="submit-hide" />
                            <p>Send</p>
                        </label>
                        <p id="message-header"> Message</p>
                        <textarea
                            id="message-form"
                            type="text"
                            name="message"
                            value={this.state.contact.message}
                            onChange={this.handleChange} />
                    </form>

                </CSSTransition>
            </React.Fragment>
        )
    }
}
