import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CreateDataset from './modals/CreateDataset';
import CreateCollection from './modals/CreateCollection';
import DeleteCollection from './modals/DeleteCollection';
import DatasetSettings from './modals/DatasetSettings';
import { hideModal } from '../actions/activeModal';

require('./DashboardModal.scss');

class DashboardModal extends Component {

  constructor() {
    super();
    this.handleOnCancel = this.handleOnCancel.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnCancel() {
    this.props.dispatch(hideModal());
  }

  handleOnSubmit(action, keepModal) {
    this.props.dispatch(action);
    if (!keepModal) {
      this.props.dispatch(hideModal());
    }
  }

  renderActiveModal() {
    const containerClassName = 'DashboardModal';

    if (!this.props.activeModal) {
      // No modal active
      return null;
    }
    switch (this.props.activeModal.modal) {
      case 'create-dataset':
        return (
          <CreateDataset
            onCancel={this.handleOnCancel}
            onSubmit={this.handleOnSubmit}
            containerClassName={containerClassName}
          />
        );
      case 'create-collection':
        return (
          <CreateCollection
            onCancel={this.handleOnCancel}
            onSubmit={this.handleOnSubmit}
            containerClassName={containerClassName}
            entities={this.props.activeModal.entities}
            collections={this.props.collections || {}}
          />
        );
      case 'delete-collection':
        return (
          <DeleteCollection
            onCancel={this.handleOnCancel}
            onSubmit={this.handleOnSubmit}
            containerClassName={containerClassName}
            collection={this.props.activeModal.collection || {}}
          />
        );
      case 'dataset-settings':
        return (
          <DatasetSettings
            onCancel={this.handleOnCancel}
            onSubmit={this.handleOnSubmit}
            id={this.props.activeModal.id}
            containerClassName={containerClassName}
          />
        );
      default: return null;
    }
  }

  render() {
    return this.renderActiveModal();
  }
}

DashboardModal.propTypes = {
  activeModal: PropTypes.shape({
    modal: PropTypes.string.isRequired,
    id: PropTypes.number,
    entities: PropTypes.array,
    collection: PropTypes.object,
  }),
  collections: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    activeModal: state.activeModal,
    collections: state.collections,
  };
}

export default connect(
  mapStateToProps
)(DashboardModal);