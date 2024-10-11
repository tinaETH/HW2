import React, { Component } from 'react';
import { Location, Marker } from './marker';
// TODO: add imports as needed

type EditorProps = {
  /** The marker that the user wants to edit. */
  marker: Marker;

  /** If provided, let the user move to this location. */
  moveTo?: Location; // Note: not needed until task 3

  /** Callback to invoke when the user wants to cancel editing. */
  onCancelClick: () => void;

  /** Calback to invoke when the user wants to save the edit. */
  onSaveClick: (name: string, color: string, loc: Location) => void;
};

type EditorState = {
  name: string;
  color: string;
  // TODO: add more later
};


/** Component that allows the user to edit a marker. */
export class Editor extends Component<EditorProps, EditorState> {
  constructor(props: EditorProps) {
    super(props);

    this.state = {name: props.marker.name, color: props.marker.color};
  }

  componentDidUpdate = (oldProps: EditorProps, _oldState: EditorState): void => {
    // If the App changed our props (so we are now editing a new Marker), then
    // we should update our state to show its name and color instead.
    if (oldProps !== this.props) {
      this.setState({name: this.props.marker.name, color: this.props.marker.color});
    }
  };

  
  render = (): JSX.Element => {
    return <div>
        <p>Name: {this.state.name}</p>
        <p>Color: {this.state.color}</p>
        <select name='color' id='color'>
        
        </select>
      </div>;
  };

  //onsaveclick
  //oncancelclick event hadlers
// paramaters for the call back function
//save will use the call back fucntion to save the name 
//color will invoce a select so that a drop down will come up with the colors array 
// The oncancel click will remove the ditor from the scree. 
}