import React, { Component, MouseEvent } from 'react';
import { Location, Marker } from './marker';
import { Editor } from './Editor';
import { Node, findMarkers, insertMarker, deleteMarker } from './marker_tree';
import campusMap from './img/campus_map.jpg';


// Radius of the circles drawn for each marker.
const RADIUS: number = 30;


type AppProps = {};  // no props

type AppState = {
  markers: Array<Marker>;
  selected: number;        // index into array or -1 if nothing selected
  newLocation?: Location;  // click after a selection is made
};


/** Top-level component that displays the entire UI. */
export class App extends Component<AppProps, AppState> {
  root: Node|null;  // fast lookup of this.state.markers
                    // must contain exactly those markers!!

  constructor(props: AppProps) {
    super(props);

    this.state = {markers: [
        {name: "Picnic", color: "red", location: {x: 2400, y: 1500}},
        {name: "Free Lemonade", color: "orange", location: {x: 1900, y: 900}},
        {name: "Poetry Reading", color: "blue", location: {x: 2300, y: 1000}}
      ], selected: -1};

    // Put the markers into a tree for easier searching.
    this.root = null;
    for (const m of this.state.markers)
      this.root = insertMarker(m, this.root);
  }

  render = (): JSX.Element => {
    return <div>
        <svg id="svg" width="866" height="593" viewBox="0 0 4330 2964"
            onClick={this.doMapClick}>
          <image href={campusMap} width="4330" height="2964"/>
          {this.renderMarkers()}
        </svg>
        {this.renderEditor()}
      </div>;
  };

  /** Returns an SVG element for each marker. */
  renderMarkers = (): Array<JSX.Element> => {
    const elems: Array<JSX.Element> = [];
    for (let i = 0; i < this.state.markers.length; i++) {
      const m = this.state.markers[i];
      elems.push(<circle cx={m.location.x} cy={m.location.y} fill={m.color} r={RADIUS}
          stroke={'white'} strokeWidth={10} key={i}/>)
    }
    const loc = this.state.newLocation;
    if (loc) {
      elems.push(<circle cx={loc.x} cy={loc.y} fill="rgba(100, 100, 100, 0.25)" r={2*RADIUS}
          stroke={'black'} strokeWidth={10} key="new"/>)
    }
    return elems;
  };

  renderEditor = (): JSX.Element => {
    if (this.state.selected < 0) {
      return <div></div>;  // nothing
    } else {
      const marker = this.state.markers[this.state.selected];
      return <Editor marker={marker} moveTo={this.state.newLocation}
          onSaveClick={this.doEditSaveClick}
          onCancelClick={this.doEditCancelClick}/>
    }
  }

  doEditSaveClick = (name: string, color: string, location: Location): void => {
    if (this.state.selected < 0)
      throw new Error('uh oh! trying to save with nothing selected!');

    // Create a new marker containing the provided fields.
    const marker: Marker = {name, color, location: location};

    // Make a new array of markers that replaces the selected one with this.
    const before = this.state.markers.slice(0, this.state.selected);
    const after = this.state.markers.slice(this.state.selected + 1);
    const markers = before.concat(marker).concat(after);

    // Update to show the new markers.
    this.setState({markers, newLocation: undefined});

    // Update the tree to allow fast lookup of these markers. To do this, we
    // must remove the old marker and insert the new one. (Note that the tree
    // will temporarily not match this.state.markers. Really, we should do this
    // change to this.root in componentDidUpdate.)
    const selected = this.state.markers[this.state.selected];
    this.root = insertMarker(marker, deleteMarker(selected.location, this.root));
  };

  doEditCancelClick = (): void => {
    this.setState({selected: -1, newLocation: undefined});
  };

  doMapClick = (evt: MouseEvent<SVGElement>): void => {
    const svg = document.getElementById('svg');
    if (svg === null)
      throw new Error('svg element not found!')

    // Find the map coordinates of where the user clicked.
    const r = svg.getClientRects()[0];
    const x = (4330 / 866) * (evt.clientX - r.x);
    const y = (2964 / 593) * (evt.clientY - r.y);

    // Try to find what they clicked on (if anything).
    const rect = {minX: x - RADIUS, maxX: x + RADIUS,
                  minY: y - RADIUS, maxY: y + RADIUS}
    const markers = findMarkers(rect, this.root);
    if (markers.length === 0) {
      if (this.state.selected >= 0)
        this.setState({newLocation: {x, y}})
    } else {
      const m = markers[0];  // use the first one
      this.setState({
        selected: findIndex(m.location, this.state.markers),
        newLocation: undefined
      });
    }
  };
}


/**
 * Returns the index of the marker with the given location. This will throw an
 * Error if no marker is at this location.
 */
const findIndex = (loc: Location, markers: Array<Marker>): number => {
  for (let i = 0; i < markers.length; i++) {
    const m = markers[i];
    if (m.location.x === loc.x && m.location.y === loc.y)
      return i;
  }
  throw new Error(`no marker found at (${loc.x}, ${loc.y})`);
};
