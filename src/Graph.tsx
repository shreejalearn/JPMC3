import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator, Row } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      price_abc: 'float',
      price_def: 'float',
      ratio: 'float',  // Add the 'ratio' field to the schema
      stock: 'string',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'float',
      // timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }

    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      // Configure Perspective Viewer attributes
      elem.setAttribute('view', 'y_line'); // Set the default view to y_line
      elem.setAttribute('column-pivots', '[]'); // No column pivots for this use case
      elem.setAttribute('row-pivots', '["timestamp"]'); // X-axis is based on timestamp
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]'); // Y-axis fields
      elem.setAttribute('aggregates', JSON.stringify({
        ratio: 'avg',  // Add 'avg' aggregate for the 'ratio' field
        lower_bound: 'avg',
        upper_bound: 'avg',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      const rows: Row[] = DataManipulator.generateRow(this.props.data);
      this.table.update(rows);
    }
  }
}

export default Graph;
