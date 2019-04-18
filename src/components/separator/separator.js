'use strict';

// Boilerplate
import React from 'react';
import { hot } from "react-hot-loader";

// CSS
import "./separator.css";

class Separator extends React.Component{
	constructor(props){
		super(props);
		// this.state = {key: value};
	}
	componentDidMount(){
		// called when component mounts.
	}
	myCustomFunction(){
		// call with `this.myCustomFunction()`
	}
	render(){
		return (
			<span className="Separator">
			</span>
		);
	}
}

export default hot(module)(Separator);
