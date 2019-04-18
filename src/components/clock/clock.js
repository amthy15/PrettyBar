'use strict';

// Boilerplate
import React from 'react';
import { hot } from "react-hot-loader";

// CSS
import "./clock.css";

class Clock extends React.Component{
	constructor(props){
		super(props);
		this.state = {time: this.getPrettyDate()};
	}
	tick(){
		this.setState({time: this.getPrettyDate()});
	}
	componentDidMount(){
		this.intervalID = setInterval(
			() => this.tick(),
			1000
		);
	}
	getPrettyDate(){
		let prettyDate = new Date();
		return prettyDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
	}
	render(){
		return (
			<span className="clock">
				time: {this.state.time}
			</span>
		);
	}
}

export default hot(module)(Clock);
