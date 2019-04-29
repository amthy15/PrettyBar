'use strict';

// Webpack removes comments, so this shall be riddled with them.

// Boilerplate
import React from 'react';
import { hot } from "react-hot-loader";

// CSS
import "./i3.css";

// Give me the ability to run shit
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Connecting to the i3 socket
const ipc = require('node-ipc');

class I3 extends React.Component{
	// Create this component, with startup status
	constructor(props){
		super(props);
		this.state = {
			workspaces: undefined
		};
	}

	// When this component is ready, do some startup.
	componentDidMount(){
		const i3 = require('i3').createClient();
		// In development, I run the app as a full window.
		// These lines move the window to my desktop of choice.
		// i3.command('move container to workspace 5');
		// i3.command('workspace 5');
		i3.on('workspace', this.makeBound(this, this.handleWorkspaceEvent));
		i3.workspaces((err, workspaces)=>{
			console.log(workspaces);
			let result = err ? undefined : workspaces;
			this.setState({
				workspaces: result
			});
		});
	}

	getIndexOfWorkspaceWithNum(num, workspaces){
		for (let index of Object.keys(workspaces)) {
			const workspace = workspaces[index];
			if(workspace.num === num)
				return index;
		}
		return null;
	}

	// We've recieved an event from i3 - What do?
	handleWorkspaceEvent(event){
		console.log('Workspace Event: ', event);
		switch (event.change) {
			case 'focus':
				console.log('FOCUS CURRENT, UNFOCUS OLD IF EXISTS');
				// Copy this.state.workspaces for editing - side effect, converts to obj.
				let workspaces = Object.assign({}, this.state.workspaces);
				if(event.old){
					// unfocus the old workspace
					workspaces[this.getIndexOfWorkspaceWithNum(event.old.num, workspaces)].focused = false;
				}
				// Focus the newly focused workspace
				workspaces[this.getIndexOfWorkspaceWithNum(event.current.num, workspaces)].focused = true;
				// Replace existing state with edited state. (convert obj back to array)
				this.setState({workspaces: Object.values(workspaces)});
				break;
			case 'init':
				console.log('CREATE CURRENT');
				// Put the new workspace into state so we know about it
				console.log(this);
				this.setState({workspaces: [...this.state.workspaces, event.current]});
				break;
			case 'empty':
				console.log('DELETE CURRENT');
				workspaces = Object.assign({}, this.state.workspaces);
				delete workspaces[this.getIndexOfWorkspaceWithNum(event.current.num, workspaces)];
				this.setState({workspaces: Object.values(workspaces)});
				break;
			case 'urgent':
				console.log('URGNET!');
				break;
			default:
		}
	}

	makeBound(that, funkyFunction){
		return function(){
			return funkyFunction.apply(that, arguments);
		}
	}

	render(){
		if(!this.state.workspaces){
			return (<span>Workspaces Undefined - Startup or Error</span>)
		}
		let result = []
			.concat(this.state.workspaces)
			.sort((a,b) => {return a.num - b.num})
			.map( workspace => {
				let classes = ['workspace'];
				if(workspace.focused)
					classes.push('focused');
				return (
					<span className={classes.join(' ')} key={workspace.name}>
						{workspace.name}
					</span>
				);
			});
		return (
			<span className="I3">
				{result}
			</span>
		);
	}
}

export default hot(module)(I3);
