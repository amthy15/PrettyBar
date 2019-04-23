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
			status: 'starting'
		};
	}

	// Take a commandID and payload, and format it for sending to i3
	i3format(command, payload){
		// It would not be hard to support big-endian system as well
		// But for now we're little-endian only. (so... All of x86 things really.)
		// Magic string = 6 bytes 'i3-ipc'
		// payload length: 4 bytes (32bit int)
		// command: 4 bytes (32bit int)
		// payload?
		let payloadLength = payload.length; // 1 byte per char
		// Create buffer of length
		const myBuffer = new Buffer(6+4+4+payloadLength);
		// Write i3 magic string
		myBuffer.write('i3-ipc', 0);
		// Write payload length
		myBuffer.writeInt32LE(payloadLength, 6);
		// Write command
		myBuffer.writeInt32LE(command, 10);
		// Write payload
		myBuffer.write(payload, 14);
		// return this tasty buffer
		return myBuffer;
	}

	// DEPRECATED
	// Take data recieved from i3 and parse it into something usable
	i3decode(buffer){
		// Goal: return JSON {command, payload}
		// The first 6 bytes are the magic string
		// The next 4 are the payload size.
		// This means, starting at 10 bytes out, we can read the command ID
		// const command = buffer.readInt32LE(10);
		// // Slice off the payload part
		// const payloadBuffer = buffer.slice(14, Buffer.byteLength(buffer));
		// // Convert the payload to JSON
		// console.log('PARSING: '+payloadBuffer.toString());
		// const payload = JSON.parse(payloadBuffer.toString());
		// // return
		// return {
		// 	command: command,
		// 	payload: payload
		// };
		console.log('Got Buffer');
		console.log(buffer.toString('hex'));
		const magicString = buffer.slice(0,6).toString();
		// This is wrong
		const payloadLength = buffer.slice(6, 10).readInt32LE();

		const commandBuffer = buffer.slice(10,14);
		const command = buffer.slice(10,14).readInt32LE();
		const commandRaw = buffer.slice(6,10).toString('hex');
		let isEvent = false;
		if(command & 0x80000000){ // if leftmost bit is set (event flag)
			isEvent = true;
			command = command & 0x7FFFFFFF; // remove leftmost bit
		}
		const payloadString = buffer.slice(14, payloadLength+14).toString();
		return {
			magicString,
			payloadLength,
			command,
			commandRaw,
			isEvent,
			payloadString
		};
	}

	// Given a buffer recieved from i3, decode it into messages
	onMessage(buffer){
		let remaining = buffer;
		// FIXME this is a safety to prevent infinite loops
		// caused by me not parsing payloadLength correctly
		let count = 10;
		// While there are messages left to parse...
		while(Buffer.byteLength(remaining) > 0 && count--){
			// The first 6 bytes are the magic string
			const ms = remaining.slice(0,6); // inclusive, exclusive. 0.1.2.3.4.5 = 13-ipc
			const mso = {
				original: ms,
				string: ms.toString()
			};
			// The next 4 bytes are *supposed* to be the payload length
			const payloadLength = remaining.slice(6,10).readInt32LE(); // 6.7.8.9
			// The next 4 bytes should be the command
			// ERROR: "event" type responses have two extra bytes in this region.
			// How to detect event? What do those two bytes mean? What?
			const command = remaining.slice(10,14); // 10.11.12.13
			const commando = {
				original: command,
				hex: command.toString('hex'),
				string: command.toString(),
				int: command.readInt32LE()
			};
			// 14 through 14+payloadLength is the payload
			const payload = remaining.slice(14,14+payloadLength); // length = 2; 14.15
			const payloado = {
				original: payload,
				hex: payload.toString('hex'),
				string: payload.toString()
			};
			// Remove what we have extracted from the buffer of remaining data
			// If event and we have the two mystery bytes, should be 16+payloadLength
			remaining = remaining.slice(14+payloadLength);
			// Return that which was extracted.
			this.handleMessage({
				mso,
				payloadLength,
				commando,
				payloado
			});
		}
		if(count===0){
			console.log("Hit safety catch");
		}
	}

	// Handle a message from i3
	handleMessage(message){
		// just print it
		console.log("Message recieved");
		console.log(message);
	}

	// When this component is ready, do some startup.
	componentDidMount(){
		// Get the i3 socket
		exec('i3 --get-socket').then(stdout => {
			// Validate socket address
			if(stdout.includes('i3/ipc-socket')){
				console.log('Acquired i3 socket address');
			}else{
				console.log('Could not acquire i3 socket address');
				return;
			}
			// Remove trailing newline
			let socketAddr = stdout.slice(0,-1);
			// report status
			this.setState({
				status: 'Got socket: '+socketAddr
			});
			// Establish IPC connection
			ipc.config.rawBuffer=true;
			ipc.connectTo('i3', socketAddr, ()=>{
				// Once we're connected, send some commands.
				ipc.of.i3.on('connect', ()=>{
					console.log('i3 IPC socket is connected.');
					ipc.of.i3.emit(
						this.i3format(0, 'move container to workspace 5')
					);
					ipc.of.i3.emit(
						this.i3format(0, 'workspace 5')
					);
					ipc.of.i3.emit(
						this.i3format(2, JSON.stringify(["workspace"]))
					);
				});
				// When we recieve commands, decode them. Decoder calls handler for us.
				ipc.of.i3.on('data', (buffer)=>{
					console.log("GOT DATA");
					this.onMessage(buffer);
				});
			});
		});
	}
	render(){
		return (
			<span className="I3">
				Status: {this.state.status}
			</span>
		);
	}
}

export default hot(module)(I3);
