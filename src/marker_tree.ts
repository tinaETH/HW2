import { Location, Marker, isNW, isNE, isSE, isSW } from './marker';

/**
 * Node in a tree that is either a leaf (an individual marker) or a 4-way
 * split into NW/NE/SE/SW quadrants at a given location. The empty tree is
 * represented by null.
 */
export type Node =
    {kind: "marker", marker: Marker}
  | {kind: "split", at: Location,
     nw: Node|null, ne: Node|null, se: Node|null, sw: Node|null};


/**
 * Returns the root of a new tree containing the given marker. If the new marker
 * is at the exact position of an existing marker, then this is treated as an
 * update of that marker instead.
 */
export const insertMarker = (marker: Marker, root: Node|null): Node => {
  if (root === null) {
    return {kind: "marker", marker};
  } else if (root.kind === "marker") {
    const marker2 = root.marker; // existing marker
    if (marker.location.x === marker2.location.x &&
        marker.location.y === marker2.location.y) {
      return {kind: "marker", marker};
    } else { 
      const at: Location = {
        x: (marker.location.x + marker2.location.x) / 2,
        y: (marker.location.y + marker2.location.y) / 2
      };
      const marker1Node: Node = {kind: "marker", marker: marker};
      const marker2Node: Node = {kind: "marker", marker: marker2};
      return {kind: "split", at,
        nw: isNW(marker.location, at) ? marker1Node :
            isNW(marker2.location, at) ? marker2Node : null,
        ne: isNE(marker.location, at) ? marker1Node :
            isNE(marker2.location, at) ? marker2Node : null,
        se: isSE(marker.location, at) ? marker1Node :
            isSE(marker2.location, at) ? marker2Node : null,
        sw: isSW(marker.location, at) ? marker1Node :
            isSW(marker2.location, at) ? marker2Node : null,
      }
    }
  } else {
    if (isNW(marker.location, root.at)) {
      return {kind: "split", at: root.at, nw: insertMarker(marker, root.nw),
              ne: root.ne, se: root.se, sw: root.sw};
    } else if (isNE(marker.location, root.at)) {
      return {kind: "split", at: root.at, ne: insertMarker(marker, root.ne),
              nw: root.nw, se: root.se, sw: root.sw};
    } else if (isSE(marker.location, root.at)) {
      return {kind: "split", at: root.at, se: insertMarker(marker, root.se),
              nw: root.nw, ne: root.ne, sw: root.sw};
    } else {
      return {kind: "split", at: root.at, sw: insertMarker(marker, root.sw),
              ne: root.ne, se: root.se, nw: root.nw};
    }
  }
};


/** Describes a rectangular are in the plane. */
export type Rectangle = {minX: number, maxX: number, minY: number, maxY: number};

/** Determines if the given location is inside the given rectangle. */
const inRect = (loc: Location, rect: Rectangle): boolean => {
  return rect.minX <= loc.x && loc.x <= rect.maxX &&
         rect.minY <= loc.y && loc.y <= rect.maxY;
}

/** Returns all markers inside the given rectangle. */
export const findMarkers = (rect: Rectangle, root: Node|null): Array<Marker> => {
  if (root == null) {
    return [];
  } else if (root.kind === "marker") {
    return inRect(root.marker.location, rect) ? [root.marker] : [];
  } else {
    let markers: Array<Marker> = [];
    if (!(root.at.x < rect.minX || root.at.y < rect.minY))
      markers = markers.concat(findMarkers(rect, root.nw));
    if (!(rect.maxX < root.at.x || root.at.y < rect.minY))
      markers = markers.concat(findMarkers(rect, root.ne));
    if (!(rect.maxX < root.at.x || rect.maxY < root.at.y))
      markers = markers.concat(findMarkers(rect, root.se));
    if (!(root.at.x < rect.minX || rect.maxY < root.at.y))
      markers = markers.concat(findMarkers(rect, root.sw));
    return markers;
  }
}


/** Returns a tree with any markers at the given location removed. */
export const deleteMarker = (loc: Location, root: Node|null): Node|null => {
  if (root == null) {
    return null;
  } else if (root.kind === "marker") {
    if (root.marker.location.x === loc.x && root.marker.location.y === loc.y) {
      return null;
    } else {
      return root;  // not found
    }
  } else {
    if (isNW(loc, root.at)) {
      return {kind: "split", at: root.at, nw: deleteMarker(loc, root.nw),
              ne: root.ne, se: root.se, sw: root.sw};
    } else if (isNE(loc, root.at)) {
      return {kind: "split", at: root.at, ne: deleteMarker(loc, root.ne),
              nw: root.nw, se: root.se, sw: root.sw};
    } else if (isSE(loc, root.at)) {
      return {kind: "split", at: root.at, se: deleteMarker(loc, root.se),
              nw: root.nw, ne: root.ne, sw: root.sw};
    } else {
      return {kind: "split", at: root.at, sw: deleteMarker(loc, root.sw),
              nw: root.nw, ne: root.ne, se: root.se};
    }
  }
}