import React, { Component } from 'react'
import { CSSTransition } from 'react-transition-group'
import axios from 'axios'


export default class ContactForm extends Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)

        this.state = {
            contact: {
                name: '',
                email: '',
                number: '',
                message: ''
            }
        }
    }

    handleChange(event) {
        const contact = { ...this.state.contact }
        contact[event.currentTarget.name] = event.currentTarget.value
        this.setState({ contact })
    }

    handleSubmit = async (event) => {
        event.preventDefault();


        try {
            const response = await axios.post("/api/contact", this.state.contact);
            console.log(response)
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
    }

    render() {
        return (
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
        )
    }
}
