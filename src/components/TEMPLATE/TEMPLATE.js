'use strict';

// Boilerplate
import React from 'react';
import { hot } from "react-hot-loader";

// CSS
import "./TEMPLATE.css";

class TEMPLATE extends React.Component{
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
			<span className="TEMPLATE">
				TEMPLATE
			</span>
		);
	}
}

export default hot(module)(TEMPLATE);
