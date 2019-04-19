'use strict';

// Boilerplate
import React from 'react';
import { hot } from "react-hot-loader";

// CSS
import "./i3.css";

// Give me the ability to run shit
const util = require('util');
const exec = util.promisify(require('child_process').exec);

class I3 extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			socket: 'yeety'
		};
	}
	componentDidMount(){
		called when component mounts.
		exec('i3 --get-socket').then(stdout => {
			this.setState({
				socket: stdout
			});
		});
	}
	render(){
		return (
			<span className="I3">
				Socket: {this.state.socket}
			</span>
		);
	}
}

export default hot(module)(I3);
